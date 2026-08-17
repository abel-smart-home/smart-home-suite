"""Binary sensor platform for Smart Support Panel."""

from __future__ import annotations

from homeassistant.components.binary_sensor import BinarySensorEntity
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.dispatcher import async_dispatcher_connect
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.typing import ConfigType, DiscoveryInfoType

from .const import DOMAIN, SIGNAL_SUPPORT_UPDATE


async def async_setup_platform(
    hass: HomeAssistant,
    config: ConfigType,
    async_add_entities: AddEntitiesCallback,
    discovery_info: DiscoveryInfoType | None = None,
) -> None:
    async_add_entities([SupportActiveBinarySensor(hass.data[DOMAIN]["manager"])])


class SupportActiveBinarySensor(BinarySensorEntity):
    """Show whether the temporary support authorization is active."""

    _attr_has_entity_name = True
    _attr_name = "Soporte remoto activo"
    _attr_unique_id = "smart_support_panel_remote_support_active"
    _attr_icon = "mdi:remote-desktop"
    _attr_should_poll = False

    def __init__(self, manager) -> None:
        self.manager = manager

    @property
    def is_on(self) -> bool:
        return bool(self.manager.account_active)

    @property
    def extra_state_attributes(self):
        return {
            "expires_at": self.manager.expires_at.isoformat() if self.manager.expires_at else None,
            "remaining_minutes": self.manager.remaining_minutes,
            "spook_available": self.manager.spook_available,
        }

    async def async_added_to_hass(self) -> None:
        self.async_on_remove(async_dispatcher_connect(self.hass, SIGNAL_SUPPORT_UPDATE, self._handle_update))

    @callback
    def _handle_update(self) -> None:
        self.async_write_ha_state()
