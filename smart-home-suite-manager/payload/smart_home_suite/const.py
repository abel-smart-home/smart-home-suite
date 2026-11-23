"""Constants for Smart Home Suite."""

from typing import Final

DOMAIN: Final = "smart_home_suite"
VERSION: Final = "1.15.0-alpha.2"
SIGNAL_SUITE_HEALTH_UPDATE: Final = f"{DOMAIN}_health_update"

# Client Mode (alpha). Options live in config_entry.options["client_mode"].
CLIENT_MODE_OPTION: Final = "client_mode"
CLIENT_MODE_ISSUE_NO_CLIENTS: Final = "client_mode_no_client_users"
# Panels a client can normally see that an installer usually wants to hide.
# Selectable in the options flow; paths of panels that do not exist are ignored.
CLIENT_MODE_PANEL_CHOICES: Final = (
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
    "logbook",
    "history",
    "map",
    "energy",
    "media-browser",
    "todo",
    "calendar",
    "smart-automations",
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
