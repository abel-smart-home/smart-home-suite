"""Binary sensor platform for Smart Home Suite."""

from __future__ import annotations

from homeassistant.components.binary_sensor import BinarySensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.device_registry import DeviceInfo
from homeassistant.helpers.entity import EntityCategory
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from .const import DOMAIN, MODULE_SMART_SUPPORT, VERSION
from .module_catalog import MODULE_CATALOG
from .module_manager import module_enabled
from .modules.smart_support.binary_sensor import SupportActiveBinarySensor
from .modules.smart_support.const import DOMAIN as SUPPORT_DOMAIN


class SuiteHealthBinarySensor(BinarySensorEntity):
    """Report whether every enabled Suite module loaded successfully."""

    _attr_has_entity_name = True
    _attr_name = "Salud"
    _attr_unique_id = "smart_home_suite_health"
    _attr_entity_category = EntityCategory.DIAGNOSTIC
    _attr_icon = "mdi:heart-pulse"

    def __init__(self, hass: HomeAssistant, entry: ConfigEntry) -> None:
        self._hass = hass
        self._entry = entry

    @property
    def device_info(self) -> DeviceInfo:
        return DeviceInfo(
            identifiers={(DOMAIN, "suite")},
            name="Smart Home Suite",
            manufacturer="Abel Smart Home",
            model="Smart Home Suite",
            sw_version=VERSION,
        )

    def _states(self) -> dict[str, bool]:
        return (
            self._hass.data.get(DOMAIN, {})
            .get(self._entry.entry_id, {})
            .get("modules", {})
        )

    @property
    def is_on(self) -> bool:
        states = self._states()
        enabled = [
            spec for spec in MODULE_CATALOG
            if module_enabled(self._entry, spec.module_id)
        ]
        return all(bool(states.get(spec.module_id, False)) for spec in enabled)

    @property
    def extra_state_attributes(self):
        states = self._states()
        return {
            "modules": {
                spec.module_id: {
                    "enabled": module_enabled(self._entry, spec.module_id),
                    "loaded": bool(states.get(spec.module_id, False)),
                    "version": spec.version,
                }
                for spec in MODULE_CATALOG
            }
        }


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    """Expose Suite health and Smart Support binary sensor."""
    entities = [SuiteHealthBinarySensor(hass, entry)]

    if module_enabled(entry, MODULE_SMART_SUPPORT):
        manager = hass.data.get(SUPPORT_DOMAIN, {}).get("manager")
        if manager is not None:
            entities.append(SupportActiveBinarySensor(manager))

    async_add_entities(entities)
