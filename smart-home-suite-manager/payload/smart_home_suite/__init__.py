"""Smart Home Suite integration."""

from __future__ import annotations

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from .const import DOMAIN, VERSION
from .module_manager import async_setup_modules, async_unload_modules


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up Smart Home Suite from a config entry."""
    hass.data.setdefault(DOMAIN, {})
    entry.async_on_unload(entry.add_update_listener(async_reload_entry))

    module_states = await async_setup_modules(hass, entry)
    hass.data[DOMAIN][entry.entry_id] = {
        "version": VERSION,
        "modules": module_states,
    }
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a Smart Home Suite config entry."""
    await async_unload_modules(hass, entry)
    domain_data = hass.data.get(DOMAIN, {})
    domain_data.pop(entry.entry_id, None)
    if not domain_data:
        hass.data.pop(DOMAIN, None)
    return True


async def async_reload_entry(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Reload after module options change."""
    await hass.config_entries.async_reload(entry.entry_id)
