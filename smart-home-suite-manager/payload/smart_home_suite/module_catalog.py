"""Central module catalog for Smart Home Suite."""

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
        version="1.4.1",
        panel_path="lighting",
        enabled_by_default=True,
        setup=setup_smart_lighting,
        unload=unload_smart_lighting,
        notes=(
            "Base panel 1.0.3 + layout runtime 1.2.0 + responsive runtime 1.1.0; "
            "mobile unchanged, tablet/desktop Global Actions inherit the device "
            "card grid without changing storage or personalization"
        ),
    ),
    ModuleSpec(
        module_id="smart_energy_advanced",
        name="Smart Energy Advanced",
        option_label="Energía avanzada",
        version="1.5.1",
        panel_path="energy-advanced",
        enabled_by_default=True,
        setup=setup_smart_energy_advanced,
        unload=unload_smart_energy_advanced,
        notes=(
            "Base panel 1.3.1 + ordering runtime 1.0.0 + responsive runtime 1.1.0; "
            "mobile remains unchanged, tablet stays 2 columns but is capped at 780px, "
            "desktop keeps the validated 4-column layout up to 1000px"
        ),
    ),
    ModuleSpec(
        module_id="smart_automations",
        name="Smart Automations",
        option_label="Automatizaciones",
        version="1.3.0",
        panel_path="smart-automations",
        enabled_by_default=True,
        setup=setup_smart_automations,
        unload=unload_smart_automations,
        notes=(
            "Base panel 1.0.0 + layout 1.0.0 + color guard 1.0.0 + responsive "
            "1.0.0 + alert control 1.0.0; controlled energy notifications remain "
            "native Home Assistant automations without helpers or storage migration"
        ),
    ),
    ModuleSpec(
        module_id="smart_support",
        name="Smart Support",
        option_label="Soporte remoto",
        version="1.2.0",
        panel_path="support",
        enabled_by_default=True,
        setup=setup_smart_support,
        unload=unload_smart_support,
        notes=(
            "V1.1.2 backend/session contract preserved; V1.2.0 adds compact action "
            "ordering, inherited global/per-action visual customization and color guard"
        ),
    ),
)

MODULE_BY_ID = {spec.module_id: spec for spec in MODULE_CATALOG}
DEFAULT_MODULES = {
    spec.module_id: spec.enabled_by_default for spec in MODULE_CATALOG
}
