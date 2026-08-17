"""Sensor platform for Smart Home Suite."""

from __future__ import annotations

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from .const import MODULE_SMART_SUPPORT
from .module_manager import module_enabled
from .modules.smart_support.const import DOMAIN as SUPPORT_DOMAIN
from .modules.smart_support.sensor import SupportExpirySensor, SupportRemainingSensor


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    """Expose Smart Support sensors when its module is enabled."""
    if not module_enabled(entry, MODULE_SMART_SUPPORT):
        return
    manager = hass.data.get(SUPPORT_DOMAIN, {}).get("manager")
    if manager is not None:
        async_add_entities([SupportExpirySensor(manager), SupportRemainingSensor(manager)])
