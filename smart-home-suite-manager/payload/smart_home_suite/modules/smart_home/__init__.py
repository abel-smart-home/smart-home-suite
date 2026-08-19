"""Smart Home 1.5.0 module for Smart Home Suite.

Smart Home Panel V2.0.5 and the V1.3.0 native dashboard bridge remain bundled
from the validated stable package. Suite 1.13.0 keeps the existing narrow-render
guard and configurable card layout, then layers Smart Home Layout V3 V1.0.0 on
top without changing the legacy backend/storage contract.
"""

from __future__ import annotations

import logging
from pathlib import Path
from typing import Any

from homeassistant.components import frontend
from homeassistant.components.lovelace import dashboard
from homeassistant.components.lovelace.const import (
    CONF_ALLOW_SINGLE_WORD,
    CONF_ICON,
    CONF_REQUIRE_ADMIN,
    CONF_SHOW_IN_SIDEBAR,
    CONF_TITLE,
    CONF_URL_PATH,
    CONF_RESOURCE_TYPE_WS,
    LOVELACE_DATA,
    MODE_STORAGE,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.const import CONF_URL
from homeassistant.exceptions import HomeAssistantError

from ...const import VERSION as SUITE_VERSION
from ...legacy import smart_home_panel as exact_backend

_LOGGER = logging.getLogger(__name__)

LEGACY_DOMAIN = "smart_home_panel"

PANEL_PATH = "smart-home"
STATIC_URL = "/smart_home_suite_static"
BRIDGE_FILE = "smart-home-native.js"
PANEL_FILE = "smart-home-panel.js"
PANEL_RUNTIME_FILE = "smart-home-panel-runtime.js"
CARD_LAYOUT_FILE = "smart-home-card-layout.js"
LAYOUT_V3_FILE = "smart-home-layout-v3.js"

MODULE_VERSION = "1.5.0"
BASE_PANEL_VERSION = "2.0.5"
RUNTIME_VERSION = "1.1.0"
RUNTIME_GUARD_VERSION = "1.0.0"
CARD_LAYOUT_RUNTIME_VERSION = "1.0.0"
LAYOUT_V3_RUNTIME_VERSION = "1.0.0"
LAYOUT_V3_EFFECTIVE_VERSION = "3.0.0"

DASHBOARD_TITLE = "Smart Home"
DASHBOARD_ICON = "mdi:home-lightning-bolt"


def _data(hass: HomeAssistant) -> dict[str, Any]:
    return hass.data.setdefault(LEGACY_DOMAIN, {})


def _frontend_dir() -> Path:
    return Path(__file__).resolve().parents[2] / "frontend"


async def _ensure_exact_backend(hass: HomeAssistant) -> None:
    """Initialize the exact V2.0.5 backend bundled inside the Suite."""
    data = _data(hass)
    if data.get("suite_exact_backend_ready"):
        return

    if "store" not in data:
        await exact_backend.async_setup(hass, {})

    _data(hass)["suite_exact_backend_ready"] = True
    _data(hass)["suite_backend_source"] = "bundled_exact_v2.0.5"


async def _load_dashboard_collection(
    hass: HomeAssistant,
) -> dashboard.DashboardsCollection:
    collection = dashboard.DashboardsCollection(hass)
    await collection.async_load()
    return collection


def _find_dashboard_item(
    collection: dashboard.DashboardsCollection,
) -> dict | None:
    for item in collection.data.values():
        if item.get(CONF_URL_PATH) == PANEL_PATH:
            return item
    return None


async def _persist_collection(
    collection: dashboard.DashboardsCollection,
) -> None:
    """Flush collection immediately instead of waiting for delayed storage save."""
    await collection.store.async_save({"items": list(collection.data.values())})


async def _ensure_bridge_resource(hass: HomeAssistant) -> None:
    """Persist the Smart Home bridge as a Lovelace module resource."""
    lovelace_data = hass.data.get(LOVELACE_DATA)
    if lovelace_data is None:
        raise HomeAssistantError("Lovelace is not available")

    resource_collection = lovelace_data.resources
    bridge_url = f"{STATIC_URL}/{BRIDGE_FILE}?v=130-suite050"

    await resource_collection.async_get_info()
    items = resource_collection.async_items() or []

    for item in items:
        if item.get(CONF_URL) == bridge_url:
            return

    if not hasattr(resource_collection, "async_create_item"):
        raise HomeAssistantError(
            "Smart Home requires Lovelace resources in storage mode."
        )

    await resource_collection.async_create_item(
        {
            CONF_RESOURCE_TYPE_WS: "module",
            CONF_URL: bridge_url,
        }
    )

    store = getattr(resource_collection, "store", None)
    data = getattr(resource_collection, "data", None)
    if store is not None and data is not None:
        await store.async_save({"items": list(data.values())})


async def _ensure_native_dashboard(hass: HomeAssistant) -> None:
    """Create/attach Smart Home as a real Lovelace storage dashboard."""
    lovelace_data = hass.data.get(LOVELACE_DATA)
    if lovelace_data is None:
        raise HomeAssistantError("Lovelace is not available")

    collection = await _load_dashboard_collection(hass)
    item = _find_dashboard_item(collection)
    current = lovelace_data.dashboards.get(PANEL_PATH)

    if item is None:
        if current is not None or frontend.async_panel_exists(hass, PANEL_PATH):
            raise HomeAssistantError(
                "The /smart-home route is already in use by another dashboard or panel."
            )

        item = await collection.async_create_item(
            {
                CONF_ALLOW_SINGLE_WORD: True,
                CONF_ICON: DASHBOARD_ICON,
                CONF_TITLE: DASHBOARD_TITLE,
                CONF_URL_PATH: PANEL_PATH,
                CONF_REQUIRE_ADMIN: False,
                CONF_SHOW_IN_SIDEBAR: True,
            }
        )
        await _persist_collection(collection)
        ll_config = dashboard.LovelaceStorage(hass, item)
        lovelace_data.dashboards[PANEL_PATH] = ll_config
    else:
        if current is not None:
            current_id = (current.config or {}).get("id")
            if current_id != item.get("id"):
                raise HomeAssistantError(
                    "The /smart-home dashboard belongs to a different dashboard entry."
                )
            ll_config = current
        else:
            ll_config = dashboard.LovelaceStorage(hass, item)
            lovelace_data.dashboards[PANEL_PATH] = ll_config

    # Normal Lovelace panel view. The bridge mounts the V3 runtime, which imports
    # the existing validated V2.0.5 panel runtime and card-layout extension.
    await ll_config.async_save(
        {
            "title": DASHBOARD_TITLE,
            "views": [
                {
                    "title": "Inicio",
                    "path": "inicio",
                    "type": "panel",
                    "cards": [
                        {
                            "type": "custom:smart-home-dashboard-card",
                            "panel_module_url": (
                                f"{STATIC_URL}/{LAYOUT_V3_FILE}"
                                "?v=100-v3-module150-suite1130"
                            ),
                            "hide_ha_header": True,
                            "mobile_menu_access": "admins",
                        }
                    ],
                }
            ],
        }
    )

    if not frontend.async_panel_exists(hass, PANEL_PATH):
        frontend.async_register_built_in_panel(
            hass,
            "lovelace",
            frontend_url_path=PANEL_PATH,
            require_admin=False,
            show_in_sidebar=True,
            sidebar_title=DASHBOARD_TITLE,
            sidebar_icon=DASHBOARD_ICON,
            config={"mode": MODE_STORAGE},
        )


async def async_setup_module(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up Smart Home 1.5.0 with Layout V3 on the exact V2.0.5 base."""
    frontend_dir = _frontend_dir()
    panel_file = frontend_dir / PANEL_FILE
    bridge_file = frontend_dir / BRIDGE_FILE
    runtime_file = frontend_dir / PANEL_RUNTIME_FILE
    card_layout_file = frontend_dir / CARD_LAYOUT_FILE
    layout_v3_file = frontend_dir / LAYOUT_V3_FILE

    if not all(
        path.is_file()
        for path in (
            panel_file,
            bridge_file,
            runtime_file,
            card_layout_file,
            layout_v3_file,
        )
    ):
        _LOGGER.error("Bundled Smart Home frontend sources are incomplete")
        return False

    panel_text = await hass.async_add_executor_job(panel_file.read_text, "utf-8")
    if 'PANEL_VERSION = "2.0.5"' not in panel_text:
        _LOGGER.error("Bundled Smart Home frontend is not V2.0.5")
        return False

    runtime_text = await hass.async_add_executor_job(runtime_file.read_text, "utf-8")
    for token in (
        'SMART_HOME_RUNTIME_GUARD_VERSION = "1.0.0"',
        'SMART_HOME_RUNTIME_VERSION = "1.1.0"',
    ):
        if token not in runtime_text:
            _LOGGER.error("Bundled Smart Home runtime is missing token %s", token)
            return False

    card_layout_text = await hass.async_add_executor_job(
        card_layout_file.read_text, "utf-8"
    )
    if 'SMART_HOME_CARD_LAYOUT_RUNTIME_VERSION = "1.0.0"' not in card_layout_text:
        _LOGGER.error("Bundled Smart Home card-layout runtime is not V1.0.0")
        return False

    layout_v3_text = await hass.async_add_executor_job(
        layout_v3_file.read_text, "utf-8"
    )
    for token in (
        'SMART_HOME_LAYOUT_V3_RUNTIME_VERSION = "1.0.0"',
        'SMART_HOME_LAYOUT_V3_EFFECTIVE_VERSION = "3.0.0"',
        'SMART_HOME_LAYOUT_V3_SCHEMA_VERSION = 1',
        'SMART_HOME_MODULE_VERSION = "1.5.0"',
        'SMART_HOME_V3_DEFAULT_BREAKPOINT = 700',
        'SMART_HOME_V3_DEFAULT_MAX_WIDTH = 1100',
        'SMART_HOME_V3_WIDE_COLUMNS = 4',
        'SMART_HOME_V3_LEGACY_AUTO_WIDTHS = new Set([520])',
        'import "./smart-home-panel-runtime.js?v=110-guard100-cards100-module140-suite1123";',
        'layout_v3',
        'widget_layout',
        'v3-move-section',
        'v3-move-widget',
        'v3-add-section',
        'v3-add-widget',
        'data-v3-widget-section',
        'container-type:inline-size',
        '@container smart-home-v3-page',
    ):
        if token not in layout_v3_text:
            _LOGGER.error("Bundled Smart Home V3 runtime is missing token %s", token)
            return False

    await _ensure_exact_backend(hass)
    await _ensure_bridge_resource(hass)

    data = _data(hass)
    data["suite_bridge_registered"] = True

    await _ensure_native_dashboard(hass)

    data["suite_native_dashboard_registered"] = True
    data["suite_version"] = SUITE_VERSION
    data["module_version"] = MODULE_VERSION
    data["panel_version"] = BASE_PANEL_VERSION
    data["runtime_version"] = RUNTIME_VERSION
    data["runtime_guard_version"] = RUNTIME_GUARD_VERSION
    data["card_layout_runtime_version"] = CARD_LAYOUT_RUNTIME_VERSION
    data["layout_v3_runtime_version"] = LAYOUT_V3_RUNTIME_VERSION
    data["layout_v3_effective_version"] = LAYOUT_V3_EFFECTIVE_VERSION
    return True


async def async_unload_module(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Remove Suite-owned Smart Home dashboard while preserving panel settings."""
    lovelace_data = hass.data.get(LOVELACE_DATA)
    collection = await _load_dashboard_collection(hass)
    item = _find_dashboard_item(collection)

    if item is not None:
        item_id = item.get("id")
        if item_id in collection.data:
            await collection.async_delete_item(item_id)
            await _persist_collection(collection)

    if lovelace_data is not None:
        ll_config = lovelace_data.dashboards.pop(PANEL_PATH, None)
        if ll_config is not None:
            try:
                await ll_config.async_delete()
            except HomeAssistantError:
                _LOGGER.debug("Smart Home dashboard config store was already absent")

    if frontend.async_panel_exists(hass, PANEL_PATH):
        try:
            frontend.async_remove_panel(hass, PANEL_PATH)
        except (KeyError, ValueError):
            pass

    data = hass.data.get(LEGACY_DOMAIN, {})
    data["suite_native_dashboard_registered"] = False
