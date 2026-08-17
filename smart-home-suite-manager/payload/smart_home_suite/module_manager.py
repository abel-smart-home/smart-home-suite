"""Module lifecycle manager for Smart Home Suite."""

from __future__ import annotations

import logging

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from .const import DEFAULT_MODULES, MODULE_SMART_LIGHTING
from .modules.smart_lighting import async_setup_module as setup_smart_lighting
from .modules.smart_lighting import async_unload_module as unload_smart_lighting

_LOGGER = logging.getLogger(__name__)


def module_enabled(entry: ConfigEntry, module_id: str) -> bool:
    """Return whether a module is enabled for this config entry."""
    configured = entry.options.get("modules", {})
    return bool(configured.get(module_id, DEFAULT_MODULES.get(module_id, False)))


async def async_setup_modules(hass: HomeAssistant, entry: ConfigEntry) -> dict[str, bool]:
    """Set up all enabled modules independently."""
    states: dict[str, bool] = {}

    if module_enabled(entry, MODULE_SMART_LIGHTING):
        try:
            states[MODULE_SMART_LIGHTING] = await setup_smart_lighting(hass, entry)
        except Exception:  # keep one module from breaking the whole Suite
            _LOGGER.exception("Unable to set up Smart Lighting module")
            states[MODULE_SMART_LIGHTING] = False
    else:
        states[MODULE_SMART_LIGHTING] = False

    return states


async def async_unload_modules(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Unload modules registered by the Suite."""
    try:
        await unload_smart_lighting(hass, entry)
    except Exception:
        _LOGGER.exception("Unable to unload Smart Lighting module cleanly")
