"""Constants for Smart Home Suite."""

from typing import Final

DOMAIN: Final = "smart_home_suite"
VERSION: Final = "1.15.0-alpha.7"
SIGNAL_SUITE_HEALTH_UPDATE: Final = f"{DOMAIN}_health_update"

# Client Mode (alpha). Options live in config_entry.options["client_mode"].
CLIENT_MODE_OPTION: Final = "client_mode"
CLIENT_MODE_ISSUE_NO_CLIENTS: Final = "client_mode_no_client_users"
CLIENT_MODE_STATUS_COMMAND: Final = f"{DOMAIN}/client_mode/status"
CLIENT_MODE_STATIC_URL: Final = "/smart_home_suite_static"
CLIENT_MODE_LANDING_JS: Final = "smart-home-client-landing.js"
CLIENT_MODE_LANDING_JS_VERSION: Final = "102-suite1150a7"
# Panels a non-administrator can be sent to when they open "/" or a hidden panel.
CLIENT_MODE_LANDING_CHOICES: Final = ("smart-home", "lighting", "energy-advanced")
CLIENT_MODE_DEFAULT_LANDING: Final = "smart-home"
# Panels a client can normally see that an installer usually wants to hide.
# Selectable in the options flow; paths of panels that do not exist are ignored.
CLIENT_MODE_PANEL_CHOICES: Final = (
    "home",
    "lovelace",
    "logbook",
    "history",
    "map",
    "energy",
    "media-browser",
    "todo",
    "calendar",
    "lighting",
    "energy-advanced",
    "smart-automations",
    "support",
)
CLIENT_MODE_DEFAULT_HIDDEN_PANELS: Final = (
    "home",
    "lovelace",
    "logbook",
    "history",
    "map",
    "energy",
    "media-browser",
    "todo",
    "calendar",
)

MODULE_SMART_HOME: Final = "smart_home"
MODULE_SMART_LIGHTING: Final = "smart_lighting"
MODULE_SMART_ENERGY_ADVANCED: Final = "smart_energy_advanced"
MODULE_SMART_AUTOMATIONS: Final = "smart_automations"
MODULE_SMART_SUPPORT: Final = "smart_support"

DEFAULT_MODULES: Final = {
    MODULE_SMART_HOME: True,
    MODULE_SMART_LIGHTING: True,
    MODULE_SMART_ENERGY_ADVANCED: True,
    MODULE_SMART_AUTOMATIONS: True,
    MODULE_SMART_SUPPORT: True,
}
