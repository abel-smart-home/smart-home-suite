"""Smart Lighting 1.3.0 module for Smart Home Suite.

The validated Smart Lighting Panel V1.0.3 frontend and its storage/API contract
remain intact. Suite 1.6.0 loads a small layout runtime that preserves device
ordering, lets Global Actions participate in area ordering, reorders its buttons,
and adds active/inactive state colors without changing the legacy
WebSocket namespace or .storage key.
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

LEGACY_DOMAIN = "smart_lighting_panel"
STORAGE_KEY = "smart_lighting_panel.config"
STORAGE_VERSION = 1

PANEL_PATH = "lighting"
WEB_COMPONENT = "smart-lighting-panel"
STATIC_URL = "/smart_home_suite_static"
BASE_FRONTEND_FILE = "smart-lighting-panel.js"
FRONTEND_FILE = "smart-lighting-layout.js"

MODULE_VERSION = "1.3.0"
BASE_PANEL_VERSION = "1.0.3"
LAYOUT_RUNTIME_VERSION = "1.2.0"
ORDERING_RUNTIME_VERSION = "1.1.0"
GLOBAL_ACTIONS_RUNTIME_VERSION = "1.1.0"


def _frontend_dir() -> Path:
    return Path(__file__).resolve().parents[2] / "frontend"


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
    """Register Smart Lighting 1.3.0 API and panel."""
    data = _data(hass)

    frontend_dir = _frontend_dir()
    base_file = frontend_dir / BASE_FRONTEND_FILE
    runtime_file = frontend_dir / FRONTEND_FILE
    if not base_file.is_file() or not runtime_file.is_file():
        _LOGGER.error(
            "Smart Lighting frontend is incomplete: base=%s runtime=%s",
            base_file.is_file(),
            runtime_file.is_file(),
        )
        return False

    runtime_text = await hass.async_add_executor_job(runtime_file.read_text, "utf-8")
    for required_token in (
        'SMART_LIGHTING_LAYOUT_RUNTIME_VERSION = "1.2.0"',
        'SMART_LIGHTING_ORDERING_RUNTIME_VERSION = "1.1.0"',
        'SMART_LIGHTING_GLOBAL_ACTIONS_RUNTIME_VERSION = "1.1.0"',
        'SMART_LIGHTING_EFFECTIVE_VERSION = "1.3.0"',
        'move-lighting-area',
        'move-lighting-device',
        'lighting-global-turn-off',
        'lighting-global-turn-on',
        'move-lighting-global-button',
        'active_color',
        'inactive_color',
    ):
        if required_token not in runtime_text:
            _LOGGER.error(
                "Smart Lighting layout runtime is missing token %s",
                required_token,
            )
            return False

    # Preserve the exact legacy WebSocket command names used by V1.0.3.
    if not data.get("websocket_registered"):
        websocket_api.async_register_command(hass, websocket_get_config)
        websocket_api.async_register_command(hass, websocket_save_config)
        websocket_api.async_register_command(hass, websocket_reset_config)
        data["websocket_registered"] = True

    # Serve the exact base JS plus the Suite layout runtime from one path.
    if not data.get("static_registered"):
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
        module_url=f"{STATIC_URL}/{FRONTEND_FILE}?v=120-module130-suite160",
        require_admin=False,
        handle_safe_area=True,
        config={
            "suite_version": SUITE_VERSION,
            "module_id": "smart_lighting",
            "module_version": MODULE_VERSION,
            "base_panel_version": BASE_PANEL_VERSION,
            "layout_runtime_version": LAYOUT_RUNTIME_VERSION,
            "ordering_runtime_version": ORDERING_RUNTIME_VERSION,
            "global_actions_runtime_version": GLOBAL_ACTIONS_RUNTIME_VERSION,
        },
    )
    data["panel_registered"] = True
    data["base_panel_version"] = BASE_PANEL_VERSION
    data["layout_runtime_version"] = LAYOUT_RUNTIME_VERSION
    data["ordering_runtime_version"] = ORDERING_RUNTIME_VERSION
    data["global_actions_runtime_version"] = GLOBAL_ACTIONS_RUNTIME_VERSION
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
    """Return the saved Smart Lighting configuration."""
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
