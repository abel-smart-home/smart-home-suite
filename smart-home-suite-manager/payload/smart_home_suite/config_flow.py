"""Config flow for Smart Home Suite."""

from __future__ import annotations

import voluptuous as vol

from homeassistant import config_entries
from homeassistant.core import callback
from homeassistant.data_entry_flow import FlowResult

from .const import (
    DEFAULT_MODULES,
    DOMAIN,
    MODULE_SMART_ENERGY_ADVANCED,
    MODULE_SMART_HOME,
    MODULE_SMART_LIGHTING,
    MODULE_SMART_SUPPORT,
)


class SmartHomeSuiteConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle a config flow for Smart Home Suite."""

    VERSION = 1
    MINOR_VERSION = 3

    async def async_step_user(self, user_input: dict | None = None) -> FlowResult:
        if self._async_current_entries():
            return self.async_abort(reason="already_configured")
        if user_input is not None:
            return self.async_create_entry(title="Smart Home Suite", data={})
        return self.async_show_form(step_id="user", data_schema=vol.Schema({}))

    @staticmethod
    @callback
    def async_get_options_flow(config_entry: config_entries.ConfigEntry):
        return SmartHomeSuiteOptionsFlow()


class SmartHomeSuiteOptionsFlow(config_entries.OptionsFlow):
    """Enable or disable Suite modules."""

    async def async_step_init(self, user_input: dict | None = None) -> FlowResult:
        current = self.config_entry.options.get("modules", {})

        defaults = {
            "smart_home": bool(current.get(
                MODULE_SMART_HOME, DEFAULT_MODULES[MODULE_SMART_HOME]
            )),
            "smart_lighting": bool(current.get(
                MODULE_SMART_LIGHTING, DEFAULT_MODULES[MODULE_SMART_LIGHTING]
            )),
            "smart_energy_advanced": bool(current.get(
                MODULE_SMART_ENERGY_ADVANCED,
                DEFAULT_MODULES[MODULE_SMART_ENERGY_ADVANCED],
            )),
            "smart_support": bool(current.get(
                MODULE_SMART_SUPPORT, DEFAULT_MODULES[MODULE_SMART_SUPPORT]
            )),
        }

        if user_input is not None:
            return self.async_create_entry(
                title="",
                data={
                    **self.config_entry.options,
                    "modules": {
                        MODULE_SMART_HOME: bool(user_input["smart_home"]),
                        MODULE_SMART_LIGHTING: bool(user_input["smart_lighting"]),
                        MODULE_SMART_ENERGY_ADVANCED: bool(
                            user_input["smart_energy_advanced"]
                        ),
                        MODULE_SMART_SUPPORT: bool(user_input["smart_support"]),
                    },
                },
            )

        return self.async_show_form(
            step_id="init",
            data_schema=vol.Schema({
                vol.Required("smart_home", default=defaults["smart_home"]): bool,
                vol.Required("smart_lighting", default=defaults["smart_lighting"]): bool,
                vol.Required(
                    "smart_energy_advanced",
                    default=defaults["smart_energy_advanced"],
                ): bool,
                vol.Required("smart_support", default=defaults["smart_support"]): bool,
            }),
        )
