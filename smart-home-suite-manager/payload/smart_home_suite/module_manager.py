"""Module lifecycle manager for Smart Home Suite."""

from __future__ import annotations

import logging

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers import issue_registry as ir

from .const import DOMAIN
from .module_catalog import DEFAULT_MODULES, MODULE_CATALOG

_LOGGER = logging.getLogger(__name__)


def module_enabled(entry: ConfigEntry, module_id: str) -> bool:
    """Return whether a module is enabled for this config entry."""
    configured = entry.options.get("modules", {})
    return bool(configured.get(module_id, DEFAULT_MODULES.get(module_id, False)))


def _module_issue_id(module_id: str) -> str:
    return f"module_setup_failed_{module_id}"


def _clear_module_issue(hass: HomeAssistant, module_id: str) -> None:
    ir.async_delete_issue(hass, DOMAIN, _module_issue_id(module_id))


def _create_module_issue(hass: HomeAssistant, module_id: str, name: str) -> None:
    """Expose a module load failure through Home Assistant Repairs."""
    ir.async_create_issue(
        hass,
        DOMAIN,
        _module_issue_id(module_id),
        is_fixable=False,
        is_persistent=False,
        severity=ir.IssueSeverity.ERROR,
        translation_key="module_setup_failed",
        translation_placeholders={"module": name},
        data={"module_id": module_id},
    )


async def async_setup_modules(hass: HomeAssistant, entry: ConfigEntry) -> dict[str, bool]:
    """Set up enabled modules independently so one cannot break the Suite."""
    states: dict[str, bool] = {}

    for spec in MODULE_CATALOG:
        if not module_enabled(entry, spec.module_id):
            try:
                await spec.unload(hass, entry)
            except Exception:
                _LOGGER.exception("Unable to clean disabled %s module", spec.name)
            _clear_module_issue(hass, spec.module_id)
            states[spec.module_id] = False
            continue

        try:
            loaded = bool(await spec.setup(hass, entry))
        except Exception:
            _LOGGER.exception("Unable to set up %s module", spec.name)
            _create_module_issue(hass, spec.module_id, spec.name)
            states[spec.module_id] = False
            continue

        states[spec.module_id] = loaded
        if loaded:
            _clear_module_issue(hass, spec.module_id)
        else:
            _LOGGER.error("%s module returned an unsuccessful setup result", spec.name)
            _create_module_issue(hass, spec.module_id, spec.name)

    return states


async def async_unload_modules(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Unload every module registration independently."""
    for spec in reversed(MODULE_CATALOG):
        try:
            await spec.unload(hass, entry)
        except Exception:
            _LOGGER.exception("Unable to unload %s module cleanly", spec.name)
