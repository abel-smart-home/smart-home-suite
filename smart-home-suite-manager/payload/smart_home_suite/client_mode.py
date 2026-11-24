"""Client Mode (alpha) for Smart Home Suite.

Hides non-essential sidebar panels from non-administrator users so that an
end customer only sees what the installer decided to expose. Administrators
(the installer / owner) keep the complete Home Assistant UI.

How it works
------------
Home Assistant only lists a panel to a user when ``panel.require_admin`` is
false or the user is an administrator. Client Mode re-registers the selected
panels with ``require_admin=True`` through the public frontend API and
restores them when the mode is disabled or the Suite is unloaded.

Important limits (by design, documented in ALPHA.md)
----------------------------------------------------
* This is UI-level hiding, not a security boundary. A non-admin user can still
  call Home Assistant APIs. Real protection is the non-admin role itself.
* It only changes panels that are currently visible to non-admins. Panels that
  are already admin-only are never touched.
* Nothing is stored in ``.storage``; the configuration lives in the config
  entry options and is optional, so existing installations are unaffected.
"""

from __future__ import annotations

import logging
from typing import Any

import voluptuous as vol
from homeassistant.components import frontend, websocket_api
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import CALLBACK_TYPE, Event, HomeAssistant, callback
from homeassistant.helpers import issue_registry as ir
from homeassistant.helpers.start import async_at_started

from .const import (
    CLIENT_MODE_DEFAULT_HIDDEN_PANELS,
    CLIENT_MODE_DEFAULT_LANDING,
    CLIENT_MODE_ISSUE_NO_CLIENTS,
    CLIENT_MODE_LANDING_CHOICES,
    CLIENT_MODE_LANDING_JS,
    CLIENT_MODE_LANDING_JS_VERSION,
    CLIENT_MODE_OPTION,
    CLIENT_MODE_STATIC_URL,
    CLIENT_MODE_STATUS_COMMAND,
    DOMAIN,
)

_LOGGER = logging.getLogger(__name__)

PANELS_DATA_KEY = getattr(frontend, "DATA_PANELS", "frontend_panels")
EVENT_PANELS_UPDATED = getattr(frontend, "EVENT_PANELS_UPDATED", "panels_updated")
RUNTIME_KEY = "client_mode"


def client_mode_config(entry: ConfigEntry) -> dict[str, Any]:
    """Return the normalized Client Mode configuration of a config entry."""
    raw = entry.options.get(CLIENT_MODE_OPTION, {})
    if not isinstance(raw, dict):
        raw = {}
    hidden = raw.get("hidden_panels")
    if not isinstance(hidden, list):
        hidden = list(CLIENT_MODE_DEFAULT_HIDDEN_PANELS)
    home_panel = raw.get("home_panel")
    if home_panel not in CLIENT_MODE_LANDING_CHOICES:
        home_panel = CLIENT_MODE_DEFAULT_LANDING
    return {
        "enabled": bool(raw.get("enabled", False)),
        "home_panel": home_panel,
        "hidden_panels": [str(path) for path in hidden if str(path).strip()],
        # Clients may open/extend/close the remote-support window, never log in
        # as the support account nor change its configuration.
        "allow_support_authorization": bool(raw.get("allow_support_authorization", True)),
    }


def _runtime(hass: HomeAssistant) -> dict[str, Any]:
    return hass.data.setdefault(DOMAIN, {}).setdefault(
        RUNTIME_KEY,
        {
            "hidden": set(),
            "restricted": {},
            "unsubs": [],
            "enabled": False,
            "allow_support": False,
            "home_panel": CLIENT_MODE_DEFAULT_LANDING,
        },
    )


def _panel_kwargs(panel: Any, *, require_admin: bool) -> dict[str, Any]:
    """Build register arguments that reproduce an existing panel."""
    kwargs: dict[str, Any] = {
        "sidebar_title": getattr(panel, "sidebar_title", None),
        "sidebar_icon": getattr(panel, "sidebar_icon", None),
        "frontend_url_path": panel.frontend_url_path,
        "config": getattr(panel, "config", None),
        "require_admin": require_admin,
    }
    config_panel_domain = getattr(panel, "config_panel_domain", None)
    if config_panel_domain is not None:
        kwargs["config_panel_domain"] = config_panel_domain
    return kwargs


def _replace_panel(hass: HomeAssistant, panel: Any, *, require_admin: bool) -> None:
    """Re-register a panel changing only its admin requirement."""
    kwargs = _panel_kwargs(panel, require_admin=require_admin)
    frontend.async_remove_panel(hass, panel.frontend_url_path)
    frontend.async_register_built_in_panel(hass, panel.component_name, **kwargs)


@callback
def _async_apply(hass: HomeAssistant) -> None:
    """Restrict every configured panel that is currently visible to clients.

    Idempotent: panels that are already admin-only are skipped, so the
    ``panels_updated`` event fired by our own re-registration is a no-op.
    """
    runtime = _runtime(hass)
    panels = hass.data.get(PANELS_DATA_KEY, {})
    for path in sorted(runtime["hidden"]):
        panel = panels.get(path)
        if panel is None or getattr(panel, "require_admin", True):
            continue
        try:
            _replace_panel(hass, panel, require_admin=True)
        except Exception:  # noqa: BLE001 - never break the Suite for a panel
            _LOGGER.exception("Client Mode could not restrict panel /%s", path)
            continue
        runtime["restricted"][path] = True
        _LOGGER.info("Client Mode: panel /%s is now administrator-only", path)


@callback
def _async_restore(hass: HomeAssistant) -> None:
    """Give back client access to the panels this module restricted."""
    runtime = _runtime(hass)
    panels = hass.data.get(PANELS_DATA_KEY, {})
    for path in list(runtime["restricted"]):
        panel = panels.get(path)
        runtime["restricted"].pop(path, None)
        if panel is None or not getattr(panel, "require_admin", False):
            continue
        try:
            _replace_panel(hass, panel, require_admin=False)
        except Exception:  # noqa: BLE001
            _LOGGER.exception("Client Mode could not restore panel /%s", path)


async def _async_check_client_accounts(hass: HomeAssistant, enabled: bool) -> None:
    """Warn the installer when Client Mode has nobody to apply to."""
    if not enabled:
        ir.async_delete_issue(hass, DOMAIN, CLIENT_MODE_ISSUE_NO_CLIENTS)
        return

    users = await hass.auth.async_get_users()
    has_client = any(
        user.is_active and not user.system_generated and not user.is_admin
        for user in users
    )
    if has_client:
        ir.async_delete_issue(hass, DOMAIN, CLIENT_MODE_ISSUE_NO_CLIENTS)
        return

    ir.async_create_issue(
        hass,
        DOMAIN,
        CLIENT_MODE_ISSUE_NO_CLIENTS,
        is_fixable=False,
        is_persistent=False,
        severity=ir.IssueSeverity.WARNING,
        translation_key=CLIENT_MODE_ISSUE_NO_CLIENTS,
    )


@websocket_api.websocket_command({vol.Required("type"): CLIENT_MODE_STATUS_COMMAND})
@callback
def _ws_client_mode_status(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]
) -> None:
    """Tell the landing script whether to redirect. Open to every user.

    Returns only non-sensitive values (mode, landing panel, hidden panel ids)
    and changes nothing.
    """
    runtime = hass.data.get(DOMAIN, {}).get(RUNTIME_KEY, {})
    connection.send_result(
        msg["id"],
        {
            "enabled": bool(runtime.get("enabled")),
            "home_panel": runtime.get("home_panel", CLIENT_MODE_DEFAULT_LANDING),
            # Defense in depth: never a valid destination even if still listed.
            "blocked_panels": sorted(runtime.get("hidden", ())),
        },
    )


@callback
def _async_register_landing(hass: HomeAssistant, runtime: dict[str, Any]) -> None:
    """Register the status command and the landing script once per HA run.

    Both stay registered while the integration is loaded; when Client Mode is
    off the status reports ``enabled: false`` and the script does nothing.
    """
    if runtime.get("landing_registered"):
        return
    websocket_api.async_register_command(hass, _ws_client_mode_status)
    frontend.add_extra_js_url(
        hass,
        f"{CLIENT_MODE_STATIC_URL}/{CLIENT_MODE_LANDING_JS}"
        f"?v={CLIENT_MODE_LANDING_JS_VERSION}",
    )
    runtime["landing_registered"] = True


def _cancel(unsub: CALLBACK_TYPE) -> None:
    try:
        unsub()
    except (KeyError, ValueError):
        _LOGGER.debug("Client Mode listener was already removed")


async def async_setup_client_mode(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Start Client Mode when enabled in the options of the config entry."""
    config = client_mode_config(entry)
    runtime = _runtime(hass)
    runtime["hidden"] = set(config["hidden_panels"])
    runtime["enabled"] = config["enabled"]
    runtime["allow_support"] = config["allow_support_authorization"]
    runtime["home_panel"] = config["home_panel"]
    _async_register_landing(hass, runtime)

    await _async_check_client_accounts(hass, config["enabled"])
    if not config["enabled"]:
        return

    @callback
    def _on_panels_updated(_event: Event) -> None:
        _async_apply(hass)

    @callback
    def _on_started(_hass: HomeAssistant) -> None:
        _async_apply(hass)

    # Built-in panels are registered by their own integrations at an
    # unpredictable moment, so react to every panel change as well as to start.
    runtime["unsubs"].append(
        hass.bus.async_listen(EVENT_PANELS_UPDATED, _on_panels_updated)
    )
    runtime["unsubs"].append(async_at_started(hass, _on_started))
    _async_apply(hass)


async def async_unload_client_mode(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Stop Client Mode and give every restricted panel back to clients."""
    runtime = _runtime(hass)
    for unsub in runtime["unsubs"]:
        _cancel(unsub)
    runtime["unsubs"].clear()
    _async_restore(hass)
    runtime["hidden"] = set()
    runtime["enabled"] = False
    runtime["allow_support"] = False
    runtime["home_panel"] = CLIENT_MODE_DEFAULT_LANDING
    ir.async_delete_issue(hass, DOMAIN, CLIENT_MODE_ISSUE_NO_CLIENTS)


def client_mode_status(hass: HomeAssistant, entry: ConfigEntry) -> dict[str, Any]:
    """Return a non-sensitive status summary for diagnostics and sensors."""
    config = client_mode_config(entry)
    runtime = hass.data.get(DOMAIN, {}).get(RUNTIME_KEY, {})
    return {
        "enabled": config["enabled"],
        "home_panel": config["home_panel"],
        "configured_hidden_panels": config["hidden_panels"],
        "allow_support_authorization": config["allow_support_authorization"],
        "restricted_panels": sorted(runtime.get("restricted", {})),
    }


def client_support_authorization_enabled(hass: HomeAssistant) -> bool:
    """Return True while clients may authorize remote support."""
    runtime = hass.data.get(DOMAIN, {}).get(RUNTIME_KEY, {})
    return bool(runtime.get("enabled") and runtime.get("allow_support"))


def may_authorize_support(
    hass: HomeAssistant, user: Any, *, support_user_id: str, action: str
) -> bool:
    """Decide who may start, extend or stop the remote-support window.

    * Administrators always may, as before.
    * With client authorization enabled, an active non-administrator may too:
      the customer grants (and revokes) access for the external support account.
    * With it enabled, the support account itself may not start or extend its
      own window; the customer must authorize it. It can still stop it.
    """
    if user is None:
        return False
    enabled = client_support_authorization_enabled(hass)
    is_support_account = bool(support_user_id) and user.id == support_user_id
    if enabled and is_support_account and action in ("start", "extend"):
        return False
    if user.is_admin:
        return True
    return bool(enabled and user.is_active and not is_support_account)
