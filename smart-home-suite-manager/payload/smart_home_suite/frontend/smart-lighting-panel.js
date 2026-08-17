/**
 * Smart Lighting Panel V1.0.3
 * Mobile-first lighting/switch control panel for Home Assistant.
 *
 * Defaults:
 * - Two unassigned device slots.
 * - Tap toggles the entity.
 * - Hold (550 ms) opens Home Assistant native more-info.
 * - Areas and devices are created/edited from the built-in admin editor.
 * - switch.* entities can be visually represented as lights.
 */

const PANEL_VERSION = "1.0.3";
const DOMAIN = "smart_lighting_panel";
const HOLD_MS = 550;
const MOVE_TOLERANCE = 12;

const deepClone = (obj) => JSON.parse(JSON.stringify(obj));

function deepMerge(base, custom) {
  if (Array.isArray(base)) return Array.isArray(custom) ? deepClone(custom) : deepClone(base);
  if (base && typeof base === "object") {
    const out = { ...base };
    if (custom && typeof custom === "object" && !Array.isArray(custom)) {
      for (const [key, value] of Object.entries(custom)) out[key] = deepMerge(base[key], value);
    }
    return out;
  }
  return custom !== undefined ? custom : base;
}

function newId(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function defaultDevice(name = "Nueva luz") {
  return {
    id: newId("device"),
    show: true,
    entity: "",
    name,
    appearance: "light",
    icon_on: "mdi:lightbulb-on",
    icon_off: "mdi:lightbulb-outline",
    color_on: "#ffd66b",
    color_off: "#7e8b96",
    background_on: "rgba(255,214,107,.12)",
    background_off: "rgba(255,255,255,.025)",
    border_on: "rgba(255,214,107,.34)",
    border_off: "#26323a",
    show_state: true,
    tap_action: "toggle",
    hold_action: "more-info",
  };
}

const DEFAULTS = {
  locale: "es-MX",
  header: {
    show: true,
    title: "Iluminación",
    subtitle: "Luces y apagadores",
    icon: "mdi:lightbulb-group",
    icon_color: "#ffd66b",
    title_color: "#f5f7fa",
    subtitle_color: "#89949f",
    title_size: 27,
    subtitle_size: 14,
    icon_size: 31,
    align: "left",
  },
  design: {
    background: "#080d11",
    background_secondary: "#11181e",
    panel_max_width: 760,
    panel_padding: 12,
    area_gap: 20,
    card_gap: 10,
    columns_mobile: 2,
    columns_tablet: 3,
    columns_desktop: 4,
    card_min_height: 142,
    card_radius: 20,
    card_padding: 15,
    card_shadow: "0 10px 30px rgba(0,0,0,.18)",
    card_background: "#11181e",
    card_border: "#26323a",
    text_color: "#f5f7fa",
    muted_color: "#8e9aa4",
    accent_color: "#ffd66b",
    area_title_color: "#eef2f5",
    unavailable_color: "#ef6461",
    font_family: "Roboto, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  navigation: {
    show: false,
    position: "bottom",
    columns: 4,
    gap: 8,
    button_height: 58,
    radius: 16,
    background: "#11181e",
    border_color: "#26323a",
    text_color: "#aeb7be",
    active_color: "#ffd66b",
    icon_size: 24,
    font_size: 11,
    show_labels: true,
    buttons: [
      { show: true, label: "Inicio", icon: "mdi:home", path: "/smart-home", color: "#35ddd5" },
      { show: true, label: "Luces", icon: "mdi:lightbulb-group", path: "/lighting", color: "#ffd66b" },
      { show: false, label: "Energía", icon: "mdi:flash", path: "/smart-energy-advanced", color: "#35ddd5" },
    ],
  },
  areas: [
    {
      id: "area-main",
      show: true,
      name: "Área principal",
      icon: "mdi:home-outline",
      icon_color: "#ffd66b",
      devices: [
        { ...defaultDevice("Luz 1"), id: "device-1" },
        { ...defaultDevice("Luz 2"), id: "device-2" },
      ],
    },
  ],
};

class SmartLightingPanel extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._hass = null;
    this._panel = null;
    this._narrow = false;
    this._storedConfig = {};
    this._loaded = false;
    this._loading = false;
    this._backendOk = true;
    this._editorOpen = false;
    this._editorTab = "areas";
    this._editConfig = null;
    this._renderQueued = false;
    this._lastSignature = "";
    this._toastMessage = "";
    this._toastType = "ok";
    this._gesture = null;
    this._entityPicker = null;
    this._iconPicker = null;

    this.shadowRoot.addEventListener("click", (ev) => this._onClick(ev));
    this.shadowRoot.addEventListener("change", (ev) => this._onChange(ev));
    this.shadowRoot.addEventListener("input", (ev) => this._onInput(ev));
    this.shadowRoot.addEventListener("pointerdown", (ev) => this._onPointerDown(ev));
    this.shadowRoot.addEventListener("pointermove", (ev) => this._onPointerMove(ev));
    this.shadowRoot.addEventListener("pointerup", (ev) => this._onPointerUp(ev));
    this.shadowRoot.addEventListener("pointercancel", (ev) => this._onPointerCancel(ev));
    this.shadowRoot.addEventListener("contextmenu", (ev) => {
      if (ev.target.closest?.(".device-tile")) ev.preventDefault();
    });
  }

  set hass(value) {
    this._hass = value;
    if (!this._loaded && !this._loading) this._loadConfig();
    // Preserve editor scroll/focus during frequent HA state updates.
    if (!this._editorOpen && !this._entityPicker && !this._iconPicker) this._queueRender();
  }
  get hass() { return this._hass; }

  set panel(value) { this._panel = value; this._queueRender(); }
  get panel() { return this._panel; }

  set narrow(value) { this._narrow = Boolean(value); this._queueRender(); }
  get narrow() { return this._narrow; }

  connectedCallback() {
    if (this._hass && !this._loaded && !this._loading) this._loadConfig();
    this._queueRender();
  }

  async _loadConfig() {
    if (!this._hass || this._loading || this._loaded) return;
    this._loading = true;
    try {
      const result = await this._hass.callWS({ type: `${DOMAIN}/config/get` });
      this._storedConfig = result?.config || {};
      this._backendOk = true;
    } catch (err) {
      console.error("Smart Lighting Panel: persistent backend unavailable", err);
      this._storedConfig = {};
      this._backendOk = false;
    } finally {
      this._loaded = true;
      this._loading = false;
      try {
        const params = new URLSearchParams(window.location.search);
        if (this._hass?.user?.is_admin && (params.get("settings") === "1" || params.get("configure") === "1")) {
          this._editConfig = deepClone(this._config());
          this._editorOpen = true;
          this._editorTab = "areas";
        }
      } catch (_) {}
      this._lastSignature = "";
      this._queueRender();
    }
  }

  _config() {
    const source = this._editorOpen && this._editConfig ? this._editConfig : this._storedConfig;
    const cfg = deepMerge(DEFAULTS, source || {});
    if (!Array.isArray(cfg.areas) || !cfg.areas.length) cfg.areas = deepClone(DEFAULTS.areas);
    return cfg;
  }

  _queueRender(preserve = false) {
    if (!this.isConnected || this._renderQueued) return;
    this._renderQueued = true;
    requestAnimationFrame(() => {
      this._renderQueued = false;
      this._render(preserve);
    });
  }

  _escape(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  _num(value, fallback = 0) {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  }

  _cssSize(value, fallback = "") {
    if (value === "" || value === null || value === undefined) return fallback;
    return typeof value === "number" ? `${value}px` : String(value);
  }

  _getPath(obj, path) {
    return path.split(".").reduce((acc, key) => acc?.[key], obj);
  }

  _setPath(obj, path, value) {
    const parts = path.split(".");
    let cursor = obj;
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      const next = parts[i + 1];
      if (cursor[part] === undefined || cursor[part] === null) cursor[part] = /^\d+$/.test(next) ? [] : {};
      cursor = cursor[part];
    }
    cursor[parts.at(-1)] = value;
  }

  _icon(icon, size, color) {
    if (!icon) return "";
    return `<ha-icon icon="${this._escape(icon)}" style="--mdc-icon-size:${this._cssSize(size, "26px")};color:${this._escape(color || "currentColor")}"></ha-icon>`;
  }

  _entityState(device) {
    const entity = device?.entity || "";
    const stateObj = entity ? this._hass?.states?.[entity] : null;
    if (!entity) return { kind: "unconfigured", on: false, stateObj: null, label: "Sin configurar" };
    if (!stateObj) return { kind: "missing", on: false, stateObj: null, label: "No encontrada" };
    const raw = String(stateObj.state || "").toLowerCase();
    if (["unavailable", "unknown", "none"].includes(raw)) return { kind: "unavailable", on: false, stateObj, label: "No disponible" };
    const on = raw === "on" || raw === "open" || raw === "active" || raw === "true";
    return { kind: on ? "on" : "off", on, stateObj, label: on ? "Encendida" : "Apagada" };
  }

  _deviceAppearance(device, state) {
    const appearance = device.appearance || "light";
    let iconOn = device.icon_on || "mdi:lightbulb-on";
    let iconOff = device.icon_off || "mdi:lightbulb-outline";
    if (appearance === "switch") {
      iconOn = device.icon_on || "mdi:toggle-switch";
      iconOff = device.icon_off || "mdi:toggle-switch-off-outline";
    } else if (appearance === "auto") {
      const domain = String(device.entity || "").split(".")[0];
      if (domain === "switch") {
        iconOn = device.icon_on || "mdi:toggle-switch";
        iconOff = device.icon_off || "mdi:toggle-switch-off-outline";
      }
    }
    return {
      icon: state.on ? iconOn : iconOff,
      color: state.on ? (device.color_on || "#ffd66b") : (device.color_off || "#7e8b96"),
      background: state.on ? (device.background_on || "rgba(255,214,107,.12)") : (device.background_off || "rgba(255,255,255,.025)"),
      border: state.on ? (device.border_on || "rgba(255,214,107,.34)") : (device.border_off || "#26323a"),
    };
  }

  _deviceCard(device, areaIndex, deviceIndex, cfg) {
    if (!device?.show) return "";
    const state = this._entityState(device);
    const ap = this._deviceAppearance(device, state);
    const unavailable = state.kind === "unavailable" || state.kind === "missing";
    const statusColor = unavailable ? cfg.design.unavailable_color : ap.color;
    const disabledClass = state.kind === "unconfigured" ? " unconfigured" : "";
    const title = device.name || state.stateObj?.attributes?.friendly_name || device.entity || "Dispositivo";
    return `
      <button class="device-tile state-${state.kind}${disabledClass}" data-device-tile="1" data-area-index="${areaIndex}" data-device-index="${deviceIndex}"
        style="--tile-bg:${this._escape(ap.background)};--tile-border:${this._escape(ap.border)};--device-color:${this._escape(statusColor)}"
        aria-label="${this._escape(`${title}: ${state.label}`)}">
        <span class="device-icon-wrap">${this._icon(ap.icon, 38, statusColor)}</span>
        <span class="device-text">
          <span class="device-name">${this._escape(title)}</span>
          ${device.show_state !== false ? `<span class="device-state"><span class="state-dot"></span>${this._escape(state.label)}</span>` : ""}
          ${state.kind === "missing" ? `<span class="entity-hint">${this._escape(device.entity)}</span>` : ""}
        </span>
      </button>`;
  }

  _area(area, areaIndex, cfg) {
    if (!area?.show) return "";
    const devices = (area.devices || []).map((d, i) => this._deviceCard(d, areaIndex, i, cfg)).join("");
    if (!devices) return "";
    return `
      <section class="area-section">
        <div class="area-heading">
          <div class="area-heading-main">${this._icon(area.icon || "mdi:home-outline", 24, area.icon_color || cfg.design.accent_color)}<span>${this._escape(area.name || "Área")}</span></div>
          <span class="area-count">${(area.devices || []).filter((d) => d.show).length}</span>
        </div>
        <div class="device-grid">${devices}</div>
      </section>`;
  }

  _navigation(cfg) {
    const nav = cfg.navigation;
    if (!nav?.show) return "";
    const buttons = (nav.buttons || []).filter((b) => b.show);
    if (!buttons.length) return "";
    const current = window.location.pathname;
    return `<nav class="nav-grid" style="--nav-cols:${Math.max(1, this._num(nav.columns, 4))};--nav-gap:${this._cssSize(nav.gap, "8px")};--nav-h:${this._cssSize(nav.button_height, "58px")};--nav-radius:${this._cssSize(nav.radius, "16px")};--nav-bg:${this._escape(nav.background)};--nav-border:${this._escape(nav.border_color)};--nav-text:${this._escape(nav.text_color)};--nav-active:${this._escape(nav.active_color)};--nav-font:${this._cssSize(nav.font_size, "11px")}">
      ${buttons.map((b) => {
        const active = current === b.path || (b.path !== "/" && current.startsWith(`${b.path}/`));
        return `<button class="nav-button ${active ? "active" : ""}" data-nav-path="${this._escape(b.path || "/")}">${this._icon(b.icon, nav.icon_size, b.color || (active ? nav.active_color : nav.text_color))}${nav.show_labels ? `<span>${this._escape(b.label || "")}</span>` : ""}</button>`;
      }).join("")}
    </nav>`;
  }

  _header(cfg) {
    const h = cfg.header;
    if (!h?.show && !this._hass?.user?.is_admin) return "";
    if (!h?.show) {
      return `<div class="settings-only"><button class="settings-button" data-action="open-editor" title="Personalización">${this._icon("mdi:cog", 25, cfg.design.muted_color)}</button></div>`;
    }
    return `<header class="panel-header align-${this._escape(h.align || "left")}">
      <div class="header-main">
        <div class="header-icon">${this._icon(h.icon, h.icon_size, h.icon_color)}</div>
        <div class="header-copy"><div class="header-title" style="color:${this._escape(h.title_color)};font-size:${this._cssSize(h.title_size)}">${this._escape(h.title)}</div><div class="header-subtitle" style="color:${this._escape(h.subtitle_color)};font-size:${this._cssSize(h.subtitle_size)}">${this._escape(h.subtitle)}</div></div>
      </div>
      ${this._hass?.user?.is_admin ? `<button class="settings-button" data-action="open-editor" title="Personalización">${this._icon("mdi:cog", 25, cfg.design.muted_color)}</button>` : ""}
    </header>`;
  }

  _signature(cfg) {
    const states = [];
    for (const area of cfg.areas || []) for (const device of area.devices || []) {
      if (device.entity) states.push(`${device.entity}:${this._hass?.states?.[device.entity]?.state || "missing"}`);
    }
    return JSON.stringify([cfg, states]);
  }

  _captureEditorState() {
    if (!this._editorOpen) return null;
    const overlay = this.shadowRoot.querySelector(".editor-overlay");
    const body = this.shadowRoot.querySelector(".editor-body");
    const active = this.shadowRoot.activeElement;
    return {
      overlayTop: overlay?.scrollTop || 0,
      bodyTop: body?.scrollTop || 0,
      key: active?.dataset?.setting || active?.dataset?.entitySearch || active?.id || null,
      start: typeof active?.selectionStart === "number" ? active.selectionStart : null,
      end: typeof active?.selectionEnd === "number" ? active.selectionEnd : null,
    };
  }

  _restoreEditorState(snapshot) {
    if (!snapshot) return;
    requestAnimationFrame(() => {
      const overlay = this.shadowRoot.querySelector(".editor-overlay");
      const body = this.shadowRoot.querySelector(".editor-body");
      if (overlay) overlay.scrollTop = snapshot.overlayTop;
      if (body) body.scrollTop = snapshot.bodyTop;
      if (snapshot.key) {
        let el = this.shadowRoot.querySelector(`[data-setting="${CSS.escape(snapshot.key)}"]`);
        if (!el) el = this.shadowRoot.querySelector(`[data-entity-search="${CSS.escape(snapshot.key)}"]`);
        if (!el) el = this.shadowRoot.getElementById(snapshot.key);
        if (el) {
          el.focus({ preventScroll: true });
          if (snapshot.start !== null && typeof el.setSelectionRange === "function") {
            try { el.setSelectionRange(snapshot.start, snapshot.end); } catch (_) {}
          }
        }
      }
    });
  }

  _render(preserve = false) {
    if (!this.shadowRoot) return;
    if (!this._hass || !this._panel || !this._loaded) {
      this.shadowRoot.innerHTML = `<style>:host{display:block;min-height:100vh;background:#080d11;color:#fff;font-family:system-ui,sans-serif}.loading{padding:32px;text-align:center;opacity:.7}</style><div class="loading">Cargando iluminación…</div>`;
      return;
    }
    const snapshot = preserve ? this._captureEditorState() : null;
    const cfg = this._config();
    const sig = this._signature(cfg);
    if (sig === this._lastSignature && !this._editorOpen && !this._entityPicker && !this._iconPicker) return;
    this._lastSignature = sig;
    const navTop = cfg.navigation?.show && cfg.navigation.position === "top";
    const navBottom = cfg.navigation?.show && cfg.navigation.position === "bottom";
    this.shadowRoot.innerHTML = `
      <style>${this._styles(cfg)}</style>
      <main class="page">
        ${this._header(cfg)}
        ${!this._backendOk ? `<div class="warning-badge">Backend no disponible · revisa smart_lighting_panel</div>` : ""}
        ${navTop ? this._navigation(cfg) : ""}
        <div class="areas">${(cfg.areas || []).map((a, i) => this._area(a, i, cfg)).join("")}</div>
        ${navBottom ? this._navigation(cfg) : ""}
        <div class="version">v${PANEL_VERSION}</div>
      </main>
      ${this._editorOpen ? this._editor(cfg) : ""}
      ${this._entityPicker ? this._entityPickerHtml() : ""}
      ${this._iconPicker ? this._iconPickerHtml() : ""}
      ${this._toastMessage ? `<div class="toast ${this._toastType}">${this._escape(this._toastMessage)}</div>` : ""}
    `;
    if (snapshot) this._restoreEditorState(snapshot);
    if (this._iconPicker) this._mountNativeIconPicker();
  }

  _styles(cfg) {
    const d = cfg.design;
    const mobile = Math.max(1, Math.round(this._num(d.columns_mobile, 2)));
    const tablet = Math.max(1, Math.round(this._num(d.columns_tablet, 3)));
    const desktop = Math.max(1, Math.round(this._num(d.columns_desktop, 4)));
    return `
      :host{display:block;min-height:100vh;min-height:100dvh;background:radial-gradient(circle at 50% -20%,${d.background_secondary} 0%,transparent 42%),${d.background};color:${d.text_color};font-family:${d.font_family};-webkit-font-smoothing:antialiased}
      *{box-sizing:border-box}button,input,select,textarea{font:inherit}button{-webkit-tap-highlight-color:transparent}
      .page{width:100%;min-height:100vh;min-height:100dvh;max-width:${this._cssSize(d.panel_max_width,"760px")};margin:0 auto;padding:max(${this._cssSize(d.panel_padding,"12px")},env(safe-area-inset-top)) max(${this._cssSize(d.panel_padding,"12px")},env(safe-area-inset-right)) max(${this._cssSize(d.panel_padding,"12px")},env(safe-area-inset-bottom)) max(${this._cssSize(d.panel_padding,"12px")},env(safe-area-inset-left))}
      .panel-header{min-height:76px;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:3px 3px 13px;position:relative}.header-main{display:flex;align-items:center;gap:12px;min-width:0;max-width:calc(100% - 56px)}.header-copy{min-width:0}.header-title{font-weight:700;line-height:1.08;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.header-subtitle{margin-top:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.header-icon{width:48px;height:48px;border-radius:16px;display:grid;place-items:center;background:rgba(255,214,107,.08);flex:none}.align-center{justify-content:center}.align-center .header-main{position:absolute;left:50%;transform:translateX(-50%);text-align:center;max-width:calc(100% - 112px)}.align-center .settings-button{position:absolute;right:0}.align-right .header-main{margin-left:auto;text-align:right}.align-right .settings-button{order:-1}.settings-only{display:flex;justify-content:flex-end;padding:4px 0 10px}
      .settings-button{width:44px;height:44px;border-radius:14px;border:1px solid ${d.card_border};background:${d.card_background};display:grid;place-items:center;cursor:pointer;flex:none;color:${d.muted_color}}
      .warning-badge{margin:0 2px 12px;padding:9px 11px;border:1px solid rgba(239,100,97,.35);background:rgba(239,100,97,.09);color:#ef8a88;border-radius:13px;font-size:12px}
      .areas{display:flex;flex-direction:column;gap:${this._cssSize(d.area_gap,"20px")}}.area-section{min-width:0}.area-heading{display:flex;align-items:center;justify-content:space-between;padding:0 4px 9px}.area-heading-main{display:flex;align-items:center;gap:8px;color:${d.area_title_color};font-size:16px;font-weight:650}.area-count{min-width:24px;height:24px;padding:0 7px;border-radius:999px;background:rgba(255,255,255,.055);display:grid;place-items:center;color:${d.muted_color};font-size:11px}
      .device-grid{display:grid;grid-template-columns:repeat(${mobile},minmax(0,1fr));gap:${this._cssSize(d.card_gap,"10px")}}
      @media (min-width:560px){.device-grid{grid-template-columns:repeat(${tablet},minmax(0,1fr))}}
      @media (min-width:820px){.device-grid{grid-template-columns:repeat(${desktop},minmax(0,1fr))}}
      .device-tile{position:relative;min-width:0;min-height:${this._cssSize(d.card_min_height,"142px")};border:${1}px solid var(--tile-border);border-radius:${this._cssSize(d.card_radius,"20px")};padding:${this._cssSize(d.card_padding,"15px")};background:var(--tile-bg);box-shadow:${d.card_shadow};color:${d.text_color};display:flex;flex-direction:column;align-items:flex-start;justify-content:space-between;text-align:left;cursor:pointer;touch-action:pan-y;user-select:none;transition:transform .12s ease,background .18s ease,border-color .18s ease,box-shadow .18s ease;overflow:hidden}.device-tile:active{transform:scale(.985)}.device-tile.holding{transform:scale(.975);box-shadow:0 0 0 2px color-mix(in srgb,var(--device-color) 34%,transparent),${d.card_shadow}}.device-tile.state-on:before{content:"";position:absolute;inset:-45% 18% 35% -15%;background:radial-gradient(circle,var(--device-color) 0%,transparent 68%);opacity:.09;pointer-events:none}.device-icon-wrap{width:54px;height:54px;border-radius:17px;background:color-mix(in srgb,var(--device-color) 13%,transparent);display:grid;place-items:center;position:relative;z-index:1}.device-text{display:flex;flex-direction:column;gap:5px;min-width:0;width:100%;position:relative;z-index:1}.device-name{font-size:15px;font-weight:650;line-height:1.15;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.device-state{display:flex;align-items:center;gap:6px;color:${d.muted_color};font-size:12px}.state-dot{width:7px;height:7px;border-radius:50%;background:var(--device-color);box-shadow:0 0 10px color-mix(in srgb,var(--device-color) 55%,transparent)}.state-on .device-state{color:var(--device-color)}.state-unavailable .state-dot,.state-missing .state-dot{background:${d.unavailable_color}}.unconfigured{cursor:default;opacity:.72}.entity-hint{font-size:10px;color:${d.unavailable_color};white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .nav-grid{display:grid;grid-template-columns:repeat(var(--nav-cols),minmax(0,1fr));gap:var(--nav-gap);margin:13px 0}.nav-button{height:var(--nav-h);border-radius:var(--nav-radius);border:1px solid var(--nav-border);background:var(--nav-bg);color:var(--nav-text);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;font-size:var(--nav-font);cursor:pointer}.nav-button.active{border-color:color-mix(in srgb,var(--nav-active) 45%,var(--nav-border));color:var(--nav-active)}
      .version{text-align:center;color:${d.muted_color};opacity:.52;font-size:10px;padding:18px 0 3px}
      .editor-overlay{position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.72);display:flex;align-items:stretch;justify-content:flex-end;overflow:hidden;padding:0}.editor{width:min(620px,100%);height:100%;max-height:100vh;max-height:100dvh;min-height:0;background:#0b1116;color:#f5f7fa;border:0;border-left:1px solid #26323a;border-radius:0;display:flex;flex-direction:column;overflow:hidden;box-shadow:-20px 0 60px rgba(0,0,0,.35);animation:lightingDrawerIn .18s ease-out}.editor-header{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:max(14px,env(safe-area-inset-top)) 14px 10px;border-bottom:1px solid #202b32;background:#0b1116;flex:0 0 auto}.editor-title{font-size:20px;font-weight:700}.editor-subtitle{font-size:11px;color:#71808a;margin-top:3px;line-height:1.4}.editor-actions,.row-actions{display:flex;gap:8px;flex-wrap:wrap}.editor-btn,.tiny-btn,.icon-btn{border:1px solid #2b3942;background:#111a20;color:#e8edf1;border-radius:12px;padding:9px 12px;cursor:pointer}.editor-btn.primary{border-color:#247f7a;background:#123b3a;color:#55e6df;font-weight:700}.editor-btn:hover,.tiny-btn:hover,.icon-btn:hover{background:#172229}.editor-btn.primary:hover{background:#164846}.tiny-btn{padding:7px 9px;font-size:11px}.tiny-btn.danger{border-color:#703332;color:#ef8a87}.icon-btn{width:38px;height:38px;padding:0;display:grid;place-items:center}.editor-tabs{display:flex;gap:5px;overflow-x:auto;overflow-y:hidden;padding:10px 12px;border-bottom:1px solid #202b32;background:#0d151a;flex:0 0 auto;scrollbar-width:thin}.editor-tab{height:36px;white-space:nowrap;padding:0 12px;border:0;border-radius:11px;background:transparent;color:#8e9ba5;cursor:pointer}.editor-tab.active{background:#122126;color:#42ddd5;font-weight:700}.editor-body{flex:1 1 0;min-height:0;height:0;overflow-y:auto;overflow-x:hidden;padding:14px;display:block;overscroll-behavior:contain;touch-action:pan-y;-webkit-overflow-scrolling:touch;scrollbar-gutter:stable}.section{border:1px solid #26323a;border-radius:16px;background:#0f171c;margin-bottom:12px;overflow:hidden}.section:last-child{margin-bottom:0}.section-title{font-size:14px;font-weight:700;padding:13px 14px;border-bottom:1px solid #202b32}.section-content{padding:13px;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:11px}.field{display:flex;flex-direction:column;gap:6px;min-width:0}.field.full{grid-column:1/-1}.field label{font-size:11px;color:#8d9aa4;font-weight:650}.field input,.field select,.field textarea{width:100%;border:1px solid #2a3740;background:#0a1014;color:#ecf1f4;border-radius:11px;padding:9px 10px;outline:none}.field textarea{min-height:220px;resize:vertical;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11px}.field input:focus,.field select:focus,.field textarea:focus{border-color:#2aaea7;box-shadow:0 0 0 2px rgba(53,221,213,.08)}.checkbox-row{display:flex;align-items:center;gap:9px;min-height:39px}.checkbox-row input{width:18px;height:18px;accent-color:#35ddd5}.color-row{display:grid;grid-template-columns:46px 1fr;gap:6px}.color-row input[type=color]{height:39px;padding:3px}.help{grid-column:1/-1;color:#71808a;font-size:11px;line-height:1.45}.editor-footer{padding:11px max(14px,env(safe-area-inset-right)) max(11px,env(safe-area-inset-bottom)) 14px;border-top:1px solid #202b32;display:flex;align-items:center;justify-content:space-between;gap:10px;color:#71808a;font-size:10px;flex-wrap:wrap;background:#0b1116;flex:0 0 auto}.picker-overlay{position:fixed;inset:0;z-index:12000;background:rgba(0,0,0,.72);display:flex;align-items:flex-start;justify-content:center;overflow:auto;padding:max(12px,env(safe-area-inset-top)) 10px max(12px,env(safe-area-inset-bottom))}@keyframes lightingDrawerIn{from{transform:translateX(28px);opacity:.75}to{transform:translateX(0);opacity:1}}@media(prefers-reduced-motion:reduce){.editor{animation:none}}
      .area-editor{grid-column:1/-1;border:1px solid #2b3942;border-radius:15px;overflow:hidden;background:#0d151a}.area-editor-head{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:10px;border-bottom:1px solid #26323a}.area-editor-name{font-size:13px;font-weight:700}.device-editor{margin:10px;border:1px solid #26323a;border-radius:14px;background:#10181e;overflow:hidden}.device-editor-head{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:9px 10px;border-bottom:1px solid #26323a}.device-editor-title{font-size:12px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.device-editor-grid{padding:10px;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.entity-pick-row,.icon-pick-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:6px}.entity-pick-btn,.icon-pick-btn{min-height:39px;border:1px solid #33414b;background:#152029;color:#dce3e8;border-radius:11px;padding:0 11px;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:6px;white-space:nowrap}.entity-pick-btn:hover,.icon-pick-btn:hover{background:#1a2933;border-color:#3e505c}.add-button{grid-column:1/-1;border:1px dashed #43535e;background:rgba(255,214,107,.035);color:#dce3e8;border-radius:13px;padding:11px;cursor:pointer}.minimum-note{grid-column:1/-1;font-size:10px;color:#83909a}
      .picker{width:min(560px,100%);max-height:min(80vh,700px);display:flex;flex-direction:column;background:#0d141a;border:1px solid #26323a;border-radius:20px;overflow:hidden;color:#eef2f5;box-shadow:0 30px 90px rgba(0,0,0,.52)}.picker-head{padding:12px;border-bottom:1px solid #26323a;display:flex;align-items:center;justify-content:space-between;gap:8px}.picker-title{font-weight:700}.picker-search{padding:10px;border-bottom:1px solid #26323a}.picker-search input{width:100%;border:1px solid #33414b;background:#0b1217;color:#eef2f5;border-radius:12px;padding:10px}.picker-filter{padding:0 10px 9px;color:#8e9aa4;font-size:11px;display:flex;align-items:center;gap:7px}.picker-list{overflow:auto;padding:7px}.picker-item{width:100%;border:0;background:transparent;color:#eef2f5;border-radius:12px;padding:9px;display:grid;grid-template-columns:38px minmax(0,1fr) auto;align-items:center;gap:9px;text-align:left;cursor:pointer}.picker-item:hover{background:#151f26}.picker-item-icon{width:38px;height:38px;border-radius:11px;background:#151f26;display:grid;place-items:center}.picker-item-name{font-size:12px;font-weight:650;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.picker-item-id{font-size:10px;color:#83909a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.picker-item-state{font-size:10px;color:#9ca8b0}.picker-empty{padding:24px;text-align:center;color:#83909a;font-size:12px}.icon-native-body{padding:14px;overflow:visible}.icon-native-host{min-height:72px}.icon-native-host ha-selector,.icon-native-host ha-icon-picker{display:block;width:100%}.icon-native-help{margin-top:10px;color:#83909a;font-size:11px;line-height:1.45}.icon-native-fallback{padding:12px;border:1px dashed #43535e;border-radius:12px;color:#aeb8bf;font-size:12px;line-height:1.45;background:#10181e}
      .toast{position:fixed;left:50%;bottom:max(18px,env(safe-area-inset-bottom));transform:translateX(-50%);z-index:1400;max-width:calc(100vw - 24px);padding:10px 13px;border-radius:13px;background:#172229;border:1px solid #33414b;color:#eef2f5;font-size:12px;box-shadow:0 12px 45px rgba(0,0,0,.4)}.toast.error{border-color:rgba(239,100,97,.48);color:#efaaa8}
      @media(max-width:620px){.section-content,.device-editor-grid{grid-template-columns:1fr}.editor{width:100vw;height:100dvh;max-height:100dvh;border-left:0;box-shadow:none}.editor-header{padding:max(11px,env(safe-area-inset-top)) max(11px,env(safe-area-inset-right)) 10px max(11px,env(safe-area-inset-left));align-items:flex-start}.editor-title{font-size:16px}.editor-actions{justify-content:flex-end}.editor-btn{padding:8px 9px;font-size:12px}.editor-tabs{padding-left:max(10px,env(safe-area-inset-left));padding-right:max(10px,env(safe-area-inset-right))}.editor-body{padding-left:max(10px,env(safe-area-inset-left));padding-right:max(10px,env(safe-area-inset-right))}.editor-footer{padding-left:max(11px,env(safe-area-inset-left));padding-right:max(11px,env(safe-area-inset-right))}.field.full{grid-column:1}.header-title{font-size:min(7vw,27px)!important}.page{padding-left:max(9px,env(safe-area-inset-left));padding-right:max(9px,env(safe-area-inset-right))}}
    `;
  }

  _input(path, label, value, opts = {}) {
    const type = opts.type || "text";
    const full = opts.full ? " full" : "";
    if (type === "checkbox") {
      return `<div class="field${full}"><label>${this._escape(label)}</label><div class="checkbox-row"><input type="checkbox" data-setting="${this._escape(path)}" data-value-type="boolean" ${value ? "checked" : ""}><span>${value ? "Activado" : "Desactivado"}</span></div></div>`;
    }
    if (type === "select") {
      const options = (opts.options || []).map(([v, l]) => `<option value="${this._escape(v)}" ${String(value) === String(v) ? "selected" : ""}>${this._escape(l)}</option>`).join("");
      return `<div class="field${full}"><label>${this._escape(label)}</label><select data-setting="${this._escape(path)}">${options}</select></div>`;
    }
    if (type === "color") {
      const safe = /^#[0-9a-f]{6}$/i.test(String(value || "")) ? value : "#ffffff";
      return `<div class="field${full}"><label>${this._escape(label)}</label><div class="color-row"><input type="color" value="${this._escape(safe)}" data-setting="${this._escape(path)}"><input type="text" value="${this._escape(value || "")}" data-setting="${this._escape(path)}"></div></div>`;
    }
    const min = opts.min !== undefined ? ` min="${opts.min}"` : "";
    const max = opts.max !== undefined ? ` max="${opts.max}"` : "";
    const step = opts.step !== undefined ? ` step="${opts.step}"` : "";
    const valueType = type === "number" ? ` data-value-type="number"` : "";
    return `<div class="field${full}"><label>${this._escape(label)}</label><input type="${this._escape(type)}" value="${this._escape(value ?? "")}" data-setting="${this._escape(path)}"${valueType}${min}${max}${step}></div>`;
  }

  _entityInput(path, label, value, areaIndex, deviceIndex) {
    return `<div class="field full"><label>${this._escape(label)}</label><div class="entity-pick-row"><input type="text" value="${this._escape(value || "")}" data-setting="${this._escape(path)}" placeholder="light.sala o switch.lampara"><button class="entity-pick-btn" data-action="pick-entity" data-area-index="${areaIndex}" data-device-index="${deviceIndex}">Seleccionar</button></div></div>`;
  }

  _iconInput(path, label, value, opts = {}) {
    const full = opts.full ? " full" : "";
    return `<div class="field${full}"><label>${this._escape(label)}</label><div class="icon-pick-row"><input type="text" value="${this._escape(value || "")}" data-setting="${this._escape(path)}" placeholder="mdi:lightbulb"><button class="icon-pick-btn" data-action="pick-icon" data-setting-path="${this._escape(path)}" data-picker-label="${this._escape(label)}" title="Abrir selector nativo de iconos MDI">${this._icon("mdi:magnify", 17, "#aeb7be")}<span>Buscar icono</span></button></div></div>`;
  }

  _editor(cfg) {
    const tabs = [["areas", "Áreas y dispositivos"], ["general", "General"], ["navigation", "Navegación"], ["advanced", "Avanzado"]];
    return `<div class="editor-overlay"><section class="editor">
      <div class="editor-header"><div><div class="editor-title">Personalización · Iluminación</div><div class="editor-subtitle">Los cambios no se guardan hasta pulsar Guardar</div></div><div class="editor-actions"><button class="editor-btn" data-action="close-editor">Cancelar</button><button class="editor-btn primary" data-action="save-config">Guardar</button></div></div>
      <div class="editor-tabs">${tabs.map(([id, label]) => `<button class="editor-tab ${this._editorTab === id ? "active" : ""}" data-action="tab" data-tab="${id}">${label}</button>`).join("")}</div>
      <div class="editor-body">
        ${this._editorTab === "areas" ? this._editorAreas(cfg) : ""}
        ${this._editorTab === "general" ? this._editorGeneral(cfg) : ""}
        ${this._editorTab === "navigation" ? this._editorNavigation(cfg) : ""}
        ${this._editorTab === "advanced" ? this._editorAdvanced(cfg) : ""}
      </div>
      <div class="editor-footer"><span>Persistencia en .storage mediante smart_lighting_panel.</span><div class="row-actions"><button class="tiny-btn" data-action="export-config">Exportar</button><button class="tiny-btn" data-action="import-config">Importar</button><button class="tiny-btn danger" data-action="reset-config">Restablecer</button><input id="import-file" type="file" accept="application/json,.json" hidden></div></div>
    </section></div>`;
  }

  _editorAreas(cfg) {
    const areas = (cfg.areas || []).map((area, ai) => {
      const devices = (area.devices || []).map((dev, di) => {
        const p = `areas.${ai}.devices.${di}`;
        return `<div class="device-editor">
          <div class="device-editor-head"><div class="device-editor-title">${this._escape(dev.name || `Dispositivo ${di + 1}`)}</div><div class="row-actions"><button class="tiny-btn danger" data-action="remove-device" data-area-index="${ai}" data-device-index="${di}">Eliminar</button></div></div>
          <div class="device-editor-grid">
            ${this._input(`${p}.show`, "Mostrar", dev.show, { type: "checkbox" })}
            ${this._input(`${p}.name`, "Nombre visible", dev.name)}
            ${this._entityInput(`${p}.entity`, "Entidad", dev.entity, ai, di)}
            ${this._input(`${p}.appearance`, "Representación", dev.appearance, { type: "select", options: [["light", "Como luz"], ["switch", "Como apagador"], ["auto", "Automático por dominio"], ["custom", "Personalizada"]] })}
            ${this._input(`${p}.show_state`, "Mostrar estado", dev.show_state !== false, { type: "checkbox" })}
            ${this._input(`${p}.tap_action`, "Un toque", dev.tap_action || "toggle", { type: "select", options: [["toggle", "Alternar entidad"], ["more-info", "Más información"], ["none", "No hacer nada"]] })}
            ${this._input(`${p}.hold_action`, "Mantener presionado", dev.hold_action || "more-info", { type: "select", options: [["more-info", "Más información"], ["toggle", "Alternar entidad"], ["none", "No hacer nada"]] })}
            ${this._iconInput(`${p}.icon_on`, "Icono encendido", dev.icon_on)}
            ${this._iconInput(`${p}.icon_off`, "Icono apagado", dev.icon_off)}
            ${this._input(`${p}.color_on`, "Color encendido", dev.color_on, { type: "color" })}
            ${this._input(`${p}.color_off`, "Color apagado", dev.color_off, { type: "color" })}
            ${this._input(`${p}.background_on`, "Fondo encendido", dev.background_on, { full: true })}
            ${this._input(`${p}.background_off`, "Fondo apagado", dev.background_off, { full: true })}
            ${this._input(`${p}.border_on`, "Borde encendido", dev.border_on, { full: true })}
            ${this._input(`${p}.border_off`, "Borde apagado", dev.border_off, { full: true })}
          </div>
        </div>`;
      }).join("");
      return `<div class="area-editor">
        <div class="area-editor-head"><div class="area-editor-name">${this._escape(area.name || `Área ${ai + 1}`)}</div><div class="row-actions"><button class="tiny-btn danger" data-action="remove-area" data-area-index="${ai}">Eliminar área</button></div></div>
        <div class="device-editor-grid">
          ${this._input(`areas.${ai}.show`, "Mostrar área", area.show, { type: "checkbox" })}
          ${this._input(`areas.${ai}.name`, "Nombre del área", area.name)}
          ${this._iconInput(`areas.${ai}.icon`, "Icono del área", area.icon)}
          ${this._input(`areas.${ai}.icon_color`, "Color del icono", area.icon_color, { type: "color" })}
          <div class="help">Dentro de esta área puedes mezclar entidades <b>light.*</b> y <b>switch.*</b>. La representación “Como luz” hace que un apagador se vea como foco, sin alterar la entidad real.</div>
        </div>
        ${devices}
        <div style="padding:0 10px 10px"><button class="add-button" data-action="add-device" data-area-index="${ai}">+ Agregar luz/apagador</button></div>
      </div>`;
    }).join("");
    return this._section("Áreas", `${areas}<button class="add-button" data-action="add-area">+ Agregar área</button><div class="minimum-note">La configuración inicial trae dos espacios. Para evitar borrar accidentalmente todos los controles, el editor conserva un mínimo de dos dispositivos en total.</div>`);
  }

  _editorGeneral(cfg) {
    const h = cfg.header, d = cfg.design;
    return [
      this._section("Encabezado", `${this._input("header.show", "Mostrar encabezado", h.show, { type: "checkbox" })}${this._input("header.title", "Título", h.title)}${this._input("header.subtitle", "Subtítulo", h.subtitle)}${this._iconInput("header.icon", "Icono MDI", h.icon)}${this._input("header.icon_color", "Color icono", h.icon_color, { type: "color" })}${this._input("header.title_color", "Color título", h.title_color, { type: "color" })}${this._input("header.subtitle_color", "Color subtítulo", h.subtitle_color, { type: "color" })}${this._input("header.align", "Alineación", h.align, { type: "select", options: [["left", "Izquierda"], ["center", "Centro"], ["right", "Derecha"]] })}`),
      this._section("Diseño", `${this._input("design.background", "Fondo principal", d.background, { type: "color" })}${this._input("design.background_secondary", "Fondo secundario", d.background_secondary, { type: "color" })}${this._input("design.card_background", "Fondo tarjeta", d.card_background, { type: "color" })}${this._input("design.card_border", "Borde tarjeta", d.card_border, { type: "color" })}${this._input("design.text_color", "Texto", d.text_color, { type: "color" })}${this._input("design.muted_color", "Texto secundario", d.muted_color, { type: "color" })}${this._input("design.accent_color", "Acento", d.accent_color, { type: "color" })}${this._input("design.unavailable_color", "No disponible", d.unavailable_color, { type: "color" })}${this._input("design.panel_max_width", "Ancho máximo px", d.panel_max_width, { type: "number", min: 320, max: 1600 })}${this._input("design.card_min_height", "Altura mínima tarjeta", d.card_min_height, { type: "number", min: 90, max: 260 })}${this._input("design.card_radius", "Radio tarjeta", d.card_radius, { type: "number", min: 0, max: 60 })}${this._input("design.card_gap", "Separación tarjetas", d.card_gap, { type: "number", min: 0, max: 40 })}${this._input("design.columns_mobile", "Columnas móvil", d.columns_mobile, { type: "number", min: 1, max: 4 })}${this._input("design.columns_tablet", "Columnas tablet", d.columns_tablet, { type: "number", min: 1, max: 6 })}${this._input("design.columns_desktop", "Columnas escritorio", d.columns_desktop, { type: "number", min: 1, max: 8 })}${this._input("design.font_family", "Fuente", d.font_family, { full: true })}`),
    ].join("");
  }

  _editorNavigation(cfg) {
    const n = cfg.navigation;
    const buttons = (n.buttons || []).map((b, i) => `<div class="device-editor"><div class="device-editor-head"><div class="device-editor-title">${this._escape(b.label || `Botón ${i + 1}`)}</div><button class="tiny-btn danger" data-action="remove-nav" data-index="${i}">Eliminar</button></div><div class="device-editor-grid">${this._input(`navigation.buttons.${i}.show`, "Mostrar", b.show, { type: "checkbox" })}${this._input(`navigation.buttons.${i}.label`, "Texto", b.label)}${this._iconInput(`navigation.buttons.${i}.icon`, "Icono", b.icon)}${this._input(`navigation.buttons.${i}.path`, "Ruta", b.path)}${this._input(`navigation.buttons.${i}.color`, "Color", b.color, { type: "color" })}</div></div>`).join("");
    return this._section("Navegación", `${this._input("navigation.show", "Mostrar navegación", n.show, { type: "checkbox" })}${this._input("navigation.position", "Posición", n.position, { type: "select", options: [["top", "Arriba"], ["bottom", "Abajo"]] })}${this._input("navigation.columns", "Columnas", n.columns, { type: "number", min: 1, max: 8 })}${this._input("navigation.show_labels", "Mostrar etiquetas", n.show_labels, { type: "checkbox" })}<div class="help">Puedes enlazar /smart-home, /smart-energy-advanced, otros paneles o vistas nativas.</div>${buttons}<button class="add-button" data-action="add-nav">+ Agregar botón</button>`);
  }

  _editorAdvanced(cfg) {
    return this._section("JSON avanzado", `<div class="field full"><label>Configuración completa</label><textarea id="advanced-json">${this._escape(JSON.stringify(cfg, null, 2))}</textarea></div><div class="help">Aplicar JSON modifica la copia de trabajo. Después debes pulsar Guardar.</div><div class="row-actions" style="grid-column:1/-1"><button class="editor-btn" data-action="apply-json">Aplicar JSON</button></div>`);
  }

  _section(title, body) {
    return `<section class="section"><div class="section-title">${this._escape(title)}</div><div class="section-content">${body}</div></section>`;
  }

  _entityPickerHtml() {
    const picker = this._entityPicker;
    if (!picker) return "";
    const query = String(picker.query || "").trim().toLowerCase();
    const onlyLighting = picker.onlyLighting !== false;
    const entries = Object.entries(this._hass?.states || {})
      .filter(([id]) => !onlyLighting || id.startsWith("light.") || id.startsWith("switch."))
      .map(([id, obj]) => ({ id, obj, name: obj.attributes?.friendly_name || id }))
      .filter((x) => !query || x.id.toLowerCase().includes(query) || x.name.toLowerCase().includes(query))
      .sort((a, b) => a.name.localeCompare(b.name, "es"))
      .slice(0, 150);
    return `<div class="picker-overlay"><section class="picker"><div class="picker-head"><div><div class="picker-title">Seleccionar entidad</div><div class="editor-subtitle">Luces y apagadores primero</div></div><button class="icon-btn" data-action="close-picker">${this._icon("mdi:close", 22, "#aeb7be")}</button></div><div class="picker-search"><input type="search" placeholder="Buscar por nombre o entity_id" value="${this._escape(picker.query || "")}" data-entity-search="picker-query"></div><label class="picker-filter"><input type="checkbox" data-action="picker-filter" ${onlyLighting ? "checked" : ""}> Solo light.* y switch.*</label><div class="picker-list">${entries.length ? entries.map((x) => {
      const domain = x.id.split(".")[0];
      const icon = x.obj.attributes?.icon || (domain === "light" ? "mdi:lightbulb" : domain === "switch" ? "mdi:toggle-switch" : "mdi:circle-outline");
      return `<button class="picker-item" data-action="choose-entity" data-entity="${this._escape(x.id)}"><span class="picker-item-icon">${this._icon(icon, 22, "#ffd66b")}</span><span><span class="picker-item-name">${this._escape(x.name)}</span><span class="picker-item-id">${this._escape(x.id)}</span></span><span class="picker-item-state">${this._escape(x.obj.state)}</span></button>`;
    }).join("") : `<div class="picker-empty">No hay coincidencias.</div>`}</div></section></div>`;
  }

  _iconPickerHtml() {
    const picker = this._iconPicker;
    if (!picker) return "";
    return `<div class="picker-overlay"><section class="picker"><div class="picker-head"><div><div class="picker-title">Seleccionar icono MDI</div><div class="editor-subtitle">${this._escape(picker.label || "Icono")} · selector nativo de Home Assistant</div></div><button class="icon-btn" data-action="close-icon-picker" title="Cerrar">${this._icon("mdi:close", 22, "#aeb7be")}</button></div><div class="icon-native-body"><div id="native-icon-picker-host" class="icon-native-host"></div><div class="icon-native-help">Busca por nombre y selecciona un icono. El campo manual <code>mdi:...</code> permanece disponible como respaldo.</div></div></section></div>`;
  }

  _mountNativeIconPicker() {
    const pickerState = this._iconPicker;
    const host = this.shadowRoot?.getElementById("native-icon-picker-host");
    if (!pickerState || !host || host.dataset.mounted === "1") return;
    host.dataset.mounted = "1";

    const mount = (tag) => {
      if (!this._iconPicker || !host.isConnected) return false;
      const el = document.createElement(tag);
      if (tag === "ha-selector") {
        el.hass = this._hass;
        el.selector = { icon: {} };
        el.narrow = this._narrow;
        el.required = false;
      }
      el.value = pickerState.value || "";
      el.label = "Icono MDI";
      el.addEventListener("value-changed", (ev) => {
        const value = ev?.detail?.value ?? "";
        if (!this._editConfig || !this._iconPicker) return;
        this._setPath(this._editConfig, this._iconPicker.path, value);
        this._iconPicker = null;
        this._lastSignature = "";
        this._queueRender(true);
      });
      host.replaceChildren(el);
      try { el.focus?.(); } catch (_) {}
      return true;
    };

    if (customElements.get("ha-selector") && mount("ha-selector")) return;
    if (customElements.get("ha-icon-picker") && mount("ha-icon-picker")) return;

    Promise.race([
      customElements.whenDefined("ha-selector").then(() => "ha-selector"),
      customElements.whenDefined("ha-icon-picker").then(() => "ha-icon-picker"),
      new Promise((resolve) => setTimeout(() => resolve("fallback"), 1200)),
    ]).then((tag) => {
      if (!this._iconPicker || !host.isConnected) return;
      if (tag !== "fallback" && mount(tag)) return;
      host.innerHTML = `<div class="icon-native-fallback">El selector nativo no está disponible en este frontend. Puedes cerrar esta ventana y escribir el valor manualmente, por ejemplo <b>mdi:lightbulb</b>. Esta protección evita que una incompatibilidad futura rompa el editor.</div>`;
    });
  }

  _totalDevices() {
    return (this._editConfig?.areas || []).reduce((sum, area) => sum + (area.devices || []).length, 0);
  }

  _toast(message, type = "ok") {
    this._toastMessage = message;
    this._toastType = type;
    this._lastSignature = "";
    this._queueRender(true);
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => {
      this._toastMessage = "";
      this._lastSignature = "";
      this._queueRender(true);
    }, 2400);
  }

  _onInput(ev) {
    if (ev.target.matches?.("[data-entity-search]")) {
      if (!this._entityPicker) return;
      this._entityPicker.query = ev.target.value;
      this._lastSignature = "";
      this._queueRender(true);
    }
  }

  _onChange(ev) {
    if (ev.target.matches?.('[data-action="picker-filter"]')) {
      if (!this._entityPicker) return;
      this._entityPicker.onlyLighting = Boolean(ev.target.checked);
      this._lastSignature = "";
      this._queueRender(true);
      return;
    }
    const el = ev.target.closest?.("[data-setting]");
    if (!el || !this._editConfig) return;
    let value;
    const type = el.dataset.valueType;
    if (type === "boolean") value = Boolean(el.checked);
    else if (type === "number") value = Number(el.value);
    else value = el.value;
    this._setPath(this._editConfig, el.dataset.setting, value);
    if (el.type === "color") {
      const sibling = el.parentElement?.querySelector?.('input[type="text"][data-setting]');
      if (sibling) sibling.value = el.value;
    }
    if (/^navigation\.buttons\.\d+\.show$/.test(el.dataset.setting) && value === true) this._editConfig.navigation.show = true;
    this._lastSignature = "";
    this._queueRender(true);
  }

  async _onClick(ev) {
    const nav = ev.target.closest?.("[data-nav-path]");
    if (nav) { this._navigate(nav.dataset.navPath); return; }
    const target = ev.target.closest?.("[data-action]");
    if (!target) return;
    const action = target.dataset.action;

    if (action === "open-editor") {
      this._editConfig = deepClone(this._config());
      this._editorOpen = true;
      this._editorTab = "areas";
      this._lastSignature = "";
      this._queueRender();
      return;
    }
    if (action === "close-editor") {
      this._editorOpen = false;
      this._editConfig = null;
      this._entityPicker = null;
      this._iconPicker = null;
      this._lastSignature = "";
      this._queueRender();
      return;
    }
    if (action === "tab") {
      this._editorTab = target.dataset.tab;
      this._lastSignature = "";
      this._queueRender(true);
      return;
    }
    if (action === "save-config") { await this._saveConfig(); return; }
    if (action === "reset-config") {
      if (!confirm("¿Restablecer toda la configuración de Iluminación?")) return;
      try {
        await this._hass.callWS({ type: `${DOMAIN}/config/reset` });
        this._storedConfig = {};
        this._editConfig = deepClone(DEFAULTS);
        this._toast("Configuración restablecida");
      } catch (err) { this._toast(`No se pudo restablecer: ${err?.message || err}`, "error"); }
      return;
    }
    if (action === "add-area") {
      const arr = this._editConfig.areas ||= [];
      arr.push({ id: newId("area"), show: true, name: `Nueva área`, icon: "mdi:home-outline", icon_color: this._editConfig.design.accent_color, devices: [] });
      this._lastSignature = ""; this._queueRender(true); return;
    }
    if (action === "remove-area") {
      const ai = Number(target.dataset.areaIndex);
      const area = this._editConfig.areas?.[ai];
      const count = area?.devices?.length || 0;
      if (this._totalDevices() - count < 2) { this._toast("Deben quedar al menos dos dispositivos en total", "error"); return; }
      this._editConfig.areas.splice(ai, 1);
      this._lastSignature = ""; this._queueRender(true); return;
    }
    if (action === "add-device") {
      const ai = Number(target.dataset.areaIndex);
      const area = this._editConfig.areas?.[ai];
      if (!area) return;
      area.devices ||= [];
      area.devices.push(defaultDevice(`Luz ${this._totalDevices() + 1}`));
      this._lastSignature = ""; this._queueRender(true); return;
    }
    if (action === "remove-device") {
      if (this._totalDevices() <= 2) { this._toast("El panel conserva un mínimo de dos dispositivos", "error"); return; }
      const ai = Number(target.dataset.areaIndex), di = Number(target.dataset.deviceIndex);
      this._editConfig.areas?.[ai]?.devices?.splice(di, 1);
      this._lastSignature = ""; this._queueRender(true); return;
    }
    if (action === "pick-entity") {
      this._entityPicker = { areaIndex: Number(target.dataset.areaIndex), deviceIndex: Number(target.dataset.deviceIndex), query: "", onlyLighting: true };
      this._lastSignature = ""; this._queueRender(true); return;
    }
    if (action === "close-picker") { this._entityPicker = null; this._lastSignature = ""; this._queueRender(true); return; }
    if (action === "pick-icon") {
      const path = target.dataset.settingPath || "";
      if (!path || !this._editConfig) return;
      this._iconPicker = { path, label: target.dataset.pickerLabel || "Icono", value: this._getPath(this._editConfig, path) || "" };
      this._lastSignature = ""; this._queueRender(true); return;
    }
    if (action === "close-icon-picker") { this._iconPicker = null; this._lastSignature = ""; this._queueRender(true); return; }
    if (action === "choose-entity") {
      const picker = this._entityPicker;
      if (!picker) return;
      const dev = this._editConfig.areas?.[picker.areaIndex]?.devices?.[picker.deviceIndex];
      if (!dev) return;
      dev.entity = target.dataset.entity || "";
      if (!dev.name || /^Luz \d+$/.test(dev.name) || dev.name === "Nueva luz") {
        dev.name = this._hass?.states?.[dev.entity]?.attributes?.friendly_name || dev.name;
      }
      this._entityPicker = null;
      this._lastSignature = ""; this._queueRender(true); return;
    }
    if (action === "add-nav") {
      this._editConfig.navigation.show = true;
      (this._editConfig.navigation.buttons ||= []).push({ show: true, label: "Nuevo", icon: "mdi:circle-outline", path: "/", color: this._editConfig.design.accent_color });
      this._lastSignature = ""; this._queueRender(true); return;
    }
    if (action === "remove-nav") {
      this._editConfig.navigation.buttons.splice(Number(target.dataset.index), 1);
      this._lastSignature = ""; this._queueRender(true); return;
    }
    if (action === "apply-json") {
      const area = this.shadowRoot.getElementById("advanced-json");
      try {
        const parsed = JSON.parse(area.value);
        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("La raíz debe ser un objeto JSON");
        this._editConfig = parsed;
        this._toast("JSON aplicado; pulsa Guardar para persistirlo");
      } catch (err) { this._toast(`JSON inválido: ${err.message}`, "error"); }
      return;
    }
    if (action === "export-config") {
      const blob = new Blob([JSON.stringify(this._editConfig || this._config(), null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = "smart-lighting-panel-config.json"; a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000); return;
    }
    if (action === "import-config") {
      const input = this.shadowRoot.getElementById("import-file");
      input.onchange = async () => {
        try {
          const file = input.files?.[0]; if (!file) return;
          const parsed = JSON.parse(await file.text());
          if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("La raíz debe ser un objeto");
          this._editConfig = parsed;
          this._toast("Configuración importada; pulsa Guardar");
        } catch (err) { this._toast(`No se pudo importar: ${err.message}`, "error"); }
        finally { input.value = ""; }
      };
      input.click();
    }
  }

  async _saveConfig() {
    if (!this._editConfig) return;
    try {
      await this._hass.callWS({ type: `${DOMAIN}/config/save`, config: this._editConfig });
      this._storedConfig = deepClone(this._editConfig);
      this._editorOpen = false;
      this._editConfig = null;
      this._entityPicker = null;
      this._iconPicker = null;
      this._backendOk = true;
      this._toast("Configuración guardada");
      this._lastSignature = "";
      this._queueRender();
    } catch (err) {
      this._toast(`No se pudo guardar: ${err?.message || err}`, "error");
    }
  }

  _navigate(path) {
    if (!path) return;
    try {
      if (/^https?:\/\//i.test(path)) { window.open(path, "_blank", "noopener"); return; }
      history.pushState(null, "", path);
      window.dispatchEvent(new CustomEvent("location-changed"));
    } catch (_) { window.location.href = path; }
  }

  _onPointerDown(ev) {
    if (this._editorOpen || this._entityPicker || ev.button > 0) return;
    const tile = ev.target.closest?.("[data-device-tile]");
    if (!tile) return;
    const ai = Number(tile.dataset.areaIndex), di = Number(tile.dataset.deviceIndex);
    const cfg = this._config();
    const device = cfg.areas?.[ai]?.devices?.[di];
    if (!device?.entity) return;
    this._clearGesture();
    const gesture = {
      pointerId: ev.pointerId,
      tile,
      areaIndex: ai,
      deviceIndex: di,
      startX: ev.clientX,
      startY: ev.clientY,
      moved: false,
      held: false,
      timer: null,
    };
    gesture.timer = setTimeout(() => {
      if (!gesture.moved && this._gesture === gesture) {
        gesture.held = true;
        gesture.tile.classList.add("holding");
        try { navigator.vibrate?.(18); } catch (_) {}
      }
    }, HOLD_MS);
    this._gesture = gesture;
  }

  _onPointerMove(ev) {
    const g = this._gesture;
    if (!g || g.pointerId !== ev.pointerId) return;
    const dx = ev.clientX - g.startX, dy = ev.clientY - g.startY;
    if (Math.hypot(dx, dy) > MOVE_TOLERANCE) {
      g.moved = true;
      clearTimeout(g.timer);
      g.tile.classList.remove("holding");
    }
  }

  _onPointerUp(ev) {
    const g = this._gesture;
    if (!g || g.pointerId !== ev.pointerId) return;
    clearTimeout(g.timer);
    g.tile.classList.remove("holding");
    const cfg = this._config();
    const device = cfg.areas?.[g.areaIndex]?.devices?.[g.deviceIndex];
    const moved = g.moved;
    const held = g.held;
    this._gesture = null;
    if (moved || !device?.entity) return;
    if (held) this._executeDeviceAction(device, device.hold_action || "more-info");
    else this._executeDeviceAction(device, device.tap_action || "toggle");
  }

  _onPointerCancel(ev) {
    if (!this._gesture || this._gesture.pointerId !== ev.pointerId) return;
    this._clearGesture();
  }

  _clearGesture() {
    if (!this._gesture) return;
    clearTimeout(this._gesture.timer);
    this._gesture.tile?.classList?.remove("holding");
    this._gesture = null;
  }

  async _executeDeviceAction(device, action) {
    if (!device?.entity || action === "none") return;
    if (action === "toggle") {
      try {
        await this._hass.callService("homeassistant", "toggle", { entity_id: device.entity });
      } catch (err) { this._toast(`No se pudo alternar ${device.entity}: ${err?.message || err}`, "error"); }
      return;
    }
    if (action === "more-info") {
      // The same native dialog used by Home Assistant entity cards.
      const event = new CustomEvent("hass-more-info", {
        detail: { entityId: device.entity },
        bubbles: true,
        composed: true,
      });
      this.dispatchEvent(event);
    }
  }
}

if (!customElements.get("smart-lighting-panel")) customElements.define("smart-lighting-panel", SmartLightingPanel);
