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

    required_root = [
        PAYLOAD / "__init__.py",
        PAYLOAD / "config_flow.py",
        PAYLOAD / "const.py",
        PAYLOAD / "diagnostics.py",
        PAYLOAD / "module_catalog.py",
        PAYLOAD / "module_manager.py",
        PAYLOAD / "sensor.py",
        PAYLOAD / "binary_sensor.py",
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

        # Smart Home exposes the base panel version as its user-facing module version.
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

    # Translation integrity and repair issue text.
    for language in ("en", "es"):
        translation = read_json(PAYLOAD / "translations" / f"{language}.json")
        issue = translation.get("issues", {}).get("module_setup_failed", {})
        if not issue.get("title") or not issue.get("description"):
            fail(f"{language}: module_setup_failed repair translation is incomplete")

    # Productive frontend artifacts must all exist and be non-empty.
    for filename in (
        "smart-home-panel.js",
        "smart-home-native.js",
        "smart-lighting-panel.js",
        "smart-energy-advanced-panel.js",
        "smart-support-panel.js",
    ):
        path = PAYLOAD / "frontend" / filename
        if not path.is_file() or path.stat().st_size < 1000:
            fail(f"Frontend missing or unexpectedly small: {filename}")

    print(f"RELEASE_VALIDATION_OK version={version} modules={len(catalog_ids)}")


if __name__ == "__main__":
    try:
        validate()
    except ValidationError as err:
        print(f"RELEASE_VALIDATION_FAILED: {err}", file=sys.stderr)
        raise SystemExit(1)
