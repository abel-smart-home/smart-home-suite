"""Sensor platform for Smart Home Suite."""

from __future__ import annotations

from homeassistant.components.sensor import SensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.device_registry import DeviceInfo
from homeassistant.helpers.entity import EntityCategory
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from .const import DOMAIN, MODULE_SMART_SUPPORT, VERSION
from .module_catalog import MODULE_CATALOG
from .module_manager import module_enabled
from .modules.smart_support.const import DOMAIN as SUPPORT_DOMAIN
from .modules.smart_support.sensor import SupportExpirySensor, SupportRemainingSensor


class SuiteVersionSensor(SensorEntity):
    """Expose Suite version and module versions."""

    _attr_has_entity_name = True
    _attr_name = "Versión"
    _attr_unique_id = "smart_home_suite_version"
    _attr_entity_category = EntityCategory.DIAGNOSTIC
    _attr_icon = "mdi:package-variant-closed"

    def __init__(self, entry: ConfigEntry) -> None:
        self._entry = entry
        self._attr_native_value = VERSION

    @property
    def device_info(self) -> DeviceInfo:
        return DeviceInfo(
            identifiers={(DOMAIN, "suite")},
            name="Smart Home Suite",
            manufacturer="Abel Smart Home",
            model="Smart Home Suite",
            sw_version=VERSION,
        )

    @property
    def extra_state_attributes(self):
        return {
            "modules": {
                spec.module_id: {
                    "name": spec.name,
                    "version": spec.version,
                    "enabled": module_enabled(self._entry, spec.module_id),
                    "panel_path": spec.panel_path,
                }
                for spec in MODULE_CATALOG
            }
        }


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    """Expose Suite diagnostic sensor and Smart Support sensors."""
    entities = [SuiteVersionSensor(entry)]

    if module_enabled(entry, MODULE_SMART_SUPPORT):
        manager = hass.data.get(SUPPORT_DOMAIN, {}).get("manager")
        if manager is not None:
            entities.extend([SupportExpirySensor(manager), SupportRemainingSensor(manager)])

    async_add_entities(entities)
