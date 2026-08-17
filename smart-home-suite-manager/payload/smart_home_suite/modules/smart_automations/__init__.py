"""Smart Automations module for Smart Home Suite.

The module provides a simplified UI for creating and managing native Home
Assistant automations. Home Assistant remains the execution engine.
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
FRONTEND_FILE = "smart-automations-panel.js"
MODULE_VERSION = "1.0.0"


def _data(hass: HomeAssistant) -> dict[str, Any]:
    return hass.data.setdefault(DOMAIN, {})


def _store(hass: HomeAssistant) -> Store[dict[str, Any]]:
    data = _data(hass)
    if "store" not in data:
        data["store"] = Store[dict[str, Any]](hass, STORAGE_VERSION, STORAGE_KEY)
    return data["store"]


async def async_setup_module(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Register Smart Automations backend and panel."""
    data = _data(hass)

    if not data.get("websocket_registered"):
        websocket_api.async_register_command(hass, websocket_get_config)
        websocket_api.async_register_command(hass, websocket_save_config)
        websocket_api.async_register_command(hass, websocket_reset_ui_config)
        data["websocket_registered"] = True

    if not data.get("static_registered"):
        frontend_dir = Path(__file__).resolve().parents[2] / "frontend"
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
        module_url=f"{STATIC_URL}/{FRONTEND_FILE}?v=100-suite110",
        require_admin=False,
        handle_safe_area=True,
        config={
            "suite_version": SUITE_VERSION,
            "module_id": "smart_automations",
            "module_version": MODULE_VERSION,
        },
    )
    data["panel_registered"] = True
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
    """Reset panel appearance/navigation while preserving automation ownership."""
    current = await _store(hass).async_load() or {}
    preserved = {
        "schema_version": current.get("schema_version", 1),
        "instances": current.get("instances", []),
    }
    await _store(hass).async_save(preserved)
    connection.send_result(msg["id"], {"reset": True})
