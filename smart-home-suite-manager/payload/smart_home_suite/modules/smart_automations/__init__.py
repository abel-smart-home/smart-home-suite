"""Smart Automations 1.1.0 module for Smart Home Suite.

The validated Smart Automations Panel V1.0.0 remains the functional base.
Suite 1.7.0 loads a small UI/layout runtime that adds category/instance ordering
and visual card customization without changing the native Home Assistant
automation generation contract, WebSocket namespace or .storage key.
"""

from __future__ import annotations

import logging
from pathlib import Path
from typing import Any

import voluptuous as vol

from homeassistant.components import frontend, panel_custom, websocket_api
from homeassistant.components.http import StaticPathConfig
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store

from ...const import VERSION as SUITE_VERSION

_LOGGER = logging.getLogger(__name__)

DOMAIN = "smart_automations_panel"
STORAGE_KEY = "smart_automations.config"
STORAGE_VERSION = 1

PANEL_PATH = "smart-automations"
WEB_COMPONENT = "smart-automations-panel"
STATIC_URL = "/smart_home_suite_static"
BASE_FRONTEND_FILE = "smart-automations-panel.js"
FRONTEND_FILE = "smart-automations-layout.js"

MODULE_VERSION = "1.1.0"
BASE_PANEL_VERSION = "1.0.0"
LAYOUT_RUNTIME_VERSION = "1.0.0"


def _frontend_dir() -> Path:
    return Path(__file__).resolve().parents[2] / "frontend"


def _data(hass: HomeAssistant) -> dict[str, Any]:
    return hass.data.setdefault(DOMAIN, {})


def _store(hass: HomeAssistant) -> Store[dict[str, Any]]:
    data = _data(hass)
    if "store" not in data:
        data["store"] = Store[dict[str, Any]](hass, STORAGE_VERSION, STORAGE_KEY)
    return data["store"]


async def async_setup_module(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Register Smart Automations 1.1.0 backend and panel."""
    data = _data(hass)

    frontend_dir = _frontend_dir()
    base_file = frontend_dir / BASE_FRONTEND_FILE
    runtime_file = frontend_dir / FRONTEND_FILE

    if not base_file.is_file() or not runtime_file.is_file():
        _LOGGER.error(
            "Smart Automations frontend is incomplete: base=%s runtime=%s",
            base_file.is_file(),
            runtime_file.is_file(),
        )
        return False

    base_text = await hass.async_add_executor_job(base_file.read_text, "utf-8")
    if 'const PANEL_VERSION = "1.0.0";' not in base_text:
        _LOGGER.error("Smart Automations base frontend is not validated V1.0.0")
        return False

    runtime_text = await hass.async_add_executor_job(runtime_file.read_text, "utf-8")
    for required_token in (
        'SMART_AUTOMATIONS_LAYOUT_RUNTIME_VERSION = "1.0.0"',
        'SMART_AUTOMATIONS_EFFECTIVE_VERSION = "1.1.0"',
        "automation_layout",
        "category_order",
        "move-automation-category",
        "move-automation-instance",
        "params.appearance",
        "smart_automations.config",
    ):
        if required_token not in runtime_text:
            _LOGGER.error(
                "Smart Automations layout runtime is missing token %s",
                required_token,
            )
            return False

    if not data.get("websocket_registered"):
        websocket_api.async_register_command(hass, websocket_get_config)
        websocket_api.async_register_command(hass, websocket_save_config)
        websocket_api.async_register_command(hass, websocket_reset_ui_config)
        data["websocket_registered"] = True

    if not data.get("static_registered"):
        try:
            await hass.http.async_register_static_paths(
                [StaticPathConfig(STATIC_URL, str(frontend_dir), False)]
            )
        except RuntimeError:
            _LOGGER.debug("Smart Home Suite static path was already registered")
        data["static_registered"] = True

    if frontend.async_panel_exists(hass, PANEL_PATH):
        existing = hass.data.get("frontend_panels", {}).get(PANEL_PATH, {})
        if existing and existing.get("component_name") != "custom":
            _LOGGER.error(
                "Cannot register Smart Automations: panel path /%s is already in use",
                PANEL_PATH,
            )
            return False
        try:
            frontend.async_remove_panel(hass, PANEL_PATH)
        except (KeyError, ValueError):
            pass

    await panel_custom.async_register_panel(
        hass,
        frontend_url_path=PANEL_PATH,
        webcomponent_name=WEB_COMPONENT,
        sidebar_title="Automatizaciones",
        sidebar_icon="mdi:robot",
        module_url=f"{STATIC_URL}/{FRONTEND_FILE}?v=100-module110-suite170",
        require_admin=False,
        handle_safe_area=True,
        config={
            "suite_version": SUITE_VERSION,
            "module_id": "smart_automations",
            "module_version": MODULE_VERSION,
            "base_panel_version": BASE_PANEL_VERSION,
            "layout_runtime_version": LAYOUT_RUNTIME_VERSION,
        },
    )
    data["panel_registered"] = True
    data["base_panel_version"] = BASE_PANEL_VERSION
    data["layout_runtime_version"] = LAYOUT_RUNTIME_VERSION
    return True


async def async_unload_module(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Unload only the panel registration, preserving stored configuration."""
    data = hass.data.get(DOMAIN, {})
    if data.get("panel_registered") and frontend.async_panel_exists(hass, PANEL_PATH):
        try:
            frontend.async_remove_panel(hass, PANEL_PATH)
        except (KeyError, ValueError):
            pass
        data["panel_registered"] = False


@websocket_api.async_response
@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/config/get"})
async def websocket_get_config(hass, connection, msg) -> None:
    """Return persisted Smart Automations UI/ownership configuration."""
    data = await _store(hass).async_load()
    connection.send_result(msg["id"], {"config": data or {}})


@websocket_api.require_admin
@websocket_api.async_response
@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/config/save",
        vol.Required("config"): dict,
    }
)
async def websocket_save_config(hass, connection, msg) -> None:
    """Persist Smart Automations metadata. Admin only."""
    await _store(hass).async_save(msg["config"])
    connection.send_result(msg["id"], {"saved": True})


@websocket_api.require_admin
@websocket_api.async_response
@websocket_api.websocket_command(
    {vol.Required("type"): f"{DOMAIN}/config/reset_ui"}
)
async def websocket_reset_ui_config(hass, connection, msg) -> None:
    """Reset global panel appearance/navigation while preserving instances."""
    current = await _store(hass).async_load() or {}
    preserved = {
        "schema_version": current.get("schema_version", 1),
        "instances": current.get("instances", []),
    }
    await _store(hass).async_save(preserved)
    connection.send_result(msg["id"], {"reset": True})
