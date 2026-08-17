"""Config flow for Smart Home Suite."""

from __future__ import annotations

import voluptuous as vol

from homeassistant import config_entries
from homeassistant.core import callback
from homeassistant.data_entry_flow import FlowResult

from .const import DOMAIN
from .module_catalog import MODULE_CATALOG


class SmartHomeSuiteConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle a config flow for Smart Home Suite."""

    VERSION = 1
    MINOR_VERSION = 4

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
    """Enable or disable Suite modules from the central module catalog."""

    async def async_step_init(self, user_input: dict | None = None) -> FlowResult:
        current = self.config_entry.options.get("modules", {})

        if user_input is not None:
            return self.async_create_entry(
                title="",
                data={
                    **self.config_entry.options,
                    "modules": {
                        spec.module_id: bool(user_input[spec.module_id])
                        for spec in MODULE_CATALOG
                    },
                },
            )

        schema: dict = {}
        for spec in MODULE_CATALOG:
            enabled = bool(
                current.get(spec.module_id, spec.enabled_by_default)
            )
            schema[vol.Required(spec.module_id, default=enabled)] = bool

        return self.async_show_form(
            step_id="init",
            data_schema=vol.Schema(schema),
        )
