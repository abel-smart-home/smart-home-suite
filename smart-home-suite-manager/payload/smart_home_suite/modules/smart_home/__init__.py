"""Smart Home 1.6.0 module for Smart Home Suite.

Suite 1.14.0 promotes the V3 concept into a real custom element:
smart-home-panel-v3.js V3.1.0. The validated Smart Home Panel V2.0.5,
Suite runtime V1.1.0 and Card Layout V1.0.0 stay packaged and provide the
functional compatibility base. The legacy layout-v3 runtime from 1.13.0
remains in the repository but is no longer loaded by /smart-home.
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
V3_BRIDGE_FILE = "smart-home-native-v3.js"
PANEL_FILE = "smart-home-panel.js"
PANEL_RUNTIME_FILE = "smart-home-panel-runtime.js"
CARD_LAYOUT_FILE = "smart-home-card-layout.js"
LEGACY_LAYOUT_V3_FILE = "smart-home-layout-v3.js"
PANEL_V3_FILE = "smart-home-panel-v3.js"

MODULE_VERSION = "1.6.0"
BASE_PANEL_VERSION = "2.0.5"
PANEL_V3_VERSION = "3.1.0"
RUNTIME_VERSION = "1.1.0"
RUNTIME_GUARD_VERSION = "1.0.0"
CARD_LAYOUT_RUNTIME_VERSION = "1.0.0"
LEGACY_LAYOUT_V3_RUNTIME_VERSION = "1.0.0"
V3_BRIDGE_VERSION = "1.0.0"

DASHBOARD_TITLE = "Smart Home"
DASHBOARD_ICON = "mdi:home-lightning-bolt"


def _data(hass: HomeAssistant) -> dict[str, Any]:
    return hass.data.setdefault(LEGACY_DOMAIN, {})


def _frontend_dir() -> Path:
    return Path(__file__).resolve().parents[2] / "frontend"


async def _ensure_exact_backend(hass: HomeAssistant) -> None:
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
    await collection.store.async_save({"items": list(collection.data.values())})


async def _ensure_resource(hass: HomeAssistant, url: str) -> None:
    lovelace_data = hass.data.get(LOVELACE_DATA)
    if lovelace_data is None:
        raise HomeAssistantError("Lovelace is not available")

    resources = lovelace_data.resources
    await resources.async_get_info()
    items = resources.async_items() or []

    if any(item.get(CONF_URL) == url for item in items):
        return

    if not hasattr(resources, "async_create_item"):
        raise HomeAssistantError(
            "Smart Home requires Lovelace resources in storage mode."
        )

    await resources.async_create_item(
        {
            CONF_RESOURCE_TYPE_WS: "module",
            CONF_URL: url,
        }
    )

    store = getattr(resources, "store", None)
    data = getattr(resources, "data", None)
    if store is not None and data is not None:
        await store.async_save({"items": list(data.values())})


async def _ensure_bridge_resources(hass: HomeAssistant) -> None:
    await _ensure_resource(
        hass,
        f"{STATIC_URL}/{BRIDGE_FILE}?v=130-suite050",
    )
    await _ensure_resource(
        hass,
        f"{STATIC_URL}/{V3_BRIDGE_FILE}?v=100-v3bridge-suite1140",
    )


async def _ensure_native_dashboard(hass: HomeAssistant) -> None:
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
                            "type": "custom:smart-home-dashboard-card-v3",
                            "panel_module_url": (
                                f"{STATIC_URL}/{PANEL_V3_FILE}"
                                "?v=310-panel-module160-suite1140"
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
    frontend_dir = _frontend_dir()

    required = {
        PANEL_FILE: frontend_dir / PANEL_FILE,
        BRIDGE_FILE: frontend_dir / BRIDGE_FILE,
        V3_BRIDGE_FILE: frontend_dir / V3_BRIDGE_FILE,
        PANEL_RUNTIME_FILE: frontend_dir / PANEL_RUNTIME_FILE,
        CARD_LAYOUT_FILE: frontend_dir / CARD_LAYOUT_FILE,
        LEGACY_LAYOUT_V3_FILE: frontend_dir / LEGACY_LAYOUT_V3_FILE,
        PANEL_V3_FILE: frontend_dir / PANEL_V3_FILE,
    }

    if not all(path.is_file() for path in required.values()):
        missing = [name for name, path in required.items() if not path.is_file()]
        _LOGGER.error("Bundled Smart Home frontend sources are incomplete: %s", missing)
        return False

    panel_text = await hass.async_add_executor_job(
        required[PANEL_FILE].read_text,
        "utf-8",
    )
    if 'PANEL_VERSION = "2.0.5"' not in panel_text:
        _LOGGER.error("Bundled Smart Home fallback frontend is not V2.0.5")
        return False

    runtime_text = await hass.async_add_executor_job(
        required[PANEL_RUNTIME_FILE].read_text,
        "utf-8",
    )
    for token in (
        'SMART_HOME_RUNTIME_GUARD_VERSION = "1.0.0"',
        'SMART_HOME_RUNTIME_VERSION = "1.1.0"',
    ):
        if token not in runtime_text:
            _LOGGER.error("Bundled Smart Home runtime is missing token %s", token)
            return False

    card_layout_text = await hass.async_add_executor_job(
        required[CARD_LAYOUT_FILE].read_text,
        "utf-8",
    )
    if 'SMART_HOME_CARD_LAYOUT_RUNTIME_VERSION = "1.0.0"' not in card_layout_text:
        _LOGGER.error("Bundled Smart Home card-layout runtime is not V1.0.0")
        return False

    panel_v3_text = await hass.async_add_executor_job(
        required[PANEL_V3_FILE].read_text,
        "utf-8",
    )
    for token in (
        'SMART_HOME_PANEL_V3_VERSION = "3.1.0"',
        'SMART_HOME_MODULE_VERSION = "1.6.0"',
        'SMART_HOME_LAYOUT_V3_SCHEMA_VERSION = 1',
        'class SmartHomePanelV3 extends LegacyPanel',
        'customElements.define("smart-home-panel-v3", SmartHomePanelV3)',
        'container-type:inline-size',
        '@container smart-home-v3-page',
        'layout_v3',
        'widget_layout',
        'v3-move-section',
        'v3-move-widget',
        'ha-selector',
        'ha-icon-picker',
    ):
        if token not in panel_v3_text:
            _LOGGER.error("Bundled Smart Home native V3 panel is missing token %s", token)
            return False

    bridge_v3_text = await hass.async_add_executor_job(
        required[V3_BRIDGE_FILE].read_text,
        "utf-8",
    )
    for token in (
        'SMART_HOME_NATIVE_V3_BRIDGE_VERSION = "1.0.0"',
        'SMART_HOME_PANEL_V3_ELEMENT = "smart-home-panel-v3"',
        'class SmartHomeDashboardCardV3 extends BaseDashboardCard',
        'customElements.define("smart-home-dashboard-card-v3", SmartHomeDashboardCardV3)',
    ):
        if token not in bridge_v3_text:
            _LOGGER.error("Bundled Smart Home V3 bridge is missing token %s", token)
            return False

    await _ensure_exact_backend(hass)
    await _ensure_bridge_resources(hass)

    data = _data(hass)
    data["suite_bridge_registered"] = True
    data["suite_v3_bridge_registered"] = True

    await _ensure_native_dashboard(hass)

    data["suite_native_dashboard_registered"] = True
    data["suite_version"] = SUITE_VERSION
    data["module_version"] = MODULE_VERSION
    data["panel_version"] = BASE_PANEL_VERSION
    data["panel_v3_version"] = PANEL_V3_VERSION
    data["runtime_version"] = RUNTIME_VERSION
    data["runtime_guard_version"] = RUNTIME_GUARD_VERSION
    data["card_layout_runtime_version"] = CARD_LAYOUT_RUNTIME_VERSION
    data["legacy_layout_v3_runtime_version"] = LEGACY_LAYOUT_V3_RUNTIME_VERSION
    data["v3_bridge_version"] = V3_BRIDGE_VERSION
    return True


async def async_unload_module(hass: HomeAssistant, entry: ConfigEntry) -> None:
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
