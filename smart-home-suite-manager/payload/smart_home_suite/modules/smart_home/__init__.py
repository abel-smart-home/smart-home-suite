"""Smart Home native dashboard module for Smart Home Suite.

Bridge V1.3.0 is bundled byte-for-byte. Smart Home Panel V2.0.5 and its
backend are captured from the existing validated installation by Suite Manager
during migration, preventing a reconstructed/older frontend from replacing it.
"""

from __future__ import annotations

import importlib
import logging
from pathlib import Path
from typing import Any

import voluptuous as vol

from homeassistant.components import frontend, websocket_api
from homeassistant.components.frontend import add_extra_js_url
from homeassistant.components.lovelace import dashboard
from homeassistant.components.lovelace.const import LOVELACE_DATA, MODE_STORAGE
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store

_LOGGER = logging.getLogger(__name__)

LEGACY_DOMAIN = "smart_home_panel"
FALLBACK_STORAGE_KEY = "smart_home_panel.config"
FALLBACK_STORAGE_VERSION = 1

PANEL_PATH = "smart-home"
DASHBOARD_ID = "smart-home-suite"
STATIC_URL = "/smart_home_suite_static"
BRIDGE_FILE = "smart-home-native.js"
PANEL_FILE = "smart-home-panel.js"
MODULE_VERSION = "1.3.0"
BASE_PANEL_VERSION = "2.0.5"
SUITE_VERSION = "0.3.0"


def _data(hass: HomeAssistant) -> dict[str, Any]:
    return hass.data.setdefault(LEGACY_DOMAIN, {})


def _frontend_dir() -> Path:
    return Path(__file__).resolve().parents[2] / "frontend"


async def _ensure_backend(hass: HomeAssistant) -> bool:
    """Use captured V2.0.5 backend when available; otherwise compatibility backend."""
    data = _data(hass)
    if data.get("store") is not None:
        return True

    try:
        captured = importlib.import_module(
            "smart_home_suite.legacy.smart_home_panel"
        )
    except ModuleNotFoundError:
        captured = None

    if captured is not None and hasattr(captured, "async_setup"):
        await captured.async_setup(hass, {})
        _data(hass)["suite_backend_source"] = "captured"
        return True

    # Fail-open compatibility path. It preserves the historical WS contract and
    # expected storage key, but the visual module still requires exact V2.0.5 JS.
    data["store"] = Store[dict[str, Any]](
        hass, FALLBACK_STORAGE_VERSION, FALLBACK_STORAGE_KEY
    )
    if not data.get("suite_fallback_ws_registered"):
        websocket_api.async_register_command(hass, websocket_get_config)
        websocket_api.async_register_command(hass, websocket_save_config)
        websocket_api.async_register_command(hass, websocket_reset_config)
        data["suite_fallback_ws_registered"] = True
    data["suite_backend_source"] = "compatibility"
    return True


async def async_setup_module(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Register the native Smart Home dashboard without configuration.yaml."""
    frontend_dir = _frontend_dir()
    panel_file = frontend_dir / PANEL_FILE
    bridge_file = frontend_dir / BRIDGE_FILE

    if not bridge_file.is_file():
        _LOGGER.error("Smart Home bridge V1.3.0 is missing")
        return False

    if not panel_file.is_file():
        _LOGGER.error(
            "Exact Smart Home Panel V2.0.5 was not captured. "
            "Run Smart Home Suite Manager while the legacy file "
            "/config/www/smart-home-panel/smart-home-panel.js still exists."
        )
        return False

    # Never silently substitute another known version.
    panel_text = await hass.async_add_executor_job(
        panel_file.read_text, "utf-8"
    )
    if 'PANEL_VERSION = "2.0.5"' not in panel_text:
        _LOGGER.error(
            "Captured Smart Home frontend is not V2.0.5; refusing to replace "
            "the validated Smart Home UI with a different version."
        )
        return False

    await _ensure_backend(hass)

    # Bridge is a global Lovelace resource because it registers dashboard strategy.
    add_extra_js_url(
        hass,
        f"{STATIC_URL}/{BRIDGE_FILE}?v=130-suite030",
    )

    lovelace_data = hass.data.get(LOVELACE_DATA)
    if lovelace_data is None:
        _LOGGER.error("Lovelace is not available")
        return False

    existing = lovelace_data.dashboards.get(PANEL_PATH)
    if existing is not None:
        existing_id = (existing.config or {}).get("id")
        if existing_id != DASHBOARD_ID:
            _LOGGER.error(
                "Cannot register Smart Home Suite at /smart-home because an "
                "existing Lovelace dashboard already owns that route. Remove "
                "the legacy lovelace.dashboards.smart-home YAML entry first."
            )
            return False
        lovelace_data.dashboards.pop(PANEL_PATH, None)

    if frontend.async_panel_exists(hass, PANEL_PATH):
        existing_panel = hass.data.get("frontend_panels", {}).get(PANEL_PATH, {})
        # Only replace our own Lovelace registration. A legacy YAML dashboard is
        # detected above via lovelace_data and is never stolen.
        if existing_panel.get("component_name") != "lovelace":
            _LOGGER.error("Panel route /smart-home is already in use")
            return False
        try:
            frontend.async_remove_panel(hass, PANEL_PATH)
        except (KeyError, ValueError):
            pass

    metadata = {
        "id": DASHBOARD_ID,
        "url_path": PANEL_PATH,
        "title": "Smart Home",
        "icon": "mdi:home-lightning-bolt",
        "show_in_sidebar": True,
        "require_admin": False,
    }
    ll_config = dashboard.LovelaceStorage(hass, metadata)
    await ll_config.async_save(
        {
            "strategy": {
                "type": "custom:smart-home",
                "panel_module_url": f"{STATIC_URL}/{PANEL_FILE}?v=205-suite030",
                "hide_ha_header": True,
                "mobile_menu_access": "admins",
            }
        }
    )
    lovelace_data.dashboards[PANEL_PATH] = ll_config

    frontend.async_register_built_in_panel(
        hass,
        "lovelace",
        frontend_url_path=PANEL_PATH,
        require_admin=False,
        show_in_sidebar=True,
        sidebar_title="Smart Home",
        sidebar_icon="mdi:home-lightning-bolt",
        config={"mode": MODE_STORAGE},
    )

    data = _data(hass)
    data["suite_native_dashboard_registered"] = True
    return True


async def async_unload_module(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Remove runtime dashboard registration; keep its stored strategy/config."""
    lovelace_data = hass.data.get(LOVELACE_DATA)
    if lovelace_data is not None:
        existing = lovelace_data.dashboards.get(PANEL_PATH)
        if existing is not None and (existing.config or {}).get("id") == DASHBOARD_ID:
            lovelace_data.dashboards.pop(PANEL_PATH, None)

    data = hass.data.get(LEGACY_DOMAIN, {})
    if data.get("suite_native_dashboard_registered") and frontend.async_panel_exists(
        hass, PANEL_PATH
    ):
        try:
            frontend.async_remove_panel(hass, PANEL_PATH)
        except (KeyError, ValueError):
            pass
    data["suite_native_dashboard_registered"] = False


def _store(hass: HomeAssistant) -> Store[dict[str, Any]]:
    return _data(hass)["store"]


@websocket_api.async_response
@websocket_api.websocket_command({vol.Required("type"): f"{LEGACY_DOMAIN}/config/get"})
async def websocket_get_config(hass, connection, msg) -> None:
    stored = await _store(hass).async_load()
    connection.send_result(msg["id"], {"config": stored or {}})


@websocket_api.require_admin
@websocket_api.async_response
@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{LEGACY_DOMAIN}/config/save",
        vol.Required("config"): dict,
    }
)
async def websocket_save_config(hass, connection, msg) -> None:
    await _store(hass).async_save(msg["config"])
    connection.send_result(msg["id"], {"saved": True})


@websocket_api.require_admin
@websocket_api.async_response
@websocket_api.websocket_command({vol.Required("type"): f"{LEGACY_DOMAIN}/config/reset"})
async def websocket_reset_config(hass, connection, msg) -> None:
    await _store(hass).async_save({})
    connection.send_result(msg["id"], {"reset": True})
