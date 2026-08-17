"""Runtime dependency supervision for Smart Support."""

from __future__ import annotations

from typing import Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import (
    ATTR_DOMAIN,
    ATTR_SERVICE,
    EVENT_HOMEASSISTANT_STARTED,
    EVENT_SERVICE_REGISTERED,
    EVENT_SERVICE_REMOVED,
)
from homeassistant.core import Event, HomeAssistant, callback
from homeassistant.helpers import issue_registry as ir
from homeassistant.helpers.dispatcher import (
    async_dispatcher_connect,
    async_dispatcher_send,
)

from .const import DOMAIN, MODULE_SMART_SUPPORT, SIGNAL_SUITE_HEALTH_UPDATE
from .modules.smart_support.const import (
    DOMAIN as SUPPORT_DOMAIN,
    SIGNAL_SUPPORT_UPDATE,
)

PROVIDER_NAME = "Spook"
PROVIDER_DOMAIN = "homeassistant"
ENABLE_SERVICE = "enable_user"
DISABLE_SERVICE = "disable_user"
PROVIDER_SERVICES = {ENABLE_SERVICE, DISABLE_SERVICE}
ISSUE_ID = "smart_support_provider_unavailable"


def get_smart_support_provider_status(hass: HomeAssistant) -> dict[str, Any]:
    """Return a non-sensitive snapshot of the Smart Support provider state."""
    support_data = hass.data.get(SUPPORT_DOMAIN, {})
    manager = support_data.get("manager")
    module_runtime_enabled = bool(support_data.get("suite_enabled", False))

    remote_enabled = False
    user_id_configured = False
    tracked_session_active = False
    account_active = False
    if manager is not None:
        remote = manager.remote_config
        remote_enabled = bool(remote.get("enabled", True))
        user_id_configured = bool(manager.user_id)
        tracked_session_active = bool(manager.active)
        account_active = bool(manager.account_active)

    enable_available = hass.services.has_service(PROVIDER_DOMAIN, ENABLE_SERVICE)
    disable_available = hass.services.has_service(PROVIDER_DOMAIN, DISABLE_SERVICE)
    provider_ready = enable_available and disable_available
    required = module_runtime_enabled and remote_enabled and user_id_configured

    missing_actions: list[str] = []
    if not enable_available:
        missing_actions.append(f"{PROVIDER_DOMAIN}.{ENABLE_SERVICE}")
    if not disable_available:
        missing_actions.append(f"{PROVIDER_DOMAIN}.{DISABLE_SERVICE}")

    if not required:
        state = "not_required"
    elif provider_ready:
        state = "ready"
    else:
        state = "unavailable"

    return {
        "provider": PROVIDER_NAME,
        "module_id": MODULE_SMART_SUPPORT,
        "module_runtime_enabled": module_runtime_enabled,
        "remote_support_enabled": remote_enabled,
        "user_id_configured": user_id_configured,
        "tracked_session_active": tracked_session_active,
        "account_active": account_active,
        "required": required,
        "ready": provider_ready,
        "health_ok": (not required) or provider_ready,
        "state": state,
        "enable_user_available": enable_available,
        "disable_user_available": disable_available,
        "missing_actions": missing_actions,
    }


@callback
def refresh_smart_support_provider_health(hass: HomeAssistant) -> dict[str, Any]:
    """Refresh Repair state and notify Suite health entities."""
    status = get_smart_support_provider_status(hass)

    if status["health_ok"]:
        ir.async_delete_issue(hass, DOMAIN, ISSUE_ID)
    else:
        missing = ", ".join(status["missing_actions"]) or "unknown"
        ir.async_create_issue(
            hass,
            DOMAIN,
            ISSUE_ID,
            is_fixable=False,
            is_persistent=False,
            severity=(
                ir.IssueSeverity.ERROR
                if status["tracked_session_active"] or status["account_active"]
                else ir.IssueSeverity.WARNING
            ),
            translation_key="smart_support_provider_unavailable",
            translation_placeholders={"actions": missing},
            data={
                "module_id": MODULE_SMART_SUPPORT,
                "provider": PROVIDER_NAME,
                "enable_user_available": status["enable_user_available"],
                "disable_user_available": status["disable_user_available"],
                "tracked_session_active": status["tracked_session_active"],
                "account_active": status["account_active"],
            },
        )

    async_dispatcher_send(hass, SIGNAL_SUITE_HEALTH_UPDATE)
    return status


@callback
def clear_smart_support_provider_health(hass: HomeAssistant) -> None:
    """Remove the provider Repair and refresh Suite health state."""
    ir.async_delete_issue(hass, DOMAIN, ISSUE_ID)
    async_dispatcher_send(hass, SIGNAL_SUITE_HEALTH_UPDATE)


@callback
def setup_smart_support_provider_watch(
    hass: HomeAssistant,
    entry: ConfigEntry,
    *,
    enabled: bool,
) -> None:
    """Watch provider service/config changes without altering Support behavior."""
    if not enabled:
        clear_smart_support_provider_health(hass)
        return

    @callback
    def _service_changed(event: Event) -> None:
        # During startup integrations may register related services one by one.
        # Wait until Home Assistant is fully running to avoid transient Repairs.
        if not hass.is_running:
            return
        if (
            event.data.get(ATTR_DOMAIN) == PROVIDER_DOMAIN
            and event.data.get(ATTR_SERVICE) in PROVIDER_SERVICES
        ):
            refresh_smart_support_provider_health(hass)

    @callback
    def _support_runtime_changed() -> None:
        if hass.is_running:
            refresh_smart_support_provider_health(hass)

    entry.async_on_unload(
        hass.bus.async_listen(EVENT_SERVICE_REGISTERED, _service_changed)
    )
    entry.async_on_unload(
        hass.bus.async_listen(EVENT_SERVICE_REMOVED, _service_changed)
    )
    entry.async_on_unload(
        async_dispatcher_connect(hass, SIGNAL_SUPPORT_UPDATE, _support_runtime_changed)
    )

    if hass.is_running:
        refresh_smart_support_provider_health(hass)
        return

    @callback
    def _started(_event: Event) -> None:
        # The one-shot listener intentionally is not registered with
        # entry.async_on_unload: once consumed, removing it again can produce an
        # unknown-listener warning. The runtime guard makes it harmless if the
        # entry was unloaded before Home Assistant finished starting.
        if entry.entry_id not in hass.data.get(DOMAIN, {}):
            return
        refresh_smart_support_provider_health(hass)

    hass.bus.async_listen_once(EVENT_HOMEASSISTANT_STARTED, _started)
