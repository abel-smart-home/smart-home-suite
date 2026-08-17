"""Binary sensor platform for Smart Home Suite."""

from __future__ import annotations

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from .const import MODULE_SMART_SUPPORT
from .module_manager import module_enabled
from .modules.smart_support.binary_sensor import SupportActiveBinarySensor
from .modules.smart_support.const import DOMAIN as SUPPORT_DOMAIN


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    """Expose Smart Support binary sensor when its module is enabled."""
    if not module_enabled(entry, MODULE_SMART_SUPPORT):
        return
    manager = hass.data.get(SUPPORT_DOMAIN, {}).get("manager")
    if manager is not None:
        async_add_entities([SupportActiveBinarySensor(manager)])
