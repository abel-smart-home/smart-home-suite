"""Constants for Smart Home Suite."""

from typing import Final

DOMAIN: Final = "smart_home_suite"
VERSION: Final = "0.4.0"

MODULE_SMART_HOME: Final = "smart_home"
MODULE_SMART_LIGHTING: Final = "smart_lighting"
MODULE_SMART_ENERGY_ADVANCED: Final = "smart_energy_advanced"
MODULE_SMART_SUPPORT: Final = "smart_support"

DEFAULT_MODULES: Final = {
    MODULE_SMART_HOME: True,
    MODULE_SMART_LIGHTING: True,
    MODULE_SMART_ENERGY_ADVANCED: True,
    MODULE_SMART_SUPPORT: True,
}
