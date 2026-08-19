"""Smart Energy Advanced 1.5.2 module for Smart Home Suite.

The validated Smart Energy Advanced Panel V1.3.1 frontend, storage/API contract
and ordering runtime V1.0.0 remain intact.

Suite 1.12.2 refines the isolated responsive runtime to V1.2.0 that changes only
rendered panel width and metric-grid span behavior. WebSocket, .storage,
entity actions, ordering, editor and native power-sources-graph remain unchanged.
"""

from __future__ import annotations

import logging
from pathlib import Path
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
BASE_FRONTEND_FILE = "smart-energy-advanced-panel.js"
LAYOUT_FRONTEND_FILE = "smart-energy-advanced-layout.js"
FRONTEND_FILE = "smart-energy-advanced-responsive.js"

MODULE_VERSION = "1.5.2"
BASE_PANEL_VERSION = "1.3.1"
LAYOUT_RUNTIME_VERSION = "1.0.0"
RESPONSIVE_RUNTIME_VERSION = "1.2.0"


def _frontend_dir() -> Path:
    return Path(__file__).resolve().parents[2] / "frontend"


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
    """Register Smart Energy Advanced 1.5.2 API and panel."""
    data = _data(hass)

    frontend_dir = _frontend_dir()
    base_file = frontend_dir / BASE_FRONTEND_FILE
    layout_file = frontend_dir / LAYOUT_FRONTEND_FILE
    responsive_file = frontend_dir / FRONTEND_FILE

    if (
        not base_file.is_file()
        or not layout_file.is_file()
        or not responsive_file.is_file()
    ):
        _LOGGER.error(
            "Smart Energy Advanced frontend is incomplete: base=%s layout=%s responsive=%s",
            base_file.is_file(),
            layout_file.is_file(),
            responsive_file.is_file(),
        )
        return False

    base_text = await hass.async_add_executor_job(base_file.read_text, "utf-8")
    if 'const PANEL_VERSION = "1.3.1";' not in base_text:
        _LOGGER.error(
            "Smart Energy Advanced base frontend is not validated V1.3.1"
        )
        return False

    layout_text = await hass.async_add_executor_job(layout_file.read_text, "utf-8")
    for required_token in (
        'SMART_ENERGY_ORDERING_RUNTIME_VERSION = "1.0.0"',
        'SMART_ENERGY_EFFECTIVE_VERSION = "1.4.0"',
        'move-energy-section',
        'move-energy-widget',
        'smart_energy_advanced_panel.config',
    ):
        if required_token not in layout_text:
            _LOGGER.error(
                "Smart Energy Advanced ordering runtime is missing token %s",
                required_token,
            )
            return False

    responsive_text = await hass.async_add_executor_job(
        responsive_file.read_text, "utf-8"
    )
    for required_token in (
        'SMART_ENERGY_RESPONSIVE_RUNTIME_VERSION = "1.2.0"',
        'SMART_ENERGY_EFFECTIVE_VERSION = "1.5.2"',
        'SMART_ENERGY_NARROW_MAX_WIDTH = 680',
        'SMART_ENERGY_TABLET_MAX_WIDTH = 900',
        'SMART_ENERGY_ADAPTIVE_MAX_WIDTH = 1000',
        'SMART_ENERGY_TABLET_COLUMNS_MIN_WIDTH = 700',
        'repeat(3,minmax(0,1fr))',
        'LEGACY_AUTO_WIDTHS = new Set([520])',
        'import "./smart-energy-advanced-layout.js?v=100-module140-suite130";',
        'container-type:inline-size',
        '@container smart-energy-advanced-page',
        '.metric-card.span-2',
        '.metric-card.kind-hero',
        '.native-power-graph-section',
    ):
        if required_token not in responsive_text:
            _LOGGER.error(
                "Smart Energy Advanced responsive runtime is missing token %s",
                required_token,
            )
            return False

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
        module_url=(
            f"{STATIC_URL}/{FRONTEND_FILE}"
            "?v=120-responsive-module152-suite1122"
        ),
        require_admin=False,
        handle_safe_area=True,
        config={
            "suite_version": SUITE_VERSION,
            "module_id": "smart_energy_advanced",
            "module_version": MODULE_VERSION,
            "base_panel_version": BASE_PANEL_VERSION,
            "layout_runtime_version": LAYOUT_RUNTIME_VERSION,
            "responsive_runtime_version": RESPONSIVE_RUNTIME_VERSION,
        },
    )
    data["suite_panel_registered"] = True
    data["base_panel_version"] = BASE_PANEL_VERSION
    data["layout_runtime_version"] = LAYOUT_RUNTIME_VERSION
    data["responsive_runtime_version"] = RESPONSIVE_RUNTIME_VERSION
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
