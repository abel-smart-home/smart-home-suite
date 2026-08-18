"""Central module catalog for Smart Home Suite.

Adding a future panel should primarily require:
1. Add its package under modules/<module_id>/ with async_setup_module/
   async_unload_module.
2. Add one ModuleSpec entry here.
3. Add/update its module.json descriptor and frontend assets if required.

The rest of the Suite (options, lifecycle and diagnostics) consumes this catalog.
"""

from __future__ import annotations

from dataclasses import dataclass
from collections.abc import Awaitable, Callable

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from .modules.smart_automations import (
    async_setup_module as setup_smart_automations,
    async_unload_module as unload_smart_automations,
)
from .modules.smart_energy_advanced import (
    async_setup_module as setup_smart_energy_advanced,
    async_unload_module as unload_smart_energy_advanced,
)
from .modules.smart_home import (
    async_setup_module as setup_smart_home,
    async_unload_module as unload_smart_home,
)
from .modules.smart_lighting import (
    async_setup_module as setup_smart_lighting,
    async_unload_module as unload_smart_lighting,
)
from .modules.smart_support import (
    async_setup_module as setup_smart_support,
    async_unload_module as unload_smart_support,
)

ModuleSetup = Callable[[HomeAssistant, ConfigEntry], Awaitable[bool]]
ModuleUnload = Callable[[HomeAssistant, ConfigEntry], Awaitable[None]]


@dataclass(frozen=True, slots=True)
class ModuleSpec:
    """Runtime description of one Suite module."""

    module_id: str
    name: str
    option_label: str
    version: str
    panel_path: str
    enabled_by_default: bool
    setup: ModuleSetup
    unload: ModuleUnload
    notes: str = ""


MODULE_CATALOG: tuple[ModuleSpec, ...] = (
    ModuleSpec(
        module_id="smart_home",
        name="Smart Home",
        option_label="Smart Home",
        version="2.0.5",
        panel_path="smart-home",
        enabled_by_default=True,
        setup=setup_smart_home,
        unload=unload_smart_home,
        notes=(
            "Native dashboard bridge 1.3.0 + Suite runtime 1.1.0 "
            "(narrow guard 1.0.0 + configurable cards 1.0.0)"
        ),
    ),
    ModuleSpec(
        module_id="smart_lighting",
        name="Smart Lighting",
        option_label="Smart Lighting",
        version="1.2.0",
        panel_path="lighting",
        enabled_by_default=True,
        setup=setup_smart_lighting,
        unload=unload_smart_lighting,
        notes=(
            "Base panel 1.0.3 + Suite layout runtime 1.1.0; ordering 1.0.0 + "
            "optional global on/off actions 1.0.0 without changing storage/API"
        ),
    ),
    ModuleSpec(
        module_id="smart_energy_advanced",
        name="Smart Energy Advanced",
        option_label="Energía avanzada",
        version="1.4.0",
        panel_path="energy-advanced",
        enabled_by_default=True,
        setup=setup_smart_energy_advanced,
        unload=unload_smart_energy_advanced,
        notes=(
            "Base panel 1.3.1 + Suite ordering runtime 1.0.0; "
            "sections and widgets can be reordered without changing storage/API"
        ),
    ),
    ModuleSpec(
        module_id="smart_automations",
        name="Smart Automations",
        option_label="Automatizaciones",
        version="1.0.0",
        panel_path="smart-automations",
        enabled_by_default=True,
        setup=setup_smart_automations,
        unload=unload_smart_automations,
        notes="Creates and manages native Home Assistant automations",
    ),
    ModuleSpec(
        module_id="smart_support",
        name="Smart Support",
        option_label="Soporte remoto",
        version="1.1.2",
        panel_path="support",
        enabled_by_default=True,
        setup=setup_smart_support,
        unload=unload_smart_support,
        notes=(
            "Remote account actions use Spook; Suite health and Repairs supervise "
            "provider availability"
        ),
    ),
)

MODULE_BY_ID = {spec.module_id: spec for spec in MODULE_CATALOG}
DEFAULT_MODULES = {
    spec.module_id: spec.enabled_by_default for spec in MODULE_CATALOG
}
