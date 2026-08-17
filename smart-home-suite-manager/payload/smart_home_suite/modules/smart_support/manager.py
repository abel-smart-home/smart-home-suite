"""Remote support session manager for Smart Support Panel."""

from __future__ import annotations

from datetime import datetime, timedelta
import logging
from typing import Any

from homeassistant.auth.const import GROUP_ID_ADMIN
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import HomeAssistantError
from homeassistant.helpers.dispatcher import async_dispatcher_send
from homeassistant.helpers.event import async_call_later
from homeassistant.helpers.storage import Store
from homeassistant.util import dt as dt_util

from .const import (
    DEFAULT_EXTENSION_HOURS,
    DEFAULT_HOURS,
    DEFAULT_MAX_HOURS,
    DEFAULT_MIN_HOURS,
    HARD_MAX_HOURS,
    HARD_MIN_HOURS,
    SESSION_STORAGE_KEY,
    SESSION_STORAGE_VERSION,
    SIGNAL_SUPPORT_UPDATE,
)

_LOGGER = logging.getLogger(__name__)


class SupportManager:
    """Manage the temporary Home Assistant support account session."""

    def __init__(self, hass: HomeAssistant, config_store: Store[dict[str, Any]]) -> None:
        self.hass = hass
        self.config_store = config_store
        self.session_store = Store[dict[str, Any]](
            hass, SESSION_STORAGE_VERSION, SESSION_STORAGE_KEY
        )
        self.config: dict[str, Any] = {}
        self.active = False
        self.account_active = False
        self.started_at: datetime | None = None
        self.expires_at: datetime | None = None
        self.duration_hours: float | None = None
        self.last_error: str | None = None
        self._cancel_expiry = None

    async def async_initialize(self) -> None:
        """Load configuration and the previous session marker."""
        self.config = await self.config_store.async_load() or {}
        session = await self.session_store.async_load() or {}
        self.active = bool(session.get("active", False))
        self.started_at = self._parse_dt(session.get("started_at"))
        self.expires_at = self._parse_dt(session.get("expires_at"))
        try:
            self.duration_hours = float(session.get("duration_hours")) if session.get("duration_hours") is not None else None
        except (TypeError, ValueError):
            self.duration_hours = None

    async def async_on_homeassistant_started(self) -> None:
        """Reconcile the support account after all integrations have loaded."""
        remote = self.remote_config
        user_id = self.user_id
        if not user_id:
            await self._clear_session(save=True)
            self._notify()
            return

        if remote.get("close_on_restart", True):
            try:
                await self._set_user_active(False)
                self.last_error = None
            except HomeAssistantError as err:
                self.last_error = str(err)
                _LOGGER.warning("Could not disable support user on startup: %s", err)
            await self._clear_session(save=True)
            self._notify()
            return

        # Optional continuity mode. If the previous authorization is still valid,
        # restore it; otherwise force the account off.
        if self.active and self.expires_at and self.expires_at > dt_util.utcnow():
            try:
                await self._set_user_active(True)
                self._schedule_expiry()
                self.last_error = None
            except HomeAssistantError as err:
                self.last_error = str(err)
                await self._clear_session(save=True)
        else:
            try:
                await self._set_user_active(False)
                self.last_error = None
            except HomeAssistantError as err:
                self.last_error = str(err)
            await self._clear_session(save=True)
        self._notify()

    @property
    def remote_config(self) -> dict[str, Any]:
        """Return normalized remote support configuration."""
        raw = self.config.get("remote_support", {})
        if not isinstance(raw, dict):
            raw = {}
        minimum = self._clamp(raw.get("min_hours", DEFAULT_MIN_HOURS), HARD_MIN_HOURS, HARD_MAX_HOURS, DEFAULT_MIN_HOURS)
        maximum = self._clamp(raw.get("max_hours", DEFAULT_MAX_HOURS), minimum, HARD_MAX_HOURS, DEFAULT_MAX_HOURS)
        default = self._clamp(raw.get("default_hours", DEFAULT_HOURS), minimum, maximum, DEFAULT_HOURS)
        extension = self._clamp(raw.get("extension_hours", DEFAULT_EXTENSION_HOURS), HARD_MIN_HOURS, maximum, DEFAULT_EXTENSION_HOURS)
        return {
            "enabled": bool(raw.get("enabled", True)),
            "user_id": str(raw.get("user_id", "") or "").strip(),
            "min_hours": minimum,
            "default_hours": default,
            "max_hours": maximum,
            "extension_hours": extension,
            "close_on_restart": bool(raw.get("close_on_restart", True)),
        }

    @property
    def user_id(self) -> str:
        return self.remote_config["user_id"]

    @property
    def remaining_seconds(self) -> int:
        if not self.active or not self.expires_at:
            return 0
        return max(0, int((self.expires_at - dt_util.utcnow()).total_seconds()))

    @property
    def remaining_minutes(self) -> int:
        seconds = self.remaining_seconds
        if seconds <= 0:
            return 0
        return max(1, (seconds + 59) // 60)

    @property
    def spook_available(self) -> bool:
        return self.hass.services.has_service("homeassistant", "enable_user") and self.hass.services.has_service("homeassistant", "disable_user")

    async def async_update_config(self, config: dict[str, Any]) -> None:
        """Update runtime config, safely closing access if its account/policy changes."""
        new_config = config or {}
        old_user_id = self.user_id
        old_enabled = self.remote_config["enabled"]
        raw_remote = new_config.get("remote_support", {}) if isinstance(new_config, dict) else {}
        if not isinstance(raw_remote, dict):
            raw_remote = {}
        new_user_id = str(raw_remote.get("user_id", "") or "").strip()
        new_enabled = bool(raw_remote.get("enabled", True))

        # Never orphan an enabled support account when changing the configured ID
        # or disabling the remote-support feature.
        if old_user_id and (old_user_id != new_user_id or (old_enabled and not new_enabled)):
            old_user = await self.hass.auth.async_get_user(old_user_id)
            if old_user and old_user.is_active:
                await self._set_specific_user_active(old_user_id, False)
            await self._clear_session(save=True)

        self.config = new_config
        if new_user_id:
            user = await self.hass.auth.async_get_user(new_user_id)
            self.account_active = bool(user and user.is_active)
        else:
            self.account_active = False
        self._notify()

    async def async_verify(self, user_id_override: str | None = None, enabled_override: bool | None = None) -> dict[str, Any]:
        """Verify Spook and the configured support account without changing it."""
        remote = dict(self.remote_config)
        if user_id_override is not None:
            remote["user_id"] = str(user_id_override or "").strip()
        if enabled_override is not None:
            remote["enabled"] = bool(enabled_override)
        result: dict[str, Any] = {
            "ready": False,
            "spook_available": self.spook_available,
            "user_id_configured": bool(remote["user_id"]),
            "user_found": False,
            "user_name": None,
            "user_active": None,
            "user_admin_group": False,
            "user_owner": False,
            "message": "",
        }
        if not remote["enabled"]:
            result["message"] = "El soporte remoto está deshabilitado en la configuración."
            return result
        if not self.spook_available:
            result["message"] = "Spook no está disponible o no registró las acciones de usuarios."
            return result
        if not remote["user_id"]:
            result["message"] = "Falta configurar el ID del usuario de soporte."
            return result
        user = await self.hass.auth.async_get_user(remote["user_id"])
        if user is None:
            result["message"] = "No se encontró el usuario configurado."
            return result
        result["user_found"] = True
        result["user_name"] = user.name
        result["user_active"] = user.is_active
        if user_id_override is None:
            self.account_active = bool(user.is_active)
        result["user_owner"] = user.is_owner
        result["user_admin_group"] = user.is_owner or any(group.id == GROUP_ID_ADMIN for group in user.groups)
        if user.is_owner:
            result["message"] = "Por seguridad, el usuario propietario no puede usarse como cuenta de soporte."
            return result
        if not result["user_admin_group"]:
            result["message"] = "El usuario existe, pero no pertenece al grupo Administradores."
            return result
        result["ready"] = True
        result["message"] = "Soporte remoto listo."
        return result

    async def async_start(self, hours: float | None = None) -> dict[str, Any]:
        """Enable the support account and start a temporary authorization."""
        verify = await self.async_verify()
        if not verify["ready"]:
            raise HomeAssistantError(verify["message"])

        remote = self.remote_config
        selected = remote["default_hours"] if hours is None else float(hours)
        selected = self._clamp(selected, remote["min_hours"], remote["max_hours"], remote["default_hours"])

        await self._set_user_active(True)
        now = dt_util.utcnow()
        self.active = True
        self.started_at = now
        self.expires_at = now + timedelta(hours=selected)
        self.duration_hours = selected
        self.last_error = None
        await self._save_session()
        self._schedule_expiry()
        self._notify()
        return await self.async_status()

    async def async_stop(self, reason: str = "manual") -> dict[str, Any]:
        """Disable the support account and clear authorization state."""
        if self.user_id:
            await self._set_user_active(False)
        self.last_error = None
        await self._clear_session(save=True)
        self._notify()
        _LOGGER.info("Remote support stopped (%s)", reason)
        return await self.async_status()

    async def async_extend(self, hours: float | None = None) -> dict[str, Any]:
        """Extend an active support session."""
        if not self.active or not self.expires_at:
            raise HomeAssistantError("No hay una sesión de soporte activa para extender.")
        verify = await self.async_verify()
        if not verify["ready"]:
            raise HomeAssistantError(verify["message"])

        remote = self.remote_config
        extension = remote["extension_hours"] if hours is None else float(hours)
        extension = self._clamp(extension, HARD_MIN_HOURS, remote["max_hours"], remote["extension_hours"])
        now = dt_util.utcnow()
        base = self.expires_at if self.expires_at > now else now
        # max_hours is also the maximum remaining authorization window.
        maximum_expiry = now + timedelta(hours=remote["max_hours"])
        self.expires_at = min(base + timedelta(hours=extension), maximum_expiry)
        self.duration_hours = max(0.0, (self.expires_at - (self.started_at or now)).total_seconds() / 3600)
        self.last_error = None
        await self._save_session()
        self._schedule_expiry()
        self._notify()
        return await self.async_status()

    async def async_status(self) -> dict[str, Any]:
        """Return runtime status safe for the frontend."""
        verify = await self.async_verify()
        # Reconcile with the actual auth user state without silently enabling it.
        actual_active = False
        if self.user_id:
            user = await self.hass.auth.async_get_user(self.user_id)
            actual_active = bool(user and user.is_active)
        if self.active and self.expires_at and self.expires_at <= dt_util.utcnow():
            # Expiry callback should normally handle this, but status is a second guard.
            self.hass.async_create_task(self.async_stop(reason="expired_guard"), "Smart Support expiry guard")
        self.account_active = actual_active
        return {
            "active": actual_active,
            "authorized_active": bool(self.active and actual_active),
            "tracked_active": self.active,
            "account_active": actual_active,
            "started_at": self._iso(self.started_at),
            "expires_at": self._iso(self.expires_at),
            "remaining_seconds": self.remaining_seconds,
            "remaining_minutes": self.remaining_minutes,
            "duration_hours": self.duration_hours,
            "last_error": self.last_error,
            "config": {
                "enabled": self.remote_config["enabled"],
                "min_hours": self.remote_config["min_hours"],
                "default_hours": self.remote_config["default_hours"],
                "max_hours": self.remote_config["max_hours"],
                "extension_hours": self.remote_config["extension_hours"],
                "close_on_restart": self.remote_config["close_on_restart"],
                "user_id_configured": bool(self.user_id),
            },
            "verification": verify,
        }

    async def _set_user_active(self, active: bool) -> None:
        user_id = self.user_id
        if not user_id:
            raise HomeAssistantError("Falta configurar el ID del usuario de soporte.")
        await self._set_specific_user_active(user_id, active)
        self.account_active = bool(active)

    async def _set_specific_user_active(self, user_id: str, active: bool) -> None:
        """Enable/disable a specific non-owner support account through Spook."""
        user = await self.hass.auth.async_get_user(user_id)
        if user is None:
            raise HomeAssistantError("No se encontró el usuario de soporte configurado.")
        if user.is_owner:
            raise HomeAssistantError("El propietario de Home Assistant no puede usarse como usuario de soporte.")
        if active and not any(group.id == GROUP_ID_ADMIN for group in user.groups):
            raise HomeAssistantError("El usuario de soporte debe pertenecer al grupo Administradores.")
        if not self.spook_available:
            raise HomeAssistantError("Spook no está disponible. Instálalo y reinicia Home Assistant.")
        service = "enable_user" if active else "disable_user"
        try:
            await self.hass.services.async_call(
                "homeassistant",
                service,
                {"user_id": user_id},
                blocking=True,
            )
        except Exception as err:
            _LOGGER.exception("Spook user action failed")
            raise HomeAssistantError(
                f"No se pudo {'activar' if active else 'desactivar'} el usuario de soporte: {err}"
            ) from err
        user = await self.hass.auth.async_get_user(user_id)
        if user is None or user.is_active is not active:
            raise HomeAssistantError("Home Assistant no confirmó el cambio de estado del usuario de soporte.")

    def _schedule_expiry(self) -> None:
        if self._cancel_expiry:
            self._cancel_expiry()
            self._cancel_expiry = None
        if not self.active or not self.expires_at:
            return
        seconds = max(0.0, (self.expires_at - dt_util.utcnow()).total_seconds())

        async def _expire(_now) -> None:
            try:
                await self.async_stop(reason="expired")
            except HomeAssistantError as err:
                self.last_error = str(err)
                _LOGGER.error("Failed to stop support at expiry: %s", err)
                self._notify()

        self._cancel_expiry = async_call_later(self.hass, seconds, _expire)

    async def _save_session(self) -> None:
        await self.session_store.async_save(
            {
                "active": self.active,
                "started_at": self._iso(self.started_at),
                "expires_at": self._iso(self.expires_at),
                "duration_hours": self.duration_hours,
            }
        )

    async def _clear_session(self, save: bool) -> None:
        if self._cancel_expiry:
            self._cancel_expiry()
            self._cancel_expiry = None
        self.active = False
        self.account_active = False
        self.started_at = None
        self.expires_at = None
        self.duration_hours = None
        if save:
            await self.session_store.async_save({})

    def _notify(self) -> None:
        async_dispatcher_send(self.hass, SIGNAL_SUPPORT_UPDATE)

    @staticmethod
    def _parse_dt(value: Any) -> datetime | None:
        if not value:
            return None
        if isinstance(value, datetime):
            return value
        parsed = dt_util.parse_datetime(str(value))
        if parsed is None:
            return None
        if parsed.tzinfo is None:
            parsed = parsed.replace(tzinfo=dt_util.UTC)
        return parsed

    @staticmethod
    def _iso(value: datetime | None) -> str | None:
        return value.isoformat() if value else None

    @staticmethod
    def _clamp(value: Any, minimum: float, maximum: float, fallback: float) -> float:
        try:
            number = float(value)
        except (TypeError, ValueError):
            number = float(fallback)
        return max(float(minimum), min(float(maximum), number))
