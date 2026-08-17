"""Smart Lighting V1.0.3 module for Smart Home Suite.

The visual frontend is the original Smart Lighting Panel V1.0.3 JavaScript.
The legacy WebSocket API and .storage key are preserved so an existing
standalone Smart Lighting configuration can be reused by the Suite.
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

_LOGGER = logging.getLogger(__name__)

LEGACY_DOMAIN = "smart_lighting_panel"
STORAGE_KEY = "smart_lighting_panel.config"
STORAGE_VERSION = 1

PANEL_PATH = "lighting"
WEB_COMPONENT = "smart-lighting-panel"
STATIC_URL = "/smart_home_suite_static"
FRONTEND_FILE = "smart-lighting-panel.js"

MODULE_VERSION = "1.0.3"
SUITE_VERSION = "0.3.1"


def _data(hass: HomeAssistant) -> dict[str, Any]:
    return hass.data.setdefault(LEGACY_DOMAIN, {})


def _store(hass: HomeAssistant) -> Store[dict[str, Any]]:
    data = _data(hass)
    if "store" not in data:
        data["store"] = Store[dict[str, Any]](
            hass, STORAGE_VERSION, STORAGE_KEY
        )
    return data["store"]


async def async_setup_module(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Register the original Smart Lighting API/frontend as a Suite module."""
    data = _data(hass)

    # Preserve the exact legacy WebSocket command names used by V1.0.3.
    if not data.get("websocket_registered"):
        websocket_api.async_register_command(hass, websocket_get_config)
        websocket_api.async_register_command(hass, websocket_save_config)
        websocket_api.async_register_command(hass, websocket_reset_config)
        data["websocket_registered"] = True

    # Serve the exact original JS from the Suite installation itself.
    if not data.get("static_registered"):
        frontend_dir = Path(__file__).resolve().parents[2] / "frontend"
        try:
            await hass.http.async_register_static_paths(
                [StaticPathConfig(STATIC_URL, str(frontend_dir), False)]
            )
        except RuntimeError:
            _LOGGER.debug("Smart Home Suite static path was already registered")
        data["static_registered"] = True

    # Replace only a previous custom /lighting panel. Do not steal a native path.
    if frontend.async_panel_exists(hass, PANEL_PATH):
        existing = hass.data.get("frontend_panels", {}).get(PANEL_PATH, {})
        if existing and existing.get("component_name") != "custom":
            _LOGGER.error(
                "Cannot register Smart Lighting: panel path /%s is already in use",
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
        sidebar_title="Iluminación",
        sidebar_icon="mdi:lightbulb-group",
        module_url=f"{STATIC_URL}/{FRONTEND_FILE}?v=103-suite031",
        require_admin=False,
        handle_safe_area=True,
        config={
            "suite_version": SUITE_VERSION,
            "module_id": "smart_lighting",
            "module_version": MODULE_VERSION,
        },
    )
    data["panel_registered"] = True
    return True


async def async_unload_module(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Remove only the panel; keep persisted Smart Lighting configuration."""
    data = hass.data.get(LEGACY_DOMAIN, {})
    if data.get("panel_registered") and frontend.async_panel_exists(hass, PANEL_PATH):
        try:
            frontend.async_remove_panel(hass, PANEL_PATH)
        except (KeyError, ValueError):
            pass
        data["panel_registered"] = False


@websocket_api.async_response
@websocket_api.websocket_command(
    {vol.Required("type"): f"{LEGACY_DOMAIN}/config/get"}
)
async def websocket_get_config(hass, connection, msg) -> None:
    """Return the saved Smart Lighting V1.0.3 configuration."""
    data = await _store(hass).async_load()
    connection.send_result(msg["id"], {"config": data or {}})


@websocket_api.require_admin
@websocket_api.async_response
@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{LEGACY_DOMAIN}/config/save",
        vol.Required("config"): dict,
    }
)
async def websocket_save_config(hass, connection, msg) -> None:
    """Persist Smart Lighting configuration. Admin only."""
    await _store(hass).async_save(msg["config"])
    connection.send_result(msg["id"], {"saved": True})


@websocket_api.require_admin
@websocket_api.async_response
@websocket_api.websocket_command(
    {vol.Required("type"): f"{LEGACY_DOMAIN}/config/reset"}
)
async def websocket_reset_config(hass, connection, msg) -> None:
    """Reset Smart Lighting configuration. Admin only."""
    await _store(hass).async_save({})
    connection.send_result(msg["id"], {"reset": True})
