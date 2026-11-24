"""Smart Support Panel V1.2.0 module for Smart Home Suite.

The frontend, session manager, constants and entity classes preserve the
validated Smart Support V1.1.2 backend contract. V1.2.0 changes only the
Support frontend ordering/personalization layer and Suite version metadata.
"""

from __future__ import annotations

import logging
from functools import partial, wraps
from typing import Any

import voluptuous as vol

from homeassistant.components import frontend, panel_custom, websocket_api
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import EVENT_HOMEASSISTANT_STARTED
from homeassistant.core import HomeAssistant, ServiceCall
from homeassistant.exceptions import HomeAssistantError, Unauthorized
from homeassistant.helpers.service import async_register_admin_service, async_set_service_schema
from homeassistant.helpers.storage import Store

from ...client_mode import client_support_authorization_enabled, may_authorize_support
from ...const import VERSION as SUITE_VERSION
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
MODULE_VERSION = "1.3.0"

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


def _register_service_descriptions(hass: HomeAssistant) -> None:
    """Describe legacy smart_support_panel.* services without a standalone integration."""
    async_set_service_schema(
        hass,
        DOMAIN,
        SERVICE_START_SUPPORT,
        {
            "name": "Iniciar soporte remoto",
            "description": "Activa temporalmente el usuario de soporte configurado.",
            "fields": {
                "hours": {
                    "name": "Duración",
                    "description": "Horas de autorización. Si se omite, usa la duración predeterminada.",
                    "required": False,
                    "example": 4,
                    "selector": {
                        "number": {
                            "min": 2,
                            "max": 168,
                            "step": 1,
                            "unit_of_measurement": "h",
                        }
                    },
                }
            },
        },
    )
    async_set_service_schema(
        hass,
        DOMAIN,
        SERVICE_STOP_SUPPORT,
        {
            "name": "Detener soporte remoto",
            "description": "Desactiva inmediatamente el usuario de soporte y cancela la autorización temporal.",
            "fields": {},
        },
    )
    async_set_service_schema(
        hass,
        DOMAIN,
        SERVICE_EXTEND_SUPPORT,
        {
            "name": "Extender soporte remoto",
            "description": "Amplía una sesión activa sin superar el máximo configurado.",
            "fields": {
                "hours": {
                    "name": "Extensión",
                    "description": "Horas adicionales. Si se omite, usa la extensión predeterminada.",
                    "required": False,
                    "example": 2,
                    "selector": {
                        "number": {
                            "min": 2,
                            "max": 168,
                            "step": 1,
                            "unit_of_measurement": "h",
                        }
                    },
                }
            },
        },
    )
    async_set_service_schema(
        hass,
        DOMAIN,
        SERVICE_VERIFY_SUPPORT,
        {
            "name": "Verificar soporte remoto",
            "description": "Comprueba que el usuario configurado exista y que el mecanismo de activación esté disponible.",
            "fields": {},
        },
    )


async def async_setup_module(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Register Smart Support V1.2.0 while preserving its legacy contract."""
    data = _data(hass)
    store = _store(hass)

    if "manager" not in data:
        manager = SupportManager(hass, store)
        data["manager"] = manager
        await manager.async_initialize()
    else:
        manager = data["manager"]

    data["suite_enabled"] = True

    # Register the visual panel early so service metadata problems can never hide
    # the Support UI.
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
        module_url=f"{STATIC_URL}/{FRONTEND_FILE}?v=130-module130-suite1150a5",
        require_admin=False,
        handle_safe_area=True,
        config={
            "suite_version": SUITE_VERSION,
            "module_id": "smart_support",
            "module_version": MODULE_VERSION,
        },
    )
    data["suite_panel_registered"] = True

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

    _register_service_descriptions(hass)

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
            # A one-time listener removes itself after firing. Do not add its
            # remover to ConfigEntry unload, otherwise a later options reload tries
            # to remove an already-consumed listener and logs an unknown-job error.
            hass.bus.async_listen_once(EVENT_HOMEASSISTANT_STARTED, _started)
        data["suite_startup_registered"] = True
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


def _require_support_authorizer(action: str):
    """Websocket guard replacing ``require_admin`` for start/extend/stop.

    Same position and mechanics as ``websocket_api.require_admin``. Administrators
    pass as before; non-administrators pass only when Client Mode allows clients
    to authorize remote support. See ``may_authorize_support``.
    """

    def decorator(func):
        @wraps(func)
        def with_authorizer(hass, connection, msg):
            manager = hass.data.get(DOMAIN, {}).get("manager")
            if not may_authorize_support(
                hass,
                connection.user,
                support_user_id=manager.user_id if manager else "",
                action=action,
            ):
                raise Unauthorized()
            _LOGGER.info(
                "Remote support %s requested by %s (%s)",
                action,
                connection.user.name,
                connection.user.id,
            )
            return func(hass, connection, msg)

        return with_authorizer

    return decorator


def _assert_not_self_authorization(hass: HomeAssistant, call: ServiceCall) -> None:
    """The external support account must not grant itself access."""
    manager = hass.data.get(DOMAIN, {}).get("manager")
    user_id = call.context.user_id
    if (
        manager
        and user_id
        and user_id == manager.user_id
        and client_support_authorization_enabled(hass)
    ):
        raise HomeAssistantError(
            "The support account cannot authorize its own access; "
            "the customer must authorize it."
        )


async def _service_start(hass: HomeAssistant, call: ServiceCall) -> None:
    if not _enabled(hass):
        raise HomeAssistantError("Smart Support module is disabled in Smart Home Suite.")
    _assert_not_self_authorization(hass, call)
    await _manager(hass).async_start(call.data.get("hours"))


async def _service_stop(hass: HomeAssistant, call: ServiceCall) -> None:
    await _manager(hass).async_stop()


async def _service_extend(hass: HomeAssistant, call: ServiceCall) -> None:
    if not _enabled(hass):
        raise HomeAssistantError("Smart Support module is disabled in Smart Home Suite.")
    _assert_not_self_authorization(hass, call)
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


@_require_support_authorizer("start")
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


@_require_support_authorizer("stop")
@websocket_api.async_response
@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/support/stop"})
async def websocket_support_stop(hass, connection, msg) -> None:
    connection.send_result(msg["id"], await _manager(hass).async_stop())


@_require_support_authorizer("extend")
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
