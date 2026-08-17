"""Smart Home Panel backend.

Provides persistent configuration storage and WebSocket commands for the
frontend custom panel. The visual panel itself is registered with panel_custom.
"""

from __future__ import annotations

from typing import Any

import voluptuous as vol

from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store
from homeassistant.helpers.typing import ConfigType

from .const import DOMAIN, STORAGE_KEY, STORAGE_VERSION

CONFIG_SCHEMA = vol.Schema(
    {vol.Optional(DOMAIN): vol.Schema({})},
    extra=vol.ALLOW_EXTRA,
)


def _store(hass: HomeAssistant) -> Store[dict[str, Any]]:
    return hass.data[DOMAIN]["store"]


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    """Set up Smart Home Panel."""
    hass.data[DOMAIN] = {
        "store": Store[dict[str, Any]](hass, STORAGE_VERSION, STORAGE_KEY)
    }

    websocket_api.async_register_command(hass, websocket_get_config)
    websocket_api.async_register_command(hass, websocket_save_config)
    websocket_api.async_register_command(hass, websocket_reset_config)
    return True


@websocket_api.async_response
@websocket_api.websocket_command(
    {vol.Required("type"): f"{DOMAIN}/config/get"}
)
async def websocket_get_config(hass, connection, msg) -> None:
    """Return the saved panel configuration."""
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
    """Persist the panel configuration. Admin only."""
    await _store(hass).async_save(msg["config"])
    connection.send_result(msg["id"], {"saved": True})


@websocket_api.require_admin
@websocket_api.async_response
@websocket_api.websocket_command(
    {vol.Required("type"): f"{DOMAIN}/config/reset"}
)
async def websocket_reset_config(hass, connection, msg) -> None:
    """Reset the saved configuration. Admin only."""
    await _store(hass).async_save({})
    connection.send_result(msg["id"], {"reset": True})
