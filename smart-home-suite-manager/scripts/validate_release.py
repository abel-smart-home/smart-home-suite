#!/usr/bin/env python3
"""Static integrity validation for Smart Home Suite release payload."""

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
                "module_id", "name", "version", "panel_path", "enabled_by_default",
            }:
                try:
                    spec[keyword.arg] = ast.literal_eval(keyword.value)
                except Exception:
                    fail(f"ModuleSpec {keyword.arg} must be a literal")
        specs.append(spec)
    if not specs:
        fail("No ModuleSpec entries found in module_catalog.py")
    return specs


def require_tokens(path: Path, tokens: tuple[str, ...], label: str) -> None:
    source = path.read_text(encoding="utf-8")
    for token in tokens:
        if token not in source:
            fail(f"{label} is missing required token {token!r}")


def validate() -> None:
    version = app_version()

    manifest = read_json(PAYLOAD / "manifest.json")
    if manifest.get("version") != version:
        fail(f"Version mismatch: app={version} integration={manifest.get('version')}")

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
            fail(f"Module folder/id mismatch: folder={folder.name} id={module_id}")
        if descriptor.get("suite_version") != version:
            fail(f"{module_id}: suite_version {descriptor.get('suite_version')} != {version}")
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
            fail(f"{module_id}: runtime wrapper must consume central Suite VERSION")
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
            fail(f"{descriptor['id']}: catalog/descriptor panel_path mismatch")
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

    required_issues = ("module_setup_failed", "smart_support_provider_unavailable")
    for language in ("en", "es"):
        translation = read_json(PAYLOAD / "translations" / f"{language}.json")
        for issue_key in required_issues:
            issue = translation.get("issues", {}).get(issue_key, {})
            if not issue.get("title") or not issue.get("description"):
                fail(f"{language}: {issue_key} repair translation is incomplete")

    require_tokens(
        PAYLOAD / "support_health.py",
        ("enable_user", "disable_user", "EVENT_SERVICE_REGISTERED",
         "EVENT_SERVICE_REMOVED", "smart_support_provider_unavailable"),
        "support_health.py",
    )

    for filename in (
        "smart-home-panel.js",
        "smart-home-native.js",
        "smart-home-panel-runtime.js",
        "smart-home-card-layout.js",
        "smart-home-layout-v3.js",
        "smart-home-panel-v3.js",
        "smart-home-native-v3.js",
        "smart-lighting-panel.js",
        "smart-lighting-layout.js",
        "smart-lighting-responsive.js",
        "smart-energy-advanced-panel.js",
        "smart-energy-advanced-layout.js",
        "smart-energy-advanced-responsive.js",
        "smart-automations-panel.js",
        "smart-automations-layout.js",
        "smart-automations-runtime.js",
        "smart-automations-responsive.js",
        "smart-automations-alert-control.js",
        "smart-support-panel.js",
    ):
        path = PAYLOAD / "frontend" / filename
        if not path.is_file() or path.stat().st_size < 1000:
            fail(f"Frontend missing or unexpectedly small: {filename}")

    smart_home_base = (PAYLOAD / "frontend" / "smart-home-panel.js").read_text(
        encoding="utf-8"
    )
    if 'PANEL_VERSION = "2.0.5"' not in smart_home_base:
        fail("smart-home-panel.js must remain on validated fallback V2.0.5")

    require_tokens(
        PAYLOAD / "frontend" / "smart-home-panel-runtime.js",
        (
            'SMART_HOME_RUNTIME_GUARD_VERSION = "1.0.0"',
            'SMART_HOME_RUNTIME_VERSION = "1.1.0"',
            'import "./smart-home-card-layout.js?v=100-module140";',
            'Object.getOwnPropertyDescriptor(proto, "narrow")',
            "if (current === next) return;",
        ),
        "smart-home-panel-runtime.js",
    )

    require_tokens(
        PAYLOAD / "frontend" / "smart-home-card-layout.js",
        (
            'SMART_HOME_CARD_LAYOUT_RUNTIME_VERSION = "1.0.0"',
            "card_layout.order",
            "extra_cards",
            "history/history_during_period",
            "move-smart-card",
        ),
        "smart-home-card-layout.js",
    )

    require_tokens(
        PAYLOAD / "frontend" / "smart-home-layout-v3.js",
        (
            'SMART_HOME_LAYOUT_V3_RUNTIME_VERSION = "1.0.0"',
            'SMART_HOME_LAYOUT_V3_EFFECTIVE_VERSION = "3.0.0"',
            'SMART_HOME_LAYOUT_V3_SCHEMA_VERSION = 1',
        ),
        "legacy smart-home-layout-v3.js",
    )

    require_tokens(
        PAYLOAD / "frontend" / "smart-home-panel-v3.js",
        (
            'SMART_HOME_PANEL_V3_VERSION = "3.1.0"',
            'SMART_HOME_MODULE_VERSION = "1.6.0"',
            'SMART_HOME_LAYOUT_V3_SCHEMA_VERSION = 1',
            'SMART_HOME_V3_DEFAULT_BREAKPOINT = 700',
            'SMART_HOME_V3_DEFAULT_MAX_WIDTH = 1100',
            'SMART_HOME_V3_WIDE_COLUMNS = 4',
            'SMART_HOME_V3_LEGACY_AUTO_WIDTHS = new Set([520])',
            'import "./smart-home-panel-runtime.js?v=110-guard100-cards100-module140-suite1123";',
            "class SmartHomePanelV3 extends LegacyPanel",
            'customElements.define("smart-home-panel-v3", SmartHomePanelV3)',
            "layout_v3",
            "widget_layout",
            "v3-move-section",
            "v3-move-widget",
            "v3-add-section",
            "v3-add-widget",
            "data-v3-widget-section",
            "container-type:inline-size",
            "@container smart-home-v3-page",
            "ha-selector",
            "ha-icon-picker",
            "card_layout",
            "section_surface",
            "smart-home-native-preferences",
        ),
        "smart-home-panel-v3.js",
    )

    require_tokens(
        PAYLOAD / "frontend" / "smart-home-native-v3.js",
        (
            'SMART_HOME_NATIVE_V3_BRIDGE_VERSION = "1.0.0"',
            'SMART_HOME_PANEL_V3_ELEMENT = "smart-home-panel-v3"',
            'import "./smart-home-native.js?v=130-suite050";',
            "class SmartHomeDashboardCardV3 extends BaseDashboardCard",
            'customElements.define("smart-home-dashboard-card-v3", SmartHomeDashboardCardV3)',
            "smart-home-native-preferences",
        ),
        "smart-home-native-v3.js",
    )

    require_tokens(
        PAYLOAD / "modules" / "smart_home" / "__init__.py",
        (
            'PANEL_FILE = "smart-home-panel.js"',
            'V3_BRIDGE_FILE = "smart-home-native-v3.js"',
            'PANEL_RUNTIME_FILE = "smart-home-panel-runtime.js"',
            'CARD_LAYOUT_FILE = "smart-home-card-layout.js"',
            'LEGACY_LAYOUT_V3_FILE = "smart-home-layout-v3.js"',
            'PANEL_V3_FILE = "smart-home-panel-v3.js"',
            'MODULE_VERSION = "1.6.0"',
            'BASE_PANEL_VERSION = "2.0.5"',
            'PANEL_V3_VERSION = "3.1.0"',
            'RUNTIME_VERSION = "1.1.0"',
            'CARD_LAYOUT_RUNTIME_VERSION = "1.0.0"',
            'V3_BRIDGE_VERSION = "1.0.0"',
            '"type": "custom:smart-home-dashboard-card-v3"',
            "?v=310-panel-module160-suite1140",
            "?v=100-v3bridge-suite1140",
        ),
        "smart_home wrapper",
    )


    smart_lighting_base = (
        PAYLOAD / "frontend" / "smart-lighting-panel.js"
    ).read_text(encoding="utf-8")
    if 'const PANEL_VERSION = "1.0.3";' not in smart_lighting_base:
        fail("smart-lighting-panel.js must remain on validated base V1.0.3")

    require_tokens(
        PAYLOAD / "frontend" / "smart-lighting-layout.js",
        (
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
            "button_order",
            "active_color",
            "inactive_color",
            "collectGlobalEntities",
        ),
        "smart-lighting-layout.js",
    )

    require_tokens(
        PAYLOAD / "frontend" / "smart-lighting-responsive.js",
        (
            'SMART_LIGHTING_RESPONSIVE_RUNTIME_VERSION = "1.1.0"',
            'SMART_LIGHTING_EFFECTIVE_VERSION = "1.4.1"',
            'SMART_LIGHTING_ADAPTIVE_MAX_WIDTH = 1200',
            'LEGACY_AUTO_WIDTHS = new Set([520, 760])',
            'import "./smart-lighting-layout.js?v=120-module130-suite180";',
            "container-type:inline-size",
            "@container smart-lighting-page",
            ".smart-global-actions-grid",
            "columns_tablet",
            "columns_desktop",
            "usesLegacyAutoWidth",
        ),
        "smart-lighting-responsive.js",
    )

    require_tokens(
        PAYLOAD / "modules" / "smart_lighting" / "__init__.py",
        (
            'BASE_FRONTEND_FILE = "smart-lighting-panel.js"',
            'LAYOUT_FRONTEND_FILE = "smart-lighting-layout.js"',
            'FRONTEND_FILE = "smart-lighting-responsive.js"',
            'MODULE_VERSION = "1.4.1"',
            'BASE_PANEL_VERSION = "1.0.3"',
            'LAYOUT_RUNTIME_VERSION = "1.2.0"',
            'RESPONSIVE_RUNTIME_VERSION = "1.1.0"',
            "?v=110-responsive-module141-suite191",
        ),
        "smart_lighting wrapper",
    )

    smart_energy_base = (
        PAYLOAD / "frontend" / "smart-energy-advanced-panel.js"
    ).read_text(encoding="utf-8")
    if 'const PANEL_VERSION = "1.3.1";' not in smart_energy_base:
        fail("smart-energy-advanced-panel.js must remain on validated base V1.3.1")

    require_tokens(
        PAYLOAD / "frontend" / "smart-energy-advanced-layout.js",
        (
            'SMART_ENERGY_ORDERING_RUNTIME_VERSION = "1.0.0"',
            'SMART_ENERGY_EFFECTIVE_VERSION = "1.4.0"',
            'import "./smart-energy-advanced-panel.js?v=131-suite120-base";',
            "move-energy-section",
            "move-energy-widget",
            "smart_energy_advanced_panel.config",
        ),
        "smart-energy-advanced-layout.js",
    )

    require_tokens(
        PAYLOAD / "frontend" / "smart-energy-advanced-responsive.js",
        (
            'SMART_ENERGY_RESPONSIVE_RUNTIME_VERSION = "1.3.0"',
            'SMART_ENERGY_EFFECTIVE_VERSION = "1.5.3"',
            'SMART_ENERGY_TABLET_MAX_WIDTH = 900',
            'SMART_ENERGY_ADAPTIVE_MAX_WIDTH = 1000',
            'SMART_ENERGY_WIDE_GRID_MIN_WIDTH = 700',
            '@media (min-width:700px) and (max-width:899px)',
            '@container smart-energy-advanced-page (max-width:699px)',
            '@container smart-energy-advanced-page (min-width:700px)',
            'repeat(2,minmax(0,1fr))',
            'repeat(4,minmax(0,1fr))',
            'LEGACY_AUTO_WIDTHS = new Set([520])',
            'import "./smart-energy-advanced-layout.js?v=100-module140-suite130";',
            "container-type:inline-size",
            ".metric-card.span-2",
            "grid-column:span 2",
            ".metric-card.kind-hero",
            "grid-column:1/-1",
            ".native-power-graph-section",
            "usesLegacyAutoWidth",
        ),
        "smart-energy-advanced-responsive.js",
    )

    require_tokens(
        PAYLOAD / "modules" / "smart_energy_advanced" / "__init__.py",
        (
            'BASE_FRONTEND_FILE = "smart-energy-advanced-panel.js"',
            'LAYOUT_FRONTEND_FILE = "smart-energy-advanced-layout.js"',
            'FRONTEND_FILE = "smart-energy-advanced-responsive.js"',
            'MODULE_VERSION = "1.5.3"',
            'BASE_PANEL_VERSION = "1.3.1"',
            'LAYOUT_RUNTIME_VERSION = "1.0.0"',
            'RESPONSIVE_RUNTIME_VERSION = "1.3.0"',
            "?v=130-responsive-module153-suite1123",
        ),
        "smart_energy_advanced wrapper",
    )

    smart_automations_base = (
        PAYLOAD / "frontend" / "smart-automations-panel.js"
    ).read_text(encoding="utf-8")
    if 'const PANEL_VERSION = "1.0.0";' not in smart_automations_base:
        fail("smart-automations-panel.js must remain on validated base V1.0.0")

    require_tokens(
        PAYLOAD / "frontend" / "smart-automations-layout.js",
        (
            'SMART_AUTOMATIONS_LAYOUT_RUNTIME_VERSION = "1.0.0"',
            'SMART_AUTOMATIONS_EFFECTIVE_VERSION = "1.1.0"',
            "automation_layout",
            "category_order",
            "move-automation-category",
            "move-automation-instance",
            "params.appearance",
            "reset-automation-appearance",
        ),
        "smart-automations-layout.js",
    )

    require_tokens(
        PAYLOAD / "frontend" / "smart-automations-runtime.js",
        (
            'SMART_AUTOMATIONS_RUNTIME_VERSION = "1.0.0"',
            'SMART_AUTOMATIONS_COLOR_PICKER_GUARD_VERSION = "1.0.0"',
            'SMART_AUTOMATIONS_EFFECTIVE_VERSION = "1.1.1"',
            'target?.type === "color"',
            'bind?.startsWith("settings.")',
            "this._setSettingsPath",
            "originalOnInput.call(this, ev)",
        ),
        "smart-automations-runtime.js",
    )

    require_tokens(
        PAYLOAD / "frontend" / "smart-automations-responsive.js",
        (
            'SMART_AUTOMATIONS_RESPONSIVE_RUNTIME_VERSION = "1.0.0"',
            'SMART_AUTOMATIONS_EFFECTIVE_VERSION = "1.2.0"',
            'SMART_AUTOMATIONS_ADAPTIVE_MAX_WIDTH = 1000',
            'LEGACY_AUTO_WIDTHS = new Set([520])',
            'import "./smart-automations-runtime.js?v=100-layout100-color100-module111-suite191";',
            "container-type:inline-size",
            "@container smart-automations-page",
            "columns_mobile",
            "columns_tablet",
            "columns_desktop",
            ".summary",
            ".cards",
            "usesLegacyAutoWidth",
        ),
        "smart-automations-responsive.js",
    )

    require_tokens(
        PAYLOAD / "frontend" / "smart-automations-alert-control.js",
        (
            'SMART_AUTOMATIONS_ALERT_CONTROL_RUNTIME_VERSION = "1.0.0"',
            'SMART_AUTOMATIONS_EFFECTIVE_VERSION = "1.3.0"',
            'import "./smart-automations-responsive.js?v=100-responsive-module120-suite1100";',
            '"high_power"',
            '"energy_limit"',
            "notification_count",
            "second_notification_delay_minutes",
            "schedule_enabled",
            "schedule_start",
            "schedule_end",
            "rearm_enabled",
            "rearm_below",
            "wait_for_trigger",
            'condition: "time"',
            'mode: "single"',
            "fuera del horario",
        ),
        "smart-automations-alert-control.js",
    )

    require_tokens(
        PAYLOAD / "modules" / "smart_automations" / "__init__.py",
        (
            'BASE_FRONTEND_FILE = "smart-automations-panel.js"',
            'LAYOUT_FRONTEND_FILE = "smart-automations-layout.js"',
            'RUNTIME_FRONTEND_FILE = "smart-automations-runtime.js"',
            'RESPONSIVE_FRONTEND_FILE = "smart-automations-responsive.js"',
            'FRONTEND_FILE = "smart-automations-alert-control.js"',
            'MODULE_VERSION = "1.3.0"',
            'BASE_PANEL_VERSION = "1.0.0"',
            'LAYOUT_RUNTIME_VERSION = "1.0.0"',
            'COLOR_PICKER_GUARD_VERSION = "1.0.0"',
            'RESPONSIVE_RUNTIME_VERSION = "1.0.0"',
            'ALERT_CONTROL_RUNTIME_VERSION = "1.0.0"',
            "?v=100-alert-module130-suite1110",
        ),
        "smart_automations wrapper",
    )

    print(f"RELEASE_VALIDATION_OK version={version} modules={len(catalog_ids)}")


if __name__ == "__main__":
    try:
        validate()
    except ValidationError as err:
        print(f"RELEASE_VALIDATION_FAILED: {err}", file=sys.stderr)
        raise SystemExit(1)
