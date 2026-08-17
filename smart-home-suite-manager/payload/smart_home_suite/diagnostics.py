"""Diagnostics for Smart Home Suite."""

from __future__ import annotations

import platform
from typing import Any

from homeassistant.components import frontend
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import __version__ as HA_VERSION
from homeassistant.core import HomeAssistant

from .const import DOMAIN, VERSION
from .module_catalog import MODULE_CATALOG
from .module_manager import module_enabled
from .modules.smart_support.const import DOMAIN as SUPPORT_DOMAIN
from .support_health import get_smart_support_provider_status


async def async_get_config_entry_diagnostics(
    hass: HomeAssistant,
    entry: ConfigEntry,
) -> dict[str, Any]:
    """Return non-sensitive Suite diagnostics."""
    runtime = hass.data.get(DOMAIN, {}).get(entry.entry_id, {})
    setup_states = runtime.get("modules", {})

    modules: list[dict[str, Any]] = []
    for spec in MODULE_CATALOG:
        enabled = module_enabled(entry, spec.module_id)
        modules.append(
            {
                "id": spec.module_id,
                "name": spec.name,
                "module_version": spec.version,
                "enabled": enabled,
                "setup_ok": bool(setup_states.get(spec.module_id, False)),
                "panel_path": spec.panel_path,
                "panel_registered": frontend.async_panel_exists(
                    hass, spec.panel_path
                ),
                "notes": spec.notes or None,
            }
        )

    support_provider = get_smart_support_provider_status(hass)
    support_verification: dict[str, Any] | None = None
    support_manager = hass.data.get(SUPPORT_DOMAIN, {}).get("manager")
    if support_manager is not None and support_provider["module_runtime_enabled"]:
        verification = await support_manager.async_verify()
        support_verification = {
            "ready": bool(verification.get("ready", False)),
            "spook_available": bool(verification.get("spook_available", False)),
            "user_id_configured": bool(
                verification.get("user_id_configured", False)
            ),
            "user_found": bool(verification.get("user_found", False)),
            "user_admin_group": bool(
                verification.get("user_admin_group", False)
            ),
            "user_owner": bool(verification.get("user_owner", False)),
            "message": verification.get("message"),
        }

    return {
        "suite": {
            "version": VERSION,
            "domain": DOMAIN,
            "config_entry_version": entry.version,
            "config_entry_minor_version": entry.minor_version,
            "module_count": len(MODULE_CATALOG),
            "repair_integration": True,
            "runtime_dependency_supervision": True,
        },
        "home_assistant": {
            "version": HA_VERSION,
            "architecture": platform.machine(),
            "python": platform.python_version(),
        },
        "modules": modules,
        "smart_support": {
            "provider": support_provider,
            "verification": support_verification,
        },
    }
