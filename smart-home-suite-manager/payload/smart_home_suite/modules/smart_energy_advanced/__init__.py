"""Smart Energy Advanced Panel V1.3.0 module for Smart Home Suite.

The visual frontend is the original V1.3.0 JavaScript, byte for byte.
The legacy WebSocket namespace and .storage key are preserved.
"""

from __future__ import annotations

import logging
from typing import Any

import voluptuous as vol

from homeassistant.components import frontend, panel_custom, websocket_api
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store

from ...const import VERSION as SUITE_VERSION
from .const import DOMAIN, STORAGE_KEY, STORAGE_VERSION

_LOGGER = logging.getLogger(__name__)

PANEL_PATH = "energy-advanced"
WEB_COMPONENT = "smart-energy-advanced-panel"
STATIC_URL = "/smart_home_suite_static"
FRONTEND_FILE = "smart-energy-advanced-panel.js"
MODULE_VERSION = "1.3.0"


def _data(hass: HomeAssistant) -> dict[str, Any]:
    return hass.data.setdefault(DOMAIN, {})


def _store(hass: HomeAssistant) -> Store[dict[str, Any]]:
    data = _data(hass)
    if "store" not in data:
        data["store"] = Store[dict[str, Any]](
            hass, STORAGE_VERSION, STORAGE_KEY
        )
    return data["store"]


async def async_setup_module(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Register exact Smart Energy Advanced V1.3.0 API and panel."""
    data = _data(hass)

    if not data.get("suite_websocket_registered"):
        websocket_api.async_register_command(hass, websocket_get_config)
        websocket_api.async_register_command(hass, websocket_save_config)
        websocket_api.async_register_command(hass, websocket_reset_config)
        data["suite_websocket_registered"] = True

    if frontend.async_panel_exists(hass, PANEL_PATH):
        existing = hass.data.get("frontend_panels", {}).get(PANEL_PATH, {})
        if existing and existing.get("component_name") != "custom":
            _LOGGER.error(
                "Cannot register Smart Energy Advanced: /%s is already in use",
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
        sidebar_title="Energía avanzada",
        sidebar_icon="mdi:lightning-bolt-circle",
        module_url=f"{STATIC_URL}/{FRONTEND_FILE}?v=130-suite050",
        require_admin=False,
        handle_safe_area=True,
        config={
            "suite_version": SUITE_VERSION,
            "module_id": "smart_energy_advanced",
            "module_version": MODULE_VERSION,
        },
    )
    data["suite_panel_registered"] = True
    return True


async def async_unload_module(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Remove panel registration without deleting persisted configuration."""
    data = hass.data.get(DOMAIN, {})
    if data.get("suite_panel_registered") and frontend.async_panel_exists(hass, PANEL_PATH):
        try:
            frontend.async_remove_panel(hass, PANEL_PATH)
        except (KeyError, ValueError):
            pass
    data["suite_panel_registered"] = False


@websocket_api.async_response
@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/config/get"})
async def websocket_get_config(hass, connection, msg) -> None:
    data = await _store(hass).async_load()
    connection.send_result(msg["id"], {"config": data or {}})


@websocket_api.require_admin
@websocket_api.async_response
@websocket_api.websocket_command(
    {vol.Required("type"): f"{DOMAIN}/config/save", vol.Required("config"): dict}
)
async def websocket_save_config(hass, connection, msg) -> None:
    await _store(hass).async_save(msg["config"])
    connection.send_result(msg["id"], {"saved": True})


@websocket_api.require_admin
@websocket_api.async_response
@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/config/reset"})
async def websocket_reset_config(hass, connection, msg) -> None:
    await _store(hass).async_save({})
    connection.send_result(msg["id"], {"reset": True})
