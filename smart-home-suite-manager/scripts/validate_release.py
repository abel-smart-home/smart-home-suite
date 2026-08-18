#!/usr/bin/env python3
"""Static integrity validation for Smart Home Suite release payload.

This intentionally uses only the Python standard library so it can run on a
clean GitHub runner before Docker images are built.
"""

from __future__ import annotations

import ast
import json
from pathlib import Path
import re
import sys

APP_DIR = Path(__file__).resolve().parents[1]
PAYLOAD = APP_DIR / "payload" / "smart_home_suite"
MODULES = PAYLOAD / "modules"


class ValidationError(RuntimeError):
    pass


def fail(message: str) -> None:
    raise ValidationError(message)


def app_version() -> str:
    text = (APP_DIR / "config.yaml").read_text(encoding="utf-8")
    match = re.search(r'^version:\s*"([^"]+)"\s*$', text, re.MULTILINE)
    if not match:
        fail("Could not read app version from config.yaml")
    return match.group(1)


def read_json(path: Path) -> dict:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception as err:
        fail(f"Invalid JSON {path.relative_to(APP_DIR)}: {err}")


def catalog_specs() -> list[dict[str, object]]:
    tree = ast.parse((PAYLOAD / "module_catalog.py").read_text(encoding="utf-8"))
    specs: list[dict[str, object]] = []

    for node in ast.walk(tree):
        if not isinstance(node, ast.Call):
            continue
        if not isinstance(node.func, ast.Name) or node.func.id != "ModuleSpec":
            continue
        spec: dict[str, object] = {}
        for keyword in node.keywords:
            if keyword.arg in {
                "module_id",
                "name",
                "version",
                "panel_path",
                "enabled_by_default",
            }:
                try:
                    spec[keyword.arg] = ast.literal_eval(keyword.value)
                except Exception:
                    fail(f"ModuleSpec {keyword.arg} must be a literal")
        specs.append(spec)

    if not specs:
        fail("No ModuleSpec entries found in module_catalog.py")
    return specs


def validate() -> None:
    version = app_version()

    manifest = read_json(PAYLOAD / "manifest.json")
    if manifest.get("version") != version:
        fail(
            f"Version mismatch: app={version} integration={manifest.get('version')}"
        )

    const_source = (PAYLOAD / "const.py").read_text(encoding="utf-8")
    if not re.search(
        rf'^VERSION:\s*Final\s*=\s*"{re.escape(version)}"\s*$',
        const_source,
        re.MULTILINE,
    ):
        fail(f"Core VERSION in const.py does not match app version {version}")

    required_root = [
        PAYLOAD / "__init__.py",
        PAYLOAD / "config_flow.py",
        PAYLOAD / "const.py",
        PAYLOAD / "diagnostics.py",
        PAYLOAD / "module_catalog.py",
        PAYLOAD / "module_manager.py",
        PAYLOAD / "sensor.py",
        PAYLOAD / "binary_sensor.py",
        PAYLOAD / "support_health.py",
        PAYLOAD / "translations" / "en.json",
        PAYLOAD / "translations" / "es.json",
        PAYLOAD / "brand" / "icon.png",
        PAYLOAD / "brand" / "logo.png",
        APP_DIR / "icon.png",
        APP_DIR / "logo.png",
    ]
    for path in required_root:
        if not path.is_file() or path.stat().st_size == 0:
            fail(f"Required file missing or empty: {path.relative_to(APP_DIR)}")

    specs = catalog_specs()
    catalog_ids = [str(spec.get("module_id", "")) for spec in specs]
    catalog_paths = [str(spec.get("panel_path", "")) for spec in specs]

    if len(catalog_ids) != len(set(catalog_ids)):
        fail("Duplicate module_id in module_catalog.py")
    if len(catalog_paths) != len(set(catalog_paths)):
        fail("Duplicate panel_path in module_catalog.py")

    descriptor_ids: list[str] = []
    descriptor_paths: list[str] = []

    for folder in sorted(p for p in MODULES.iterdir() if p.is_dir()):
        descriptor_path = folder / "module.json"
        init_path = folder / "__init__.py"
        if not descriptor_path.is_file():
            continue

        descriptor = read_json(descriptor_path)
        module_id = str(descriptor.get("id", ""))
        panel_path = str(descriptor.get("panel_path", ""))
        module_version = str(descriptor.get("version", ""))

        if module_id != folder.name:
            fail(
                f"Module folder/id mismatch: folder={folder.name} id={module_id}"
            )
        if descriptor.get("suite_version") != version:
            fail(
                f"{module_id}: suite_version {descriptor.get('suite_version')} != {version}"
            )
        if not re.fullmatch(r"\d+\.\d+\.\d+", module_version):
            fail(f"{module_id}: invalid module version {module_version!r}")
        if not panel_path:
            fail(f"{module_id}: missing panel_path")
        if not init_path.is_file():
            fail(f"{module_id}: missing __init__.py")

        source = init_path.read_text(encoding="utf-8")
        if "async_setup_module" not in source or "async_unload_module" not in source:
            fail(f"{module_id}: module lifecycle functions are missing")
        if "from ...const import VERSION as SUITE_VERSION" not in source:
            fail(
                f"{module_id}: runtime wrapper must consume the central Suite VERSION"
            )
        if re.search(r'^SUITE_VERSION\s*=\s*["\']', source, re.MULTILINE):
            fail(f"{module_id}: hard-coded SUITE_VERSION is not allowed")

        descriptor_ids.append(module_id)
        descriptor_paths.append(panel_path)

    if set(descriptor_ids) != set(catalog_ids):
        fail(
            "Module descriptors and module catalog differ: "
            f"descriptors={sorted(descriptor_ids)} catalog={sorted(catalog_ids)}"
        )

    if len(descriptor_paths) != len(set(descriptor_paths)):
        fail("Duplicate panel_path in module descriptors")

    spec_by_id = {str(spec["module_id"]): spec for spec in specs}
    for folder in sorted(p for p in MODULES.iterdir() if p.is_dir()):
        descriptor_path = folder / "module.json"
        if not descriptor_path.is_file():
            continue
        descriptor = read_json(descriptor_path)
        spec = spec_by_id[descriptor["id"]]
        if descriptor["panel_path"] != spec["panel_path"]:
            fail(
                f"{descriptor['id']}: catalog/descriptor panel_path mismatch"
            )

        expected_version = (
            descriptor.get("base_panel_version")
            if descriptor["id"] == "smart_home"
            else descriptor.get("version")
        )
        if expected_version != spec["version"]:
            fail(
                f"{descriptor['id']}: catalog version {spec['version']} "
                f"!= descriptor effective version {expected_version}"
            )

    required_issues = (
        "module_setup_failed",
        "smart_support_provider_unavailable",
    )
    for language in ("en", "es"):
        translation = read_json(PAYLOAD / "translations" / f"{language}.json")
        for issue_key in required_issues:
            issue = translation.get("issues", {}).get(issue_key, {})
            if not issue.get("title") or not issue.get("description"):
                fail(f"{language}: {issue_key} repair translation is incomplete")

    support_health_source = (PAYLOAD / "support_health.py").read_text(
        encoding="utf-8"
    )
    for required_token in (
        "enable_user",
        "disable_user",
        "EVENT_SERVICE_REGISTERED",
        "EVENT_SERVICE_REMOVED",
        "smart_support_provider_unavailable",
    ):
        if required_token not in support_health_source:
            fail(f"support_health.py is missing required token {required_token!r}")

    for filename in (
        "smart-home-panel.js",
        "smart-home-native.js",
        "smart-home-panel-runtime.js",
        "smart-home-card-layout.js",
        "smart-lighting-panel.js",
        "smart-lighting-layout.js",
        "smart-energy-advanced-panel.js",
        "smart-automations-panel.js",
        "smart-automations-layout.js",
        "smart-automations-runtime.js",
        "smart-support-panel.js",
    ):
        path = PAYLOAD / "frontend" / filename
        if not path.is_file() or path.stat().st_size < 1000:
            fail(f"Frontend missing or unexpectedly small: {filename}")

    smart_home_runtime = (PAYLOAD / "frontend" / "smart-home-panel-runtime.js").read_text(
        encoding="utf-8"
    )
    for required_token in (
        'SMART_HOME_RUNTIME_GUARD_VERSION = "1.0.0"',
        'SMART_HOME_RUNTIME_VERSION = "1.1.0"',
        'import "./smart-home-card-layout.js?v=100-module140";',
        'Object.getOwnPropertyDescriptor(proto, "narrow")',
        'if (current === next) return;',
    ):
        if required_token not in smart_home_runtime:
            fail(
                "smart-home-panel-runtime.js is missing required runtime token "
                f"{required_token!r}"
            )

    smart_home_cards = (PAYLOAD / "frontend" / "smart-home-card-layout.js").read_text(
        encoding="utf-8"
    )
    for required_token in (
        'SMART_HOME_CARD_LAYOUT_RUNTIME_VERSION = "1.0.0"',
        "card_layout.order",
        "extra_cards",
        "history/history_during_period",
        "move-smart-card",
    ):
        if required_token not in smart_home_cards:
            fail(
                "smart-home-card-layout.js is missing required feature token "
                f"{required_token!r}"
            )

    smart_home_wrapper = (
        PAYLOAD / "modules" / "smart_home" / "__init__.py"
    ).read_text(encoding="utf-8")
    for required_token in (
        'PANEL_RUNTIME_FILE = "smart-home-panel-runtime.js"',
        'CARD_LAYOUT_FILE = "smart-home-card-layout.js"',
        'MODULE_VERSION = "1.4.0"',
        'RUNTIME_VERSION = "1.1.0"',
        'RUNTIME_GUARD_VERSION = "1.0.0"',
        'CARD_LAYOUT_RUNTIME_VERSION = "1.0.0"',
        "?v=205-guard100-cards100-module140",
    ):
        if required_token not in smart_home_wrapper:
            fail(f"smart_home wrapper is missing required token {required_token!r}")

    smart_lighting_base = (PAYLOAD / "frontend" / "smart-lighting-panel.js").read_text(
        encoding="utf-8"
    )
    if 'const PANEL_VERSION = "1.0.3";' not in smart_lighting_base:
        fail("smart-lighting-panel.js must remain on validated base V1.0.3")

    smart_lighting_layout = (PAYLOAD / "frontend" / "smart-lighting-layout.js").read_text(
        encoding="utf-8"
    )
    for required_token in (
        'SMART_LIGHTING_LAYOUT_RUNTIME_VERSION = "1.2.0"',
        'SMART_LIGHTING_ORDERING_RUNTIME_VERSION = "1.1.0"',
        'SMART_LIGHTING_GLOBAL_ACTIONS_RUNTIME_VERSION = "1.1.0"',
        'SMART_LIGHTING_EFFECTIVE_VERSION = "1.3.0"',
        "move-lighting-area",
        "move-lighting-device",
        "lighting-global-turn-off",
        "lighting-global-turn-on",
        "move-lighting-global-button",
        "global_actions",
        "global_actions.position",
        "button_order",
        "active_color",
        "inactive_color",
        "collectGlobalEntities",
        "smart_lighting_panel.config",
    ):
        if required_token not in smart_lighting_layout:
            fail(
                "smart-lighting-layout.js is missing required feature token "
                f"{required_token!r}"
            )

    smart_lighting_wrapper = (
        PAYLOAD / "modules" / "smart_lighting" / "__init__.py"
    ).read_text(encoding="utf-8")
    for required_token in (
        'BASE_FRONTEND_FILE = "smart-lighting-panel.js"',
        'FRONTEND_FILE = "smart-lighting-layout.js"',
        'MODULE_VERSION = "1.3.0"',
        'BASE_PANEL_VERSION = "1.0.3"',
        'LAYOUT_RUNTIME_VERSION = "1.2.0"',
        'ORDERING_RUNTIME_VERSION = "1.1.0"',
        'GLOBAL_ACTIONS_RUNTIME_VERSION = "1.1.0"',
        "?v=120-module130-suite160",
    ):
        if required_token not in smart_lighting_wrapper:
            fail(f"smart_lighting wrapper is missing required token {required_token!r}")

    smart_automations_base = (
        PAYLOAD / "frontend" / "smart-automations-panel.js"
    ).read_text(encoding="utf-8")
    if 'const PANEL_VERSION = "1.0.0";' not in smart_automations_base:
        fail("smart-automations-panel.js must remain on validated base V1.0.0")

    smart_automations_layout = (
        PAYLOAD / "frontend" / "smart-automations-layout.js"
    ).read_text(encoding="utf-8")
    for required_token in (
        'SMART_AUTOMATIONS_LAYOUT_RUNTIME_VERSION = "1.0.0"',
        'SMART_AUTOMATIONS_EFFECTIVE_VERSION = "1.1.0"',
        "automation_layout",
        "category_order",
        "move-automation-category",
        "move-automation-instance",
        "params.appearance",
        "reset-automation-appearance",
        "smart_automations.config",
    ):
        if required_token not in smart_automations_layout:
            fail(
                "smart-automations-layout.js is missing required feature token "
                f"{required_token!r}"
            )

    smart_automations_runtime = (
        PAYLOAD / "frontend" / "smart-automations-runtime.js"
    ).read_text(encoding="utf-8")
    for required_token in (
        'SMART_AUTOMATIONS_RUNTIME_VERSION = "1.0.0"',
        'SMART_AUTOMATIONS_COLOR_PICKER_GUARD_VERSION = "1.0.0"',
        'SMART_AUTOMATIONS_EFFECTIVE_VERSION = "1.1.1"',
        'target?.type === "color"',
        'bind?.startsWith("settings.")',
        "this._setSettingsPath",
        "originalOnInput.call(this, ev)",
    ):
        if required_token not in smart_automations_runtime:
            fail(
                "smart-automations-runtime.js is missing required feature token "
                f"{required_token!r}"
            )

    smart_automations_wrapper = (
        PAYLOAD / "modules" / "smart_automations" / "__init__.py"
    ).read_text(encoding="utf-8")
    for required_token in (
        'BASE_FRONTEND_FILE = "smart-automations-panel.js"',
        'LAYOUT_FRONTEND_FILE = "smart-automations-layout.js"',
        'FRONTEND_FILE = "smart-automations-runtime.js"',
        'MODULE_VERSION = "1.1.1"',
        'BASE_PANEL_VERSION = "1.0.0"',
        'LAYOUT_RUNTIME_VERSION = "1.0.0"',
        'COLOR_PICKER_GUARD_VERSION = "1.0.0"',
        "?v=100-layout100-color100-module111-suite171",
    ):
        if required_token not in smart_automations_wrapper:
            fail(
                f"smart_automations wrapper is missing required token {required_token!r}"
            )

    print(f"RELEASE_VALIDATION_OK version={version} modules={len(catalog_ids)}")


if __name__ == "__main__":
    try:
        validate()
    except ValidationError as err:
        print(f"RELEASE_VALIDATION_FAILED: {err}", file=sys.stderr)
        raise SystemExit(1)
