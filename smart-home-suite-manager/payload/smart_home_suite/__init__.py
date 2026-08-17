"""Smart Home Suite integration."""

from __future__ import annotations

import logging
from pathlib import Path

from homeassistant.components.http import StaticPathConfig
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant

from .const import DOMAIN, MODULE_SMART_SUPPORT, VERSION
from .module_manager import (
    async_setup_modules,
    async_unload_modules,
    module_enabled,
)
from .support_health import (
    clear_smart_support_provider_health,
    setup_smart_support_provider_watch,
)

_LOGGER = logging.getLogger(__name__)
PLATFORMS = [Platform.BINARY_SENSOR, Platform.SENSOR]
STATIC_URL = "/smart_home_suite_static"


async def _async_register_static_frontend(hass: HomeAssistant) -> None:
    """Serve Suite-owned exact frontend sources from the integration folder."""
    data = hass.data.setdefault(DOMAIN, {})
    if data.get("static_registered"):
        return
    frontend_dir = Path(__file__).resolve().parent / "frontend"
    try:
        await hass.http.async_register_static_paths(
            [StaticPathConfig(STATIC_URL, str(frontend_dir), False)]
        )
    except RuntimeError:
        # A config-entry reload leaves the HTTP static route registered.
        _LOGGER.debug("Smart Home Suite static route is already registered")
    data["static_registered"] = True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up Smart Home Suite from a config entry."""
    hass.data.setdefault(DOMAIN, {})
    entry.async_on_unload(entry.add_update_listener(async_reload_entry))

    await _async_register_static_frontend(hass)
    module_states = await async_setup_modules(hass, entry)

    # Store runtime state before entities are forwarded so diagnostic entities
    # can report the correct module state from their first update.
    hass.data[DOMAIN][entry.entry_id] = {
        "version": VERSION,
        "modules": module_states,
    }

    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)

    setup_smart_support_provider_watch(
        hass,
        entry,
        enabled=module_enabled(entry, MODULE_SMART_SUPPORT),
    )
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload the Suite while keeping persistent module configuration."""
    platforms_ok = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    clear_smart_support_provider_health(hass)
    await async_unload_modules(hass, entry)

    domain_data = hass.data.get(DOMAIN, {})
    domain_data.pop(entry.entry_id, None)
    # Keep shared runtime flags such as the registered static route.
    return platforms_ok


async def async_reload_entry(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Reload after module options change."""
    await hass.config_entries.async_reload(entry.entry_id)
