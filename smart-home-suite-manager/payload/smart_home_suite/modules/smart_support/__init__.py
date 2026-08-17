"""Smart Support Panel V1.1.2 module for Smart Home Suite.

The frontend, session manager, constants and entity classes come from the
original V1.1.2 package. Suite-specific code only adapts lifecycle/registration.
"""

from __future__ import annotations

import logging
from functools import partial
from typing import Any

import voluptuous as vol

from homeassistant.components import frontend, panel_custom, websocket_api
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import EVENT_HOMEASSISTANT_STARTED
from homeassistant.core import HomeAssistant, ServiceCall
from homeassistant.exceptions import HomeAssistantError
from homeassistant.helpers.service import async_register_admin_service
from homeassistant.helpers.storage import Store

from .const import (
    DOMAIN,
    HARD_MAX_HOURS,
    HARD_MIN_HOURS,
    SERVICE_EXTEND_SUPPORT,
    SERVICE_START_SUPPORT,
    SERVICE_STOP_SUPPORT,
    SERVICE_VERIFY_SUPPORT,
    STORAGE_KEY,
    STORAGE_VERSION,
)
from .manager import SupportManager

_LOGGER = logging.getLogger(__name__)

PANEL_PATH = "support"
WEB_COMPONENT = "smart-support-panel"
STATIC_URL = "/smart_home_suite_static"
FRONTEND_FILE = "smart-support-panel.js"
MODULE_VERSION = "1.1.2"
SUITE_VERSION = "0.3.0"

HOURS_SCHEMA = vol.Schema(
    {vol.Optional("hours"): vol.All(
        vol.Coerce(float),
        vol.Range(min=HARD_MIN_HOURS, max=HARD_MAX_HOURS),
    )}
)


def _data(hass: HomeAssistant) -> dict[str, Any]:
    return hass.data.setdefault(DOMAIN, {})


def _store(hass: HomeAssistant) -> Store[dict[str, Any]]:
    data = _data(hass)
    if "store" not in data:
        data["store"] = Store[dict[str, Any]](hass, STORAGE_VERSION, STORAGE_KEY)
    return data["store"]


def _manager(hass: HomeAssistant) -> SupportManager:
    return _data(hass)["manager"]


def _enabled(hass: HomeAssistant) -> bool:
    return bool(_data(hass).get("suite_enabled", False))


async def async_setup_module(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Register Smart Support V1.1.2 while preserving its legacy contract."""
    data = _data(hass)
    store = _store(hass)

    if "manager" not in data:
        manager = SupportManager(hass, store)
        data["manager"] = manager
        await manager.async_initialize()
    else:
        manager = data["manager"]

    data["suite_enabled"] = True

    if not data.get("suite_websocket_registered"):
        websocket_api.async_register_command(hass, websocket_get_config)
        websocket_api.async_register_command(hass, websocket_save_config)
        websocket_api.async_register_command(hass, websocket_reset_config)
        websocket_api.async_register_command(hass, websocket_support_status)
        websocket_api.async_register_command(hass, websocket_support_verify)
        websocket_api.async_register_command(hass, websocket_support_start)
        websocket_api.async_register_command(hass, websocket_support_stop)
        websocket_api.async_register_command(hass, websocket_support_extend)
        data["suite_websocket_registered"] = True

    if not data.get("suite_services_registered"):
        async_register_admin_service(
            hass, DOMAIN, SERVICE_START_SUPPORT, partial(_service_start, hass), HOURS_SCHEMA
        )
        async_register_admin_service(
            hass, DOMAIN, SERVICE_STOP_SUPPORT, partial(_service_stop, hass)
        )
        async_register_admin_service(
            hass, DOMAIN, SERVICE_EXTEND_SUPPORT, partial(_service_extend, hass), HOURS_SCHEMA
        )
        async_register_admin_service(
            hass, DOMAIN, SERVICE_VERIFY_SUPPORT, partial(_service_verify, hass)
        )
        data["suite_services_registered"] = True

    if not data.get("suite_startup_registered"):
        async def _started(_event) -> None:
            if _enabled(hass):
                await _manager(hass).async_on_homeassistant_started()

        if hass.is_running:
            hass.async_create_task(
                manager.async_on_homeassistant_started(),
                "Reconcile Smart Support startup",
            )
        else:
            remove_listener = hass.bus.async_listen_once(
                EVENT_HOMEASSISTANT_STARTED, _started
            )
            entry.async_on_unload(remove_listener)
        data["suite_startup_registered"] = True

    if frontend.async_panel_exists(hass, PANEL_PATH):
        existing = hass.data.get("frontend_panels", {}).get(PANEL_PATH, {})
        if existing and existing.get("component_name") != "custom":
            _LOGGER.error(
                "Cannot register Smart Support: /%s is already in use", PANEL_PATH
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
        sidebar_title="Soporte",
        sidebar_icon="mdi:headset",
        module_url=f"{STATIC_URL}/{FRONTEND_FILE}?v=112-suite030",
        require_admin=False,
        handle_safe_area=True,
        config={
            "suite_version": SUITE_VERSION,
            "module_id": "smart_support",
            "module_version": MODULE_VERSION,
        },
    )
    data["suite_panel_registered"] = True
    return True


async def async_unload_module(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Disable UI/runtime entry point without deleting config/session stores."""
    data = hass.data.get(DOMAIN, {})
    data["suite_enabled"] = False

    manager = data.get("manager")
    if manager and manager.active:
        try:
            await manager.async_stop(reason="suite_module_disabled")
        except HomeAssistantError as err:
            _LOGGER.error("Could not close active support session while unloading: %s", err)

    if data.get("suite_panel_registered") and frontend.async_panel_exists(hass, PANEL_PATH):
        try:
            frontend.async_remove_panel(hass, PANEL_PATH)
        except (KeyError, ValueError):
            pass
    data["suite_panel_registered"] = False


async def _service_start(hass: HomeAssistant, call: ServiceCall) -> None:
    if not _enabled(hass):
        raise HomeAssistantError("Smart Support module is disabled in Smart Home Suite.")
    await _manager(hass).async_start(call.data.get("hours"))


async def _service_stop(hass: HomeAssistant, call: ServiceCall) -> None:
    await _manager(hass).async_stop()


async def _service_extend(hass: HomeAssistant, call: ServiceCall) -> None:
    if not _enabled(hass):
        raise HomeAssistantError("Smart Support module is disabled in Smart Home Suite.")
    await _manager(hass).async_extend(call.data.get("hours"))


async def _service_verify(hass: HomeAssistant, call: ServiceCall) -> None:
    result = await _manager(hass).async_verify()
    _LOGGER.info("Smart Support verification: %s", result.get("message"))


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
    await _manager(hass).async_update_config(msg["config"])
    await _store(hass).async_save(msg["config"])
    connection.send_result(
        msg["id"],
        {"saved": True, "verification": await _manager(hass).async_verify()},
    )


@websocket_api.require_admin
@websocket_api.async_response
@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/config/reset"})
async def websocket_reset_config(hass, connection, msg) -> None:
    await _manager(hass).async_update_config({})
    await _store(hass).async_save({})
    connection.send_result(msg["id"], {"reset": True})


@websocket_api.async_response
@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/support/status"})
async def websocket_support_status(hass, connection, msg) -> None:
    connection.send_result(msg["id"], await _manager(hass).async_status())


@websocket_api.require_admin
@websocket_api.async_response
@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/support/verify",
        vol.Optional("user_id"): str,
        vol.Optional("enabled"): bool,
    }
)
async def websocket_support_verify(hass, connection, msg) -> None:
    connection.send_result(
        msg["id"],
        await _manager(hass).async_verify(msg.get("user_id"), msg.get("enabled")),
    )


@websocket_api.require_admin
@websocket_api.async_response
@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/support/start",
        vol.Optional("hours"): vol.All(
            vol.Coerce(float),
            vol.Range(min=HARD_MIN_HOURS, max=HARD_MAX_HOURS),
        ),
    }
)
async def websocket_support_start(hass, connection, msg) -> None:
    if not _enabled(hass):
        raise HomeAssistantError("Smart Support module is disabled in Smart Home Suite.")
    connection.send_result(msg["id"], await _manager(hass).async_start(msg.get("hours")))


@websocket_api.require_admin
@websocket_api.async_response
@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/support/stop"})
async def websocket_support_stop(hass, connection, msg) -> None:
    connection.send_result(msg["id"], await _manager(hass).async_stop())


@websocket_api.require_admin
@websocket_api.async_response
@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/support/extend",
        vol.Optional("hours"): vol.All(
            vol.Coerce(float),
            vol.Range(min=HARD_MIN_HOURS, max=HARD_MAX_HOURS),
        ),
    }
)
async def websocket_support_extend(hass, connection, msg) -> None:
    if not _enabled(hass):
        raise HomeAssistantError("Smart Support module is disabled in Smart Home Suite.")
    connection.send_result(msg["id"], await _manager(hass).async_extend(msg.get("hours")))
