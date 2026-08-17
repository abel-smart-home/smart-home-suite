"""Module lifecycle manager for Smart Home Suite."""

from __future__ import annotations

import logging

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from .const import (
    DEFAULT_MODULES,
    MODULE_SMART_ENERGY_ADVANCED,
    MODULE_SMART_HOME,
    MODULE_SMART_LIGHTING,
    MODULE_SMART_SUPPORT,
)
from .modules.smart_energy_advanced import (
    async_setup_module as setup_smart_energy_advanced,
    async_unload_module as unload_smart_energy_advanced,
)
from .modules.smart_home import (
    async_setup_module as setup_smart_home,
    async_unload_module as unload_smart_home,
)
from .modules.smart_lighting import (
    async_setup_module as setup_smart_lighting,
    async_unload_module as unload_smart_lighting,
)
from .modules.smart_support import (
    async_setup_module as setup_smart_support,
    async_unload_module as unload_smart_support,
)

_LOGGER = logging.getLogger(__name__)

_MODULES = (
    (MODULE_SMART_HOME, "Smart Home", setup_smart_home, unload_smart_home),
    (MODULE_SMART_LIGHTING, "Smart Lighting", setup_smart_lighting, unload_smart_lighting),
    (
        MODULE_SMART_ENERGY_ADVANCED,
        "Smart Energy Advanced",
        setup_smart_energy_advanced,
        unload_smart_energy_advanced,
    ),
    (MODULE_SMART_SUPPORT, "Smart Support", setup_smart_support, unload_smart_support),
)


def module_enabled(entry: ConfigEntry, module_id: str) -> bool:
    """Return whether a module is enabled for this config entry."""
    configured = entry.options.get("modules", {})
    return bool(configured.get(module_id, DEFAULT_MODULES.get(module_id, False)))


async def async_setup_modules(hass: HomeAssistant, entry: ConfigEntry) -> dict[str, bool]:
    """Set up enabled modules independently so one cannot break the Suite."""
    states: dict[str, bool] = {}
    for module_id, label, setup, _unload in _MODULES:
        if not module_enabled(entry, module_id):
            # Persistent modules such as Smart Home may have a dashboard stored
            # from a previous enabled state. Clean their runtime/storage registration.
            try:
                await _unload(hass, entry)
            except Exception:
                _LOGGER.exception("Unable to clean disabled %s module", label)
            states[module_id] = False
            continue
        try:
            states[module_id] = bool(await setup(hass, entry))
        except Exception:
            _LOGGER.exception("Unable to set up %s module", label)
            states[module_id] = False
    return states


async def async_unload_modules(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Unload every module registration independently."""
    for _module_id, label, _setup, unload in reversed(_MODULES):
        try:
            await unload(hass, entry)
        except Exception:
            _LOGGER.exception("Unable to unload %s module cleanly", label)
