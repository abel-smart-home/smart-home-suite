/**
 * Smart Home Suite · Native V3 Bridge v1.0.0
 *
 * Imports the validated Smart Home Native Dashboard Bridge V1.3.0 and reuses
 * its header controller, mobile menu behavior, route scoping and fail-open
 * lifecycle. Only panel creation changes: this card mounts <smart-home-panel-v3>.
 */

import "./smart-home-native.js?v=130-suite050";

const SMART_HOME_NATIVE_V3_BRIDGE_VERSION = "1.0.0";
const SMART_HOME_PANEL_V3_ELEMENT = "smart-home-panel-v3";
const DEFAULT_V3_PANEL_MODULE_URL =
  "/smart_home_suite_static/smart-home-panel-v3.js?v=310-panel-module160-suite1140";
const NATIVE_PREFERENCES_EVENT = "smart-home-native-preferences";

const BaseDashboardCard = customElements.get("smart-home-dashboard-card");
if (!BaseDashboardCard) {
  throw new Error("Smart Home Native V3 requires smart-home-dashboard-card V1.3.0");
}

const panelImports = new Map();

async function ensureV3Panel(moduleUrl = DEFAULT_V3_PANEL_MODULE_URL) {
  if (customElements.get(SMART_HOME_PANEL_V3_ELEMENT)) return;

  let promise = panelImports.get(moduleUrl);
  if (!promise) {
    promise = import(moduleUrl).then(async () => {
      await customElements.whenDefined(SMART_HOME_PANEL_V3_ELEMENT);
    });
    panelImports.set(moduleUrl, promise);
  }
  await promise;
}

class SmartHomeDashboardCardV3 extends BaseDashboardCard {
  async _ensurePanel() {
    if (!this.isConnected || this._loading || this._panelElement) return;

    this._loading = true;
    this._error = null;
    this._renderState();

    try {
      const moduleUrl = this._config.panel_module_url || DEFAULT_V3_PANEL_MODULE_URL;
      await ensureV3Panel(moduleUrl);
      if (!this.isConnected || this._panelElement) return;

      const panel = document.createElement(SMART_HOME_PANEL_V3_ELEMENT);
      panel.smartHomeNativeDefaults = {
        hide_ha_header: this._config.hide_ha_header !== false,
        mobile_menu_access: this._config.mobile_menu_access || "admins",
      };
      panel.addEventListener(
        NATIVE_PREFERENCES_EVENT,
        this._onPanelNativePreferences,
      );

      panel.panel = {
        url_path: "smart-home",
        title: "Smart Home",
        config: {},
      };

      this._panelElement = panel;
      this._mountPanel();
      this._syncPanel();
    } catch (err) {
      this._error = err instanceof Error ? err : new Error(String(err));
      console.error(
        "[Smart Home Native V3] No se pudo montar Smart Home Panel V3",
        err,
      );
      this._renderState();
    } finally {
      this._loading = false;
      if (!this._panelElement) this._renderState();
    }
  }

  _mountPanel() {
    super._mountPanel();

    if (!this.shadowRoot) return;
    const style = document.createElement("style");
    style.dataset.smartHomeNativeV3 = SMART_HOME_NATIVE_V3_BRIDGE_VERSION;
    style.textContent = `
      smart-home-panel-v3 {
        display:block;
        width:100%;
        min-height:100%;
      }
    `;
    this.shadowRoot.append(style);
  }
}

if (!customElements.get("smart-home-dashboard-card-v3")) {
  customElements.define("smart-home-dashboard-card-v3", SmartHomeDashboardCardV3);
}

console.info(
  `[Smart Home Native V3] Bridge v${SMART_HOME_NATIVE_V3_BRIDGE_VERSION} cargado`,
);
