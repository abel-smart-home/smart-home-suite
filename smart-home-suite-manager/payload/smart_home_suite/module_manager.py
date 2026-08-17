"""Module lifecycle manager for Smart Home Suite."""

from __future__ import annotations

import logging

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from .module_catalog import DEFAULT_MODULES, MODULE_CATALOG

_LOGGER = logging.getLogger(__name__)


def module_enabled(entry: ConfigEntry, module_id: str) -> bool:
    """Return whether a module is enabled for this config entry."""
    configured = entry.options.get("modules", {})
    return bool(configured.get(module_id, DEFAULT_MODULES.get(module_id, False)))


async def async_setup_modules(hass: HomeAssistant, entry: ConfigEntry) -> dict[str, bool]:
    """Set up enabled modules independently so one cannot break the Suite."""
    states: dict[str, bool] = {}

    for spec in MODULE_CATALOG:
        if not module_enabled(entry, spec.module_id):
            # Persistent modules (Smart Home dashboard) need active cleanup when disabled.
            try:
                await spec.unload(hass, entry)
            except Exception:
                _LOGGER.exception("Unable to clean disabled %s module", spec.name)
            states[spec.module_id] = False
            continue

        try:
            states[spec.module_id] = bool(await spec.setup(hass, entry))
        except Exception:
            _LOGGER.exception("Unable to set up %s module", spec.name)
            states[spec.module_id] = False

    return states


async def async_unload_modules(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Unload every module registration independently."""
    for spec in reversed(MODULE_CATALOG):
        try:
            await spec.unload(hass, entry)
        except Exception:
            _LOGGER.exception("Unable to unload %s module cleanly", spec.name)
