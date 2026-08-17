"""Config flow for Smart Home Suite."""

from __future__ import annotations

import voluptuous as vol

from homeassistant import config_entries
from homeassistant.core import callback
from homeassistant.data_entry_flow import FlowResult

from .const import DEFAULT_MODULES, DOMAIN, MODULE_SMART_LIGHTING


class SmartHomeSuiteConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle a config flow for Smart Home Suite."""

    VERSION = 1
    MINOR_VERSION = 2

    async def async_step_user(self, user_input: dict | None = None) -> FlowResult:
        """Handle the initial step."""
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
    """Configure Suite modules."""

    async def async_step_init(self, user_input: dict | None = None) -> FlowResult:
        current_modules = self.config_entry.options.get("modules", {})
        current_lighting = bool(
            current_modules.get(MODULE_SMART_LIGHTING, DEFAULT_MODULES[MODULE_SMART_LIGHTING])
        )

        if user_input is not None:
            return self.async_create_entry(
                title="",
                data={
                    **self.config_entry.options,
                    "modules": {MODULE_SMART_LIGHTING: bool(user_input["smart_lighting"])},
                },
            )

        return self.async_show_form(
            step_id="init",
            data_schema=vol.Schema(
                {vol.Required("smart_lighting", default=current_lighting): bool}
            ),
        )
