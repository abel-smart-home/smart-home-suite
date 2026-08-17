/**
 * Smart Home Native Dashboard Bridge v1.3.0
 *
 * Purpose:
 * - Keep the existing Smart Home Panel frontend/backend unchanged.
 * - Expose the existing <smart-home-panel> custom element as a Lovelace card.
 * - Provide a Home Assistant dashboard strategy so /smart-home can be a native dashboard.
 * - Optionally hide ONLY the native Lovelace header while Smart Home is mounted.
 * - Provide a native HA sidebar-menu button in narrow/mobile layout, controlled by role.
 *
 * Safety design for header hiding:
 * - CSS-only: never removes/replaces Home Assistant DOM nodes.
 * - Route-scoped: only active on /smart-home and child routes.
 * - Lifecycle-scoped: automatically restores the header when the card disconnects.
 * - Fail-open: if Home Assistant's DOM changes, Smart Home still loads; the HA header stays visible.
 * - Escape hatch: append ?show_ha_header=1 to force the HA header visible.
 *
 * Existing Smart Home Panel contract preserved:
 *   element: smart-home-panel
 *   properties: hass, panel, narrow
 *   backend WebSocket namespace: smart_home_panel/*
 */

const SMART_HOME_NATIVE_BRIDGE_VERSION = "1.3.0";
const DEFAULT_PANEL_MODULE_URL = "/local/smart-home-panel/smart-home-panel.js?v=205";
const SMART_HOME_ROUTE = "/smart-home";
const HEADER_STYLE_ID = "smart-home-native-hide-ha-header";
const NATIVE_PREFERENCES_EVENT = "smart-home-native-preferences";
const PANEL_NATIVE_HIDE_HEADER_PATH = "native.hide_ha_header";
const PANEL_NATIVE_MOBILE_MENU_PATH = "native.mobile_menu_access";
const MOBILE_MENU_DEFAULT = "admins";
const MOBILE_MENU_VALUES = new Set(["admins", "all", "hidden"]);
const PANEL_ENHANCEMENT_MARKER = Symbol.for("smart-home-native-enhancements-v1.3.0");

const _smartHomePanelImports = new Map();
const _headerStyleRefs = new WeakMap();

async function ensureSmartHomePanel(moduleUrl = DEFAULT_PANEL_MODULE_URL) {
  if (!customElements.get("smart-home-panel")) {
    let promise = _smartHomePanelImports.get(moduleUrl);
    if (!promise) {
      promise = import(moduleUrl).then(async () => {
        await customElements.whenDefined("smart-home-panel");
      });
      _smartHomePanelImports.set(moduleUrl, promise);
    }
    await promise;
  }

  // v1.3.0 augments the existing V2.0.5 class instead of replacing its file.
  // If a future panel version changes these private helpers, enhancement failure is fail-open:
  // Smart Home still mounts and the YAML header fallback remains active.
  try {
    enhanceSmartHomePanelEditor();
  } catch (err) {
    console.warn("[Smart Home Native] No se pudieron activar mejoras de Personalización", err);
  }
}

function isSmartHomeRoute(pathname = window.location.pathname) {
  const path = String(pathname || "/").replace(/\/+$/, "") || "/";
  return path === SMART_HOME_ROUTE || path.startsWith(`${SMART_HOME_ROUTE}/`);
}

function headerEscapeRequested(search = window.location.search) {
  const params = new URLSearchParams(search || "");
  return params.has("show_ha_header") || params.has("show_header");
}

/**
 * Find the ShadowRoot hosted by <hui-root> by walking UP from this card.
 * This is preferred because it does not assume Home Assistant's full shell hierarchy.
 */
function findHuiRootFromAncestor(element) {
  let current = element;

  for (let depth = 0; depth < 16 && current; depth += 1) {
    const root = current.getRootNode?.();
    const host = root?.host;
    if (!host) return null;

    if (String(host.localName || "").toLowerCase() === "hui-root") {
      return root;
    }

    current = host;
  }

  return null;
}

/**
 * Non-destructive fallback: search only OPEN shadow roots for <hui-root>.
 * It is intentionally bounded so a future HA DOM change cannot cause runaway work.
 */
function findHuiRootByOpenShadowSearch() {
  const start = document.documentElement;
  if (!start) return null;

  const queue = [start];
  let visited = 0;
  const maxVisited = 1400;

  while (queue.length && visited < maxVisited) {
    const node = queue.shift();
    visited += 1;
    if (!node) continue;

    if (
      String(node.localName || "").toLowerCase() === "hui-root" &&
      node.shadowRoot
    ) {
      return node.shadowRoot;
    }

    if (node.shadowRoot?.children) {
      queue.push(...node.shadowRoot.children);
    }

    if (node.children) {
      queue.push(...node.children);
    }
  }

  return null;
}

function findHuiRootShadowRoot(owner) {
  return findHuiRootFromAncestor(owner) || findHuiRootByOpenShadowSearch();
}

/**
 * Minimal CSS derived from the current Home Assistant Lovelace structure.
 * This mirrors the non-destructive principle used by current kiosk solutions:
 * hide .header and let #view consume the released vertical space.
 */
function buildHeaderStyleText() {
  return `
    .header {
      display: none !important;
    }

    #view {
      min-height: 100vh !important;
      --kiosk-header-height: 0px;
      padding-top: calc(
        var(--kiosk-header-height) +
        var(--safe-area-inset-top, 0px) +
        var(--view-container-padding-top, 0px)
      ) !important;
    }
  `;
}

function acquireHeaderStyle(root) {
  if (!root) return false;

  const existingState = _headerStyleRefs.get(root);
  if (existingState) {
    existingState.count += 1;
    return true;
  }

  let style = root.getElementById?.(HEADER_STYLE_ID) ||
    root.querySelector?.(`#${HEADER_STYLE_ID}`);

  if (!style) {
    style = document.createElement("style");
    style.id = HEADER_STYLE_ID;
    style.dataset.smartHomeNative = SMART_HOME_NATIVE_BRIDGE_VERSION;
    style.textContent = buildHeaderStyleText();
    root.append(style);
  }

  _headerStyleRefs.set(root, { count: 1, style });
  return true;
}

function releaseHeaderStyle(root) {
  if (!root) return;

  const state = _headerStyleRefs.get(root);
  if (!state) {
    // Only remove a style that clearly belongs to this bridge.
    const orphan = root.getElementById?.(HEADER_STYLE_ID) ||
      root.querySelector?.(`#${HEADER_STYLE_ID}`);
    if (orphan?.dataset?.smartHomeNative) orphan.remove();
    return;
  }

  state.count -= 1;
  if (state.count > 0) return;

  state.style?.remove();
  _headerStyleRefs.delete(root);
}


function readObjectPath(source, path) {
  if (!source || typeof source !== "object") return undefined;
  return String(path || "")
    .split(".")
    .reduce((current, key) => current?.[key], source);
}

function resolvePanelHideHeader(panel) {
  const fallback = panel?.smartHomeNativeDefaults?.hide_ha_header !== false;
  const source = panel?._editorOpen && panel?._editConfig
    ? panel._editConfig
    : panel?._storedConfig;
  const saved = readObjectPath(source, PANEL_NATIVE_HIDE_HEADER_PATH);
  return typeof saved === "boolean" ? saved : fallback;
}

function normalizeMobileMenuAccess(value, fallback = MOBILE_MENU_DEFAULT) {
  const normalized = String(value || "").trim().toLowerCase();
  if (MOBILE_MENU_VALUES.has(normalized)) return normalized;
  const fallbackNormalized = String(fallback || MOBILE_MENU_DEFAULT).trim().toLowerCase();
  return MOBILE_MENU_VALUES.has(fallbackNormalized) ? fallbackNormalized : MOBILE_MENU_DEFAULT;
}

function resolvePanelMobileMenuAccess(panel) {
  const fallback = normalizeMobileMenuAccess(
    panel?.smartHomeNativeDefaults?.mobile_menu_access,
    MOBILE_MENU_DEFAULT,
  );
  const source = panel?._editorOpen && panel?._editConfig
    ? panel._editConfig
    : panel?._storedConfig;
  return normalizeMobileMenuAccess(
    readObjectPath(source, PANEL_NATIVE_MOBILE_MENU_PATH),
    fallback,
  );
}

function shouldShowMobileMenu({ isMobile, isAdmin, mode, hideHeader }) {
  if (!isMobile || hideHeader === false) return false;
  const normalized = normalizeMobileMenuAccess(mode);
  if (normalized === "hidden") return false;
  if (normalized === "all") return true;
  return isAdmin === true;
}

function emitPanelNativePreferences(panel) {
  if (!panel?.dispatchEvent) return;
  panel.dispatchEvent(
    new CustomEvent(NATIVE_PREFERENCES_EVENT, {
      detail: {
        hide_ha_header: resolvePanelHideHeader(panel),
        mobile_menu_access: resolvePanelMobileMenuAccess(panel),
      },
      bubbles: true,
      composed: true,
    }),
  );
}

function isIconSettingPath(path) {
  return /(^|\.)icon$/.test(String(path || ""));
}

function insertBeforeLastClosingDiv(html, addition) {
  const source = String(html || "");
  const index = source.lastIndexOf("</div>");
  if (index < 0) return `${source}${addition}`;
  return `${source.slice(0, index)}${addition}${source.slice(index)}`;
}

function normalizeMdiIcon(value) {
  const icon = String(value || "").trim();
  if (!icon) return "";
  return icon.includes(":") ? icon : `mdi:${icon.replace(/^mdi-/, "")}`;
}

function iconPickerButtonHtml(panel, path, value) {
  const escape = (input) => panel?._escape ? panel._escape(input) : String(input ?? "");
  const safePath = escape(path);
  const icon = normalizeMdiIcon(value) || "mdi:shape-outline";
  return `
    <button
      type="button"
      data-smart-native-icon-picker="${safePath}"
      title="Buscar y seleccionar icono MDI"
      aria-label="Buscar y seleccionar icono MDI"
      style="margin-top:8px;min-height:38px;display:flex;align-items:center;justify-content:center;gap:8px;width:100%;border:1px solid var(--divider-color,rgba(255,255,255,.12));border-radius:10px;background:var(--secondary-background-color,rgba(255,255,255,.04));color:var(--primary-text-color,#fff);font:inherit;cursor:pointer;padding:7px 10px;box-sizing:border-box;"
    >
      <ha-icon icon="${escape(icon)}" style="--mdc-icon-size:22px;color:var(--primary-color,#35ddd5)"></ha-icon>
      <span>Buscar icono</span>
    </button>`;
}

function closeIconPickerDialog(panel) {
  panel?.shadowRoot?.querySelector?.("[data-smart-native-icon-dialog]")?.remove();
}

function applyIconPickerValue(panel, path, rawValue) {
  if (!panel?._editConfig) return false;
  const value = normalizeMdiIcon(rawValue);
  if (!value) return false;

  if (typeof panel._setPath === "function") {
    panel._setPath(panel._editConfig, path, value);
  } else {
    const parts = String(path).split(".");
    let cursor = panel._editConfig;
    for (let i = 0; i < parts.length - 1; i += 1) {
      const part = parts[i];
      if (!cursor[part] || typeof cursor[part] !== "object") {
        cursor[part] = /^\d+$/.test(parts[i + 1]) ? [] : {};
      }
      cursor = cursor[part];
    }
    cursor[parts.at(-1)] = value;
  }

  panel._lastSignature = "";
  panel._queueRender?.();
  return true;
}

function buildIconPickerDialog(panel, path) {
  if (!panel?.shadowRoot || !panel?._editConfig) return;
  closeIconPickerDialog(panel);

  const current = readObjectPath(panel._editConfig, path) || "";
  const overlay = document.createElement("div");
  overlay.dataset.smartNativeIconDialog = "1";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.innerHTML = `
    <style>
      [data-smart-native-icon-dialog] {
        position: fixed;
        inset: 0;
        z-index: 2147483000;
        background: rgba(0,0,0,.58);
        display: grid;
        place-items: center;
        padding: max(16px, env(safe-area-inset-top)) 16px max(16px, env(safe-area-inset-bottom));
        box-sizing: border-box;
      }
      .smart-native-icon-dialog-card {
        width: min(620px, 100%);
        max-height: min(760px, calc(100vh - 32px));
        overflow: auto;
        background: var(--card-background-color, #172128);
        color: var(--primary-text-color, #fff);
        border: 1px solid var(--divider-color, rgba(255,255,255,.12));
        border-radius: 18px;
        box-shadow: 0 24px 70px rgba(0,0,0,.42);
        box-sizing: border-box;
      }
      .smart-native-icon-dialog-head {
        position: sticky;
        top: 0;
        z-index: 2;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 15px 16px;
        background: var(--card-background-color, #172128);
        border-bottom: 1px solid var(--divider-color, rgba(255,255,255,.12));
      }
      .smart-native-icon-dialog-title { font-size: 16px; font-weight: 700; }
      .smart-native-icon-dialog-close {
        width: 38px; height: 38px; border: 0; border-radius: 50%;
        background: var(--secondary-background-color, rgba(255,255,255,.06));
        color: inherit; cursor: pointer;
      }
      .smart-native-icon-dialog-body { padding: 16px; }
      .smart-native-icon-preview {
        display:flex; align-items:center; gap:10px; margin-bottom:14px;
        padding:10px 12px; border-radius:12px;
        background:var(--secondary-background-color,rgba(255,255,255,.04));
      }
      .smart-native-icon-preview code { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
      .smart-native-icon-native { min-height: 70px; }
      .smart-native-icon-note {
        margin:10px 0 0; color:var(--secondary-text-color,#9aa6af); font-size:12px; line-height:1.45;
      }
      .smart-native-icon-fallback {
        display:none; margin-top:14px; padding-top:14px;
        border-top:1px solid var(--divider-color,rgba(255,255,255,.12));
      }
      .smart-native-icon-fallback.visible { display:block; }
      .smart-native-icon-fallback-row { display:flex; gap:8px; align-items:end; }
      .smart-native-icon-fallback input {
        flex:1; min-width:0; box-sizing:border-box; padding:10px 11px; border-radius:10px;
        border:1px solid var(--divider-color,rgba(255,255,255,.16));
        background:var(--secondary-background-color,rgba(255,255,255,.04)); color:inherit;
      }
      .smart-native-icon-fallback button {
        min-height:40px; border:0; border-radius:10px; padding:0 14px; cursor:pointer;
        background:var(--primary-color,#35ddd5); color:var(--text-primary-color,#001414); font-weight:700;
      }
      @media (max-width: 600px) {
        [data-smart-native-icon-dialog] { padding:0; place-items:stretch; }
        .smart-native-icon-dialog-card { width:100%; height:100%; max-height:none; border-radius:0; border:0; }
        .smart-native-icon-dialog-body { padding-bottom:max(18px,env(safe-area-inset-bottom)); }
      }
    </style>
    <div class="smart-native-icon-dialog-card">
      <div class="smart-native-icon-dialog-head">
        <div class="smart-native-icon-dialog-title">Seleccionar icono</div>
        <button type="button" class="smart-native-icon-dialog-close" data-smart-native-icon-close aria-label="Cerrar">✕</button>
      </div>
      <div class="smart-native-icon-dialog-body">
        <div class="smart-native-icon-preview">
          <ha-icon data-smart-native-icon-preview-icon icon="${panel._escape?.(normalizeMdiIcon(current) || "mdi:shape-outline") || "mdi:shape-outline"}" style="--mdc-icon-size:30px;color:var(--primary-color,#35ddd5)"></ha-icon>
          <code data-smart-native-icon-preview-text>${panel._escape?.(current || "Sin icono") || current || "Sin icono"}</code>
        </div>
        <div class="smart-native-icon-native" data-smart-native-icon-native>
          <div style="color:var(--secondary-text-color,#9aa6af);font-size:13px">Cargando selector nativo de Home Assistant…</div>
        </div>
        <p class="smart-native-icon-note">
          Escribe una palabra para filtrar. Home Assistant muestra el catálogo MDI que incluye en su propio frontend; al elegir uno se guarda como <code>mdi:nombre</code>.
        </p>
        <div class="smart-native-icon-fallback" data-smart-native-icon-fallback>
          <div style="font-weight:650;margin-bottom:8px">Entrada manual de respaldo</div>
          <div class="smart-native-icon-fallback-row">
            <input data-smart-native-icon-manual value="${panel._escape?.(current) || current}" placeholder="mdi:home-outline">
            <button type="button" data-smart-native-icon-apply>Usar</button>
          </div>
          <p class="smart-native-icon-note">Este respaldo solo aparece si el componente nativo de selección no está disponible. El campo MDI normal del editor siempre permanece accesible.</p>
        </div>
      </div>
    </div>`;

  panel.shadowRoot.append(overlay);

  const close = () => closeIconPickerDialog(panel);
  overlay.querySelector("[data-smart-native-icon-close]")?.addEventListener("click", close);
  overlay.addEventListener("click", (ev) => {
    if (ev.target === overlay) close();
  });

  const manualInput = overlay.querySelector("[data-smart-native-icon-manual]");
  const manualApply = overlay.querySelector("[data-smart-native-icon-apply]");
  const fallback = overlay.querySelector("[data-smart-native-icon-fallback]");
  manualApply?.addEventListener("click", () => {
    if (applyIconPickerValue(panel, path, manualInput?.value)) close();
  });
  manualInput?.addEventListener("keydown", (ev) => {
    if (ev.key === "Enter" && applyIconPickerValue(panel, path, manualInput.value)) close();
  });

  const mountNativePicker = () => {
    const mount = overlay.querySelector("[data-smart-native-icon-native]");
    if (!mount) return false;

    // Preferred path: HA's generic selector dynamically imports the icon selector,
    // which in turn imports ha-icon-picker. This avoids bundling a stale MDI catalog.
    if (customElements.get("ha-selector")) {
      mount.textContent = "";
      const selector = document.createElement("ha-selector");
      selector.hass = panel._hass;
      selector.narrow = Boolean(panel._narrow);
      selector.selector = { icon: null };
      selector.value = normalizeMdiIcon(current);
      selector.label = "Buscar iconos MDI";
      selector.helper = "Busca por nombre o palabra clave y selecciona un icono.";
      selector.required = false;
      selector.addEventListener("value-changed", (ev) => {
        const value = ev?.detail?.value;
        if (applyIconPickerValue(panel, path, value)) close();
      });
      mount.append(selector);
      fallback?.classList.remove("visible");
      return true;
    }

    // Secondary native path for screens where ha-icon-picker was already loaded.
    if (customElements.get("ha-icon-picker")) {
      mount.textContent = "";
      const picker = document.createElement("ha-icon-picker");
      picker.value = normalizeMdiIcon(current);
      picker.label = "Buscar iconos MDI";
      picker.placeholder = "mdi:home-outline";
      picker.helper = "Busca por nombre o palabra clave y selecciona un icono.";
      picker.required = false;
      picker.addEventListener("value-changed", (ev) => {
        const value = ev?.detail?.value;
        if (applyIconPickerValue(panel, path, value)) close();
      });
      mount.append(picker);
      fallback?.classList.remove("visible");
      return true;
    }

    return false;
  };

  if (!mountNativePicker()) {
    // Both elements belong to Home Assistant and may be lazy-defined. ha-selector is
    // preferred because setting selector={icon:null} asks HA to load its icon picker.
    let settled = false;
    const retry = () => {
      if (!overlay.isConnected || settled) return;
      settled = mountNativePicker();
    };
    Promise.resolve(customElements.whenDefined?.("ha-selector")).then(retry).catch(() => {});
    Promise.resolve(customElements.whenDefined?.("ha-icon-picker")).then(retry).catch(() => {});
    window.setTimeout(() => {
      if (!overlay.isConnected || settled) return;
      fallback?.classList.add("visible");
      const mount = overlay.querySelector("[data-smart-native-icon-native]");
      if (mount) mount.innerHTML = `<div style="color:var(--secondary-text-color,#9aa6af);font-size:13px;line-height:1.45">El selector nativo no está disponible en esta pantalla. Puedes seguir escribiendo el icono manualmente sin afectar el panel.</div>`;
    }, 1800);
  }
}

function enhanceSmartHomePanelEditor() {
  const PanelClass = customElements.get("smart-home-panel");
  if (!PanelClass?.prototype) return false;
  const proto = PanelClass.prototype;
  if (proto[PANEL_ENHANCEMENT_MARKER]) return true;

  Object.defineProperty(proto, PANEL_ENHANCEMENT_MARKER, {
    value: true,
    configurable: false,
    enumerable: false,
  });

  // Add the persistent HA-shell preference to Personalización > General.
  if (typeof proto._editorGeneral === "function" && typeof proto._input === "function") {
    const originalEditorGeneral = proto._editorGeneral;
    proto._editorGeneral = function patchedEditorGeneral(cfg) {
      const original = originalEditorGeneral.call(this, cfg);
      try {
        const explicit = readObjectPath(cfg, PANEL_NATIVE_HIDE_HEADER_PATH);
        const value = typeof explicit === "boolean"
          ? explicit
          : (this.smartHomeNativeDefaults?.hide_ha_header !== false);
        const mobileMenu = resolvePanelMobileMenuAccess({
          _editorOpen: true,
          _editConfig: cfg,
          smartHomeNativeDefaults: this.smartHomeNativeDefaults,
        });
        const body = `
          ${this._input(
            PANEL_NATIVE_HIDE_HEADER_PATH,
            "Ocultar barra superior de Home Assistant",
            value,
            { type: "checkbox", full: true },
          )}
          ${this._input(
            PANEL_NATIVE_MOBILE_MENU_PATH,
            "Acceso al menú lateral en móvil",
            mobileMenu,
            {
              type: "select",
              full: true,
              options: [
                ["admins", "Solo administradores"],
                ["all", "Todos los usuarios"],
                ["hidden", "Oculto"],
              ],
            },
          )}
          <div style="grid-column:1/-1;color:var(--secondary-text-color,#9aa6af);font-size:12px;line-height:1.45;margin-top:-2px">
            El header se aplica únicamente a <code>/smart-home</code>. Cuando está oculto, el botón ☰ se muestra solo en diseño móvil/estrecho según la opción elegida. En escritorio no se añade ningún botón y la barra lateral de Home Assistant conserva su comportamiento normal. Para recuperación temporal usa <code>?show_ha_header=1</code>.
          </div>`;
        return `${original}${this._section("Interfaz de Home Assistant", body)}`;
      } catch (err) {
        console.warn("[Smart Home Native] No se pudo añadir el ajuste de header", err);
        return original;
      }
    };
  }

  // Keep every original MDI text field, but append an easy visual/search button.
  if (typeof proto._input === "function") {
    const originalInput = proto._input;
    proto._input = function patchedInput(path, label, value, opts = {}) {
      const original = originalInput.call(this, path, label, value, opts);
      try {
        const type = opts?.type || "text";
        if (type !== "text" || !isIconSettingPath(path)) return original;
        return insertBeforeLastClosingDiv(original, iconPickerButtonHtml(this, path, value));
      } catch (err) {
        console.warn("[Smart Home Native] No se pudo mejorar un campo de icono", path, err);
        return original;
      }
    };
  }

  if (typeof proto._onClick === "function") {
    const originalOnClick = proto._onClick;
    proto._onClick = async function patchedOnClick(ev) {
      try {
        const iconButton = ev?.target?.closest?.("[data-smart-native-icon-picker]");
        if (iconButton) {
          ev.preventDefault?.();
          ev.stopPropagation?.();
          buildIconPickerDialog(this, iconButton.dataset.smartNativeIconPicker);
          return;
        }
      } catch (err) {
        console.warn("[Smart Home Native] No se pudo abrir selector de iconos", err);
      }
      return originalOnClick.call(this, ev);
    };
  }

  // After every normal panel render, publish the effective preference to the bridge.
  // This covers live edit, Cancel, Save, Import JSON and Reset without changing the V2.0.5 backend.
  if (typeof proto._render === "function") {
    const originalRender = proto._render;
    proto._render = function patchedRender(...args) {
      const result = originalRender.apply(this, args);
      queueMicrotask(() => {
        try { emitPanelNativePreferences(this); } catch (_) { /* fail open */ }
      });
      return result;
    };
  }

  console.info("[Smart Home Native] Personalización ampliada: header + menú móvil por rol + selector MDI");
  return true;
}


function findHomeAssistantMain() {
  try {
    const homeAssistant = document.querySelector?.("home-assistant");
    return homeAssistant?.shadowRoot?.querySelector?.("home-assistant-main") || null;
  } catch (_) {
    return null;
  }
}

function openHomeAssistantMenu(owner) {
  const eventInit = { detail: { open: true }, bubbles: true, composed: true };
  try {
    const main = findHomeAssistantMain();
    if (main?.dispatchEvent) {
      main.dispatchEvent(new CustomEvent("hass-toggle-menu", eventInit));
      return true;
    }
  } catch (err) {
    console.warn("[Smart Home Native] No se pudo abrir el menú desde home-assistant-main", err);
  }

  // Fail-open fallback used by custom cards: let the event cross shadow boundaries.
  try {
    owner?.dispatchEvent?.(new CustomEvent("hass-toggle-menu", eventInit));
    return true;
  } catch (err) {
    console.warn("[Smart Home Native] No se pudo emitir hass-toggle-menu", err);
    return false;
  }
}

class SmartHomeHeaderController {
  constructor(owner) {
    this.owner = owner;
    this.enabled = true;
    this._root = null;
    this._retryTimers = [];
    this._onLocationChange = () => this.refresh();
  }

  start() {
    window.addEventListener("popstate", this._onLocationChange);
    window.addEventListener("location-changed", this._onLocationChange);
    this.refresh();
  }

  stop() {
    window.removeEventListener("popstate", this._onLocationChange);
    window.removeEventListener("location-changed", this._onLocationChange);
    this._clearRetries();
    this._restore();
  }

  setEnabled(enabled) {
    this.enabled = enabled !== false;
    this.refresh();
  }

  refresh() {
    this._clearRetries();

    if (
      !this.enabled ||
      !this.owner?.isConnected ||
      !isSmartHomeRoute() ||
      headerEscapeRequested()
    ) {
      this._restore();
      return;
    }

    if (this._apply()) return;

    // HA/Lovelace can finish composing shadow roots after the custom card connects.
    // Retry briefly; if it still cannot find hui-root, fail open with the header visible.
    for (const delay of [40, 120, 300, 700, 1400, 2600]) {
      const timer = window.setTimeout(() => {
        if (
          !this.enabled ||
          !this.owner?.isConnected ||
          !isSmartHomeRoute() ||
          headerEscapeRequested()
        ) {
          this._restore();
          return;
        }
        this._apply();
      }, delay);
      this._retryTimers.push(timer);
    }
  }

  _apply() {
    const root = findHuiRootShadowRoot(this.owner);
    if (!root) return false;

    if (this._root === root) return true;

    this._restore(false);
    if (!acquireHeaderStyle(root)) return false;

    this._root = root;
    this._notifyLayoutChange();
    return true;
  }

  _restore(notify = true) {
    if (!this._root) return;
    releaseHeaderStyle(this._root);
    this._root = null;
    if (notify) this._notifyLayoutChange();
  }

  _notifyLayoutChange() {
    // Lovelace cards that calculate height on resize get one normal layout refresh.
    window.requestAnimationFrame?.(() => {
      window.dispatchEvent(new Event("resize"));
    });
  }

  _clearRetries() {
    for (const timer of this._retryTimers) window.clearTimeout(timer);
    this._retryTimers = [];
  }
}

class SmartHomeDashboardCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    this._hass = null;
    this._config = {};
    this._panelElement = null;
    this._loading = false;
    this._error = null;

    this._media = window.matchMedia("(max-width: 870px)");
    this._hideHaHeader = true;
    this._mobileMenuAccess = MOBILE_MENU_DEFAULT;
    this._onMediaChange = () => {
      this._syncPanel();
      this._syncMobileMenuButton();
    };
    this._onPanelNativePreferences = (ev) => {
      const hideHeader = ev?.detail?.hide_ha_header;
      const mobileMenuAccess = ev?.detail?.mobile_menu_access;
      if (typeof hideHeader === "boolean") {
        this._hideHaHeader = hideHeader;
        this._headerController.setEnabled(hideHeader);
      }
      if (mobileMenuAccess !== undefined) {
        this._mobileMenuAccess = normalizeMobileMenuAccess(mobileMenuAccess);
      }
      this._syncMobileMenuButton();
    };
    this._onMobileMenuClick = (ev) => {
      ev?.preventDefault?.();
      ev?.stopPropagation?.();
      openHomeAssistantMenu(this);
    };
    this._headerController = new SmartHomeHeaderController(this);
  }

  setConfig(config) {
    this._config = config || {};
    this._hideHaHeader = this._config.hide_ha_header !== false;
    this._mobileMenuAccess = normalizeMobileMenuAccess(
      this._config.mobile_menu_access,
      MOBILE_MENU_DEFAULT,
    );
    this._headerController.setEnabled(this._hideHaHeader);
    this._renderState();
    this._syncMobileMenuButton();
    void this._ensurePanel();
  }

  set hass(hass) {
    this._hass = hass;
    this._syncPanel();
    this._syncMobileMenuButton();
    if (!this._panelElement) void this._ensurePanel();
  }

  get hass() {
    return this._hass;
  }

  connectedCallback() {
    if (this._media?.addEventListener) {
      this._media.addEventListener("change", this._onMediaChange);
    } else if (this._media?.addListener) {
      this._media.addListener(this._onMediaChange);
    }

    this._headerController.start();
    this._panelElement?.addEventListener?.(
      NATIVE_PREFERENCES_EVENT,
      this._onPanelNativePreferences,
    );
    this._renderState();
    this._syncMobileMenuButton();
    void this._ensurePanel();
  }

  disconnectedCallback() {
    if (this._media?.removeEventListener) {
      this._media.removeEventListener("change", this._onMediaChange);
    } else if (this._media?.removeListener) {
      this._media.removeListener(this._onMediaChange);
    }

    this._headerController.stop();
    this._panelElement?.removeEventListener?.(
      NATIVE_PREFERENCES_EVENT,
      this._onPanelNativePreferences,
    );
  }

  getCardSize() {
    return 12;
  }

  async _ensurePanel() {
    if (!this.isConnected || this._loading || this._panelElement) return;

    this._loading = true;
    this._error = null;
    this._renderState();

    try {
      const moduleUrl = this._config.panel_module_url || DEFAULT_PANEL_MODULE_URL;
      await ensureSmartHomePanel(moduleUrl);
      if (!this.isConnected || this._panelElement) return;

      const panel = document.createElement("smart-home-panel");
      panel.smartHomeNativeDefaults = {
        hide_ha_header: this._config.hide_ha_header !== false,
        mobile_menu_access: normalizeMobileMenuAccess(
          this._config.mobile_menu_access,
          MOBILE_MENU_DEFAULT,
        ),
      };
      panel.addEventListener(NATIVE_PREFERENCES_EVENT, this._onPanelNativePreferences);

      // The original custom panel waits for a truthy `panel` property before rendering.
      // V2 stores its real personalization in the smart_home_panel backend/.storage,
      // so this object only supplies the host contract the element expects.
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
      console.error("[Smart Home Native] No se pudo montar Smart Home Panel", err);
      this._renderState();
    } finally {
      this._loading = false;
      if (!this._panelElement) this._renderState();
    }
  }

  _mountPanel() {
    if (!this._panelElement || !this.shadowRoot) return;

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
          min-height: 100%;
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        #mount {
          display: block;
          width: 100%;
          min-height: 100%;
          margin: 0;
          padding: 0;
        }
        smart-home-panel {
          display: block;
          width: 100%;
          min-height: 100%;
        }
        #ha-mobile-menu {
          display: none;
          position: fixed;
          top: max(10px, env(safe-area-inset-top));
          left: max(10px, env(safe-area-inset-left));
          z-index: 2147482000;
          width: 42px;
          height: 42px;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,.13);
          background: rgba(16,24,30,.86);
          -webkit-backdrop-filter: blur(10px);
          backdrop-filter: blur(10px);
          box-shadow: 0 6px 20px rgba(0,0,0,.26);
          color: #35ddd5;
          cursor: pointer;
          padding: 0;
          -webkit-tap-highlight-color: transparent;
        }
        #ha-mobile-menu.visible { display: flex; }
        #ha-mobile-menu:focus-visible {
          outline: 2px solid #35ddd5;
          outline-offset: 2px;
        }
        #ha-mobile-menu ha-icon { --mdc-icon-size: 25px; }
        @media (min-width: 871px) {
          #ha-mobile-menu { display: none !important; }
        }
      </style>
      <button id="ha-mobile-menu" type="button" aria-label="Abrir menú de Home Assistant" title="Menú de Home Assistant">
        <ha-icon icon="mdi:menu"></ha-icon>
      </button>
      <div id="mount"></div>
    `;

    this.shadowRoot.getElementById("ha-mobile-menu")?.addEventListener(
      "click",
      this._onMobileMenuClick,
    );
    this.shadowRoot.getElementById("mount")?.append(this._panelElement);
    this._syncMobileMenuButton();
  }

  _syncPanel() {
    const panel = this._panelElement;
    if (!panel) return;

    if (this._hass) panel.hass = this._hass;
    panel.narrow = Boolean(this._media?.matches);
  }

  _syncMobileMenuButton() {
    const button = this.shadowRoot?.getElementById?.("ha-mobile-menu");
    if (!button) return;

    const visible = shouldShowMobileMenu({
      isMobile: Boolean(this._media?.matches) && isSmartHomeRoute(),
      isAdmin: this._hass?.user?.is_admin === true,
      mode: this._mobileMenuAccess,
      hideHeader: this._hideHaHeader && !headerEscapeRequested(),
    });
    button.classList?.toggle?.("visible", visible);
    button.setAttribute?.("aria-hidden", visible ? "false" : "true");
    button.tabIndex = visible ? 0 : -1;
  }

  _renderState() {
    if (!this.shadowRoot || this._panelElement) return;

    const message = this._error
      ? `No se pudo cargar Smart Home Panel: ${this._error.message}`
      : "Cargando Smart Home…";

    this.shadowRoot.innerHTML = `
      <style>
        :host { display:block; width:100%; min-height:220px; box-sizing:border-box; }
        .state {
          min-height:220px;
          display:grid;
          place-items:center;
          padding:24px;
          box-sizing:border-box;
          text-align:center;
          color:var(--secondary-text-color, #9aa6af);
          background:var(--lovelace-background, transparent);
          font:500 14px/1.45 system-ui, sans-serif;
        }
        .error { color:var(--error-color, #db4437); }
      </style>
      <div class="state ${this._error ? "error" : ""}">${message}</div>
    `;
  }
}

if (!customElements.get("smart-home-dashboard-card")) {
  customElements.define("smart-home-dashboard-card", SmartHomeDashboardCard);
}

class SmartHomeDashboardStrategy extends HTMLElement {
  static noEditor = true;

  static getCreateSuggestions(_hass) {
    return {
      title: "Smart Home",
      icon: "mdi:home-lightning-bolt",
    };
  }

  static async generate(config, _hass) {
    const panelModuleUrl = config?.panel_module_url || DEFAULT_PANEL_MODULE_URL;
    const hideHaHeader = config?.hide_ha_header !== false;
    const mobileMenuAccess = normalizeMobileMenuAccess(
      config?.mobile_menu_access,
      MOBILE_MENU_DEFAULT,
    );

    return {
      title: config?.title || "Smart Home",
      views: [
        {
          title: "Inicio",
          path: "inicio",
          type: "panel",
          cards: [
            {
              type: "custom:smart-home-dashboard-card",
              panel_module_url: panelModuleUrl,
              hide_ha_header: hideHaHeader,
              mobile_menu_access: mobileMenuAccess,
            },
          ],
        },
      ],
    };
  }
}

if (!customElements.get("ll-strategy-dashboard-smart-home")) {
  customElements.define(
    "ll-strategy-dashboard-smart-home",
    SmartHomeDashboardStrategy,
  );
}

window.customStrategies = window.customStrategies || [];
if (
  !window.customStrategies.some(
    (item) => item?.type === "smart-home" && item?.strategyType === "dashboard",
  )
) {
  window.customStrategies.push({
    type: "smart-home",
    strategyType: "dashboard",
    name: "Smart Home",
    description:
      "Dashboard nativo que conserva Smart Home Panel y amplía Personalización con header, menú móvil por rol y selector MDI.",
  });
}

console.info(
  `[Smart Home Native] Bridge v${SMART_HOME_NATIVE_BRIDGE_VERSION} cargado`,
);
