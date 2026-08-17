"""Binary sensor platform for Smart Home Suite."""

from __future__ import annotations

from homeassistant.components.binary_sensor import BinarySensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.device_registry import DeviceInfo
from homeassistant.helpers.dispatcher import async_dispatcher_connect
from homeassistant.helpers.entity import EntityCategory
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from .const import (
    DOMAIN,
    MODULE_SMART_SUPPORT,
    SIGNAL_SUITE_HEALTH_UPDATE,
    VERSION,
)
from .module_catalog import MODULE_CATALOG
from .module_manager import module_enabled
from .modules.smart_support.binary_sensor import SupportActiveBinarySensor
from .modules.smart_support.const import DOMAIN as SUPPORT_DOMAIN
from .support_health import get_smart_support_provider_status


class SuiteHealthBinarySensor(BinarySensorEntity):
    """Report whether enabled modules and required runtime providers are healthy."""

    _attr_has_entity_name = True
    _attr_name = "Salud"
    _attr_unique_id = "smart_home_suite_health"
    _attr_entity_category = EntityCategory.DIAGNOSTIC
    _attr_icon = "mdi:heart-pulse"
    _attr_should_poll = False

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
            spec
            for spec in MODULE_CATALOG
            if module_enabled(self._entry, spec.module_id)
        ]
        modules_ok = all(bool(states.get(spec.module_id, False)) for spec in enabled)
        if not modules_ok:
            return False

        support_provider = get_smart_support_provider_status(self._hass)
        return bool(support_provider["health_ok"])

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
            },
            "runtime_dependencies": {
                "smart_support_account_provider": get_smart_support_provider_status(
                    self._hass
                )
            },
        }

    async def async_added_to_hass(self) -> None:
        self.async_on_remove(
            async_dispatcher_connect(
                self.hass,
                SIGNAL_SUITE_HEALTH_UPDATE,
                self._handle_health_update,
            )
        )

    @callback
    def _handle_health_update(self) -> None:
        self.async_write_ha_state()


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
