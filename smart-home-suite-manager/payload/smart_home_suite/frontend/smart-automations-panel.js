/**
 * Smart Automations Panel 1.0.0
 * Smart Home Suite laboratory pilot.
 *
 * Creates/updates/deletes native Home Assistant automations using the same
 * REST endpoints used by the native HA automation editor. The Suite stores
 * only UI configuration, recipe parameters and ownership metadata.
 */

const PANEL_VERSION = "1.0.0";
const DOMAIN = "smart_automations_panel";
const RECIPE_VERSION = "0.1.0";

const deepClone = (value) => JSON.parse(JSON.stringify(value));

function deepMerge(base, extra) {
  if (Array.isArray(base)) return Array.isArray(extra) ? deepClone(extra) : deepClone(base);
  if (!base || typeof base !== "object") return extra === undefined ? base : extra;
  const out = { ...base };
  if (!extra || typeof extra !== "object" || Array.isArray(extra)) return out;
  for (const [key, value] of Object.entries(extra)) {
    if (value && typeof value === "object" && !Array.isArray(value) && base[key] && typeof base[key] === "object" && !Array.isArray(base[key])) {
      out[key] = deepMerge(base[key], value);
    } else {
      out[key] = deepClone(value);
    }
  }
  return out;
}

function newId(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === "object") {
    const out = {};
    for (const key of Object.keys(value).sort()) out[key] = stable(value[key]);
    return out;
  }
  return value;
}

function hashObject(value) {
  const text = JSON.stringify(stable(value));
  let hash = 2166136261;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

const RECIPE_META = {
  lighting_sun: {
    category: "lighting",
    categoryLabel: "Iluminación",
    label: "Iluminación por sol",
    description: "Enciende o apaga luces al amanecer/anochecer.",
    icon: "mdi:weather-sunset-up",
    color: "#ffd66b",
  },
  lights_away: {
    category: "presence",
    categoryLabel: "Presencia",
    label: "Apagar luces al salir",
    description: "Apaga luces cuando todas las personas/dispositivos seleccionados están fuera de Casa.",
    icon: "mdi:home-export-outline",
    color: "#7cb7ff",
  },
  high_power: {
    category: "energy",
    categoryLabel: "Energía",
    label: "Consumo elevado",
    description: "Notifica cuando la potencia supera un límite durante un tiempo.",
    icon: "mdi:flash-alert-outline",
    color: "#35ddd5",
  },
  energy_limit: {
    category: "energy",
    categoryLabel: "Energía",
    label: "Límite de kWh",
    description: "Notifica cuando el consumo facturado cruza un límite de kWh.",
    icon: "mdi:counter",
    color: "#77d898",
  },
};

const DEFAULTS = {
  schema_version: 2,
  header: {
    show: true,
    title: "Automatizaciones",
    subtitle: "Control simple · motor nativo de Home Assistant",
    icon: "mdi:robot",
    icon_color: "#b59cff",
    icon_size: 30,
    title_color: "#f5f7fa",
    subtitle_color: "#8e9aa4",
    title_size: 27,
    subtitle_size: 13,
    align: "left",
  },
  design: {
    background: "#080d11",
    background_secondary: "#11181e",
    panel_max_width: 520,
    panel_padding: 12,
    section_gap: 22,
    card_gap: 10,
    columns_mobile: 1,
    columns_tablet: 2,
    columns_desktop: 2,
    card_min_height: 112,
    card_background: "#11181e",
    card_border: "#26323a",
    card_border_width: 1,
    card_radius: 20,
    card_padding: 14,
    card_shadow: "0 10px 30px rgba(0,0,0,.18)",
    summary_padding: 15,
    category_title_color: "#dfe6ea",
    text_color: "#f5f7fa",
    muted_color: "#8e9aa4",
    accent_color: "#b59cff",
    unavailable_color: "#ef6461",
    font_family: "Roboto, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  navigation: {
    show: false,
    position: "bottom",
    columns: 4,
    gap: 8,
    button_height: 58,
    radius: 15,
    background: "#11181e",
    border_color: "#26323a",
    text_color: "#8e9aa4",
    active_color: "#b59cff",
    icon_size: 23,
    font_size: 10,
    show_labels: true,
    buttons: [
      { show: true, label: "Inicio", icon: "mdi:home", path: "/smart-home", color: "#35ddd5" },
      { show: true, label: "Luces", icon: "mdi:lightbulb-group", path: "/lighting", color: "#ffd66b" },
      { show: true, label: "Energía", icon: "mdi:lightning-bolt-circle", path: "/energy-advanced", color: "#35ddd5" },
      { show: true, label: "Automatiza", icon: "mdi:robot", path: "/smart-automations", color: "#b59cff" },
    ],
  },
  instances: [],
};

function recipeDefaults(recipe) {
  if (recipe === "lighting_sun") {
    return {
      alias: "Iluminación exterior por sol",
      lights: [],
      sunset_enabled: true,
      sunset_action: "turn_on",
      sunset_offset_min: 0,
      sunrise_enabled: true,
      sunrise_action: "turn_off",
      sunrise_offset_min: 0,
    };
  }
  if (recipe === "lights_away") {
    return {
      alias: "Apagar luces al salir de casa",
      presence_entities: [],
      lights: [],
      delay_minutes: 5,
    };
  }
  if (recipe === "high_power") {
    return {
      alias: "Aviso por consumo elevado",
      power_sensor: "",
      threshold_w: 6000,
      duration_minutes: 3,
      notify_entity: "",
      title: "Consumo eléctrico elevado",
      message: "La vivienda superó el límite de potencia configurado.",
    };
  }
  return {
    alias: "Aviso por límite de kWh",
    energy_sensor: "sensor.power_record_ciclo_kwh_mes_facturado",
    threshold_kwh: 500,
    notify_entity: "",
    title: "Límite de energía alcanzado",
    message: "El consumo facturado alcanzó el límite configurado.",
  };
}

function migrateConfig(raw) {
  const source = raw && typeof raw === "object" && !Array.isArray(raw) ? deepClone(raw) : {};
  const fromVersion = Number(source.schema_version || 1);
  let changed = false;

  if (fromVersion < 2) {
    source.schema_version = 2;
    source.design = source.design && typeof source.design === "object" ? source.design : {};
    // Early pilot 0.1.0 persisted max_width=820 even though it could not be edited.
    // Move that legacy setting to the Panel Standard property and use the
    // mobile-oriented 520 px default requested for the Suite.
    if (source.design.panel_max_width === undefined) source.design.panel_max_width = 520;
    delete source.design.max_width;
    delete source.design.radius;
    changed = true;
  }

  return { config: source, changed };
}

class SmartAutomationsPanel extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._hass = null;
    this._panel = null;
    this._narrow = false;
    this._loaded = false;
    this._loading = false;
    this._storedConfig = {};
    this._backendOk = true;
    this._automationEditor = null;
    this._settingsOpen = false;
    this._settingsTab = "general";
    this._editSettings = null;
    this._recipeChooser = false;
    this._toastMessage = "";
    this._toastType = "ok";
    this._renderQueued = false;
    this._externalByInstance = {};
    this._missingByInstance = {};

    this.shadowRoot.addEventListener("click", (ev) => this._onClick(ev));
    this.shadowRoot.addEventListener("change", (ev) => this._onChange(ev));
    this.shadowRoot.addEventListener("input", (ev) => this._onInput(ev));
  }

  set hass(value) {
    this._hass = value;
    if (!this._loaded && !this._loading) this._loadConfig();
    if (!this._automationEditor && !this._settingsOpen && !this._recipeChooser) this._queueRender();
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
      const migrated = migrateConfig(result?.config || {});
      this._storedConfig = migrated.config;
      this._backendOk = true;
      if (migrated.changed && this._hass?.user?.is_admin) {
        try {
          const saveCfg = deepMerge(DEFAULTS, this._storedConfig);
          await this._hass.callWS({ type: `${DOMAIN}/config/save`, config: saveCfg });
          this._storedConfig = saveCfg;
        } catch (migrationErr) {
          console.warn("Smart Automations: config migration could not be persisted yet", migrationErr);
        }
      }
    } catch (err) {
      console.error("Smart Automations: backend unavailable", err);
      this._storedConfig = {};
      this._backendOk = false;
    } finally {
      this._loaded = true;
      this._loading = false;
      this._queueRender();
      if (this._hass?.user?.is_admin) this._verifyManagedAutomations();
    }
  }

  _config() {
    // While Personalización is open, render the working copy immediately.
    // Guardar persists it; Cancelar discards it and returns to _storedConfig.
    const source = this._settingsOpen && this._editSettings
      ? this._editSettings
      : (this._storedConfig || {});
    return deepMerge(DEFAULTS, source);
  }

  _captureSettingsState() {
    if (!this._settingsOpen) return null;
    const overlay = this.shadowRoot.querySelector(".editor-overlay");
    const body = this.shadowRoot.querySelector(".drawer-body");
    const active = this.shadowRoot.activeElement;
    return {
      overlayTop: overlay?.scrollTop || 0,
      bodyTop: body?.scrollTop || 0,
      key: active?.dataset?.bind || active?.dataset?.selectorFallback || active?.id || null,
      start: typeof active?.selectionStart === "number" ? active.selectionStart : null,
      end: typeof active?.selectionEnd === "number" ? active.selectionEnd : null,
    };
  }

  _restoreSettingsState(snapshot) {
    if (!snapshot) return;
    requestAnimationFrame(() => {
      const overlay = this.shadowRoot.querySelector(".editor-overlay");
      const body = this.shadowRoot.querySelector(".drawer-body");
      if (overlay) overlay.scrollTop = snapshot.overlayTop;
      if (body) body.scrollTop = snapshot.bodyTop;
      if (!snapshot.key) return;
      let el = this.shadowRoot.querySelector(`[data-bind="${CSS.escape(snapshot.key)}"]`);
      if (!el) el = this.shadowRoot.querySelector(`[data-selector-fallback="${CSS.escape(snapshot.key)}"]`);
      if (!el) el = this.shadowRoot.getElementById(snapshot.key);
      if (!el) return;
      try { el.focus({ preventScroll: true }); } catch (_) {}
      if (snapshot.start !== null && typeof el.setSelectionRange === "function") {
        try { el.setSelectionRange(snapshot.start, snapshot.end); } catch (_) {}
      }
    });
  }

  _queueRender() {
    if (!this.isConnected || this._renderQueued) return;
    this._renderQueued = true;
    requestAnimationFrame(() => {
      this._renderQueued = false;
      this._render();
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

  _icon(icon, size = 24, color = "currentColor") {
    return `<ha-icon icon="${this._escape(icon)}" style="--mdc-icon-size:${Number(size)}px;color:${this._escape(color)}"></ha-icon>`;
  }

  _automationState(instance) {
    const states = Object.values(this._hass?.states || {});
    return states.find((s) => s.entity_id?.startsWith("automation.") && String(s.attributes?.id || "") === String(instance.automation_id || "")) || null;
  }

  _countSummary(cfg) {
    let active = 0, paused = 0, missing = 0;
    for (const inst of cfg.instances || []) {
      const state = this._automationState(inst);
      if (!state) missing++;
      else if (state.state === "on") active++;
      else paused++;
    }
    return { active, paused, missing };
  }

  _render() {
    if (!this._hass || !this._panel || !this._loaded) {
      this.shadowRoot.innerHTML = `<style>:host{display:block;min-height:100vh;background:#080d11;color:#fff;font-family:system-ui}.loading{padding:36px;text-align:center;opacity:.7}</style><div class="loading">Cargando automatizaciones…</div>`;
      return;
    }
    const settingsSnapshot = this._captureSettingsState();
    const cfg = this._config();
    const topNav = cfg.navigation?.show && cfg.navigation.position === "top";
    const bottomNav = cfg.navigation?.show && cfg.navigation.position !== "top";
    this.shadowRoot.innerHTML = `
      <style>${this._styles(cfg)}</style>
      <main class="page">
        ${this._header(cfg)}
        ${!this._backendOk ? `<div class="warning">Backend Smart Automations no disponible.</div>` : ""}
        ${topNav ? this._navigation(cfg) : ""}
        ${this._summary(cfg)}
        ${this._categories(cfg)}
        ${bottomNav ? this._navigation(cfg) : ""}
        <div class="version">Smart Automations ${PANEL_VERSION}</div>
      </main>
      ${this._recipeChooser ? this._recipeChooserHtml() : ""}
      ${this._automationEditor ? this._automationEditorHtml() : ""}
      ${this._settingsOpen ? this._settingsHtml() : ""}
      ${this._toastMessage ? `<div class="toast ${this._toastType}">${this._escape(this._toastMessage)}</div>` : ""}
    `;
    this._mountSelectors();
    this._restoreSettingsState(settingsSnapshot);
  }

  _header(cfg) {
    const h = cfg.header;
    return `<header class="header align-${this._escape(h.align || "left")}">
      <div class="head-main">
        ${h.show !== false ? `<div class="head-icon">${this._icon(h.icon || "mdi:robot", h.icon_size || 30, h.icon_color || cfg.design.accent_color)}</div><div class="head-copy"><div class="title" style="color:${this._escape(h.title_color || cfg.design.text_color)};font-size:${Number(h.title_size || 27)}px">${this._escape(h.title || "Automatizaciones")}</div><div class="subtitle" style="color:${this._escape(h.subtitle_color || cfg.design.muted_color)};font-size:${Number(h.subtitle_size || 13)}px">${this._escape(h.subtitle || "")}</div></div>` : ""}
      </div>
      <div class="head-actions">
        ${this._hass?.user?.is_admin ? `<button class="icon-btn" data-action="open-settings" title="Personalización">${this._icon("mdi:cog", 23)}</button>` : ""}
      </div>
    </header>`;
  }

  _summary(cfg) {
    const s = this._countSummary(cfg);
    return `<section class="summary">
      <div><div class="summary-title">Panel de automatizaciones</div><div class="summary-copy"><b>${s.active}</b> activas · <b>${s.paused}</b> pausadas${s.missing ? ` · <b>${s.missing}</b> no encontradas` : ""}</div></div>
      ${this._hass?.user?.is_admin ? `<button class="btn primary" data-action="add-automation">${this._icon("mdi:plus", 20)}<span>Agregar</span></button>` : ""}
    </section>`;
  }

  _categories(cfg) {
    const order = ["lighting", "presence", "energy"];
    const names = { lighting: "Iluminación", presence: "Presencia", energy: "Energía" };
    const icons = { lighting: "mdi:lightbulb-group", presence: "mdi:account-multiple-outline", energy: "mdi:lightning-bolt-circle" };
    const html = [];
    for (const cat of order) {
      const instances = (cfg.instances || []).filter((i) => RECIPE_META[i.recipe]?.category === cat);
      if (!instances.length) continue;
      html.push(`<section class="category"><div class="category-head">${this._icon(icons[cat], 23, cfg.design.accent_color)}<span>${names[cat]}</span><span class="pill">${instances.length}</span></div><div class="cards">${instances.map((i) => this._card(i, cfg)).join("")}</div></section>`);
    }
    if (!html.length) {
      return `<section class="empty"><div class="empty-icon">${this._icon("mdi:robot-outline", 42, cfg.design.muted_color)}</div><div class="empty-title">Todavía no hay automatizaciones Smart</div><div class="empty-copy">Un administrador puede crear una desde las cuatro recetas del piloto. Las automatizaciones se guardarán como automatizaciones nativas de Home Assistant.</div>${this._hass?.user?.is_admin ? `<button class="btn primary" data-action="add-automation">Crear primera automatización</button>` : ""}</section>`;
    }
    return html.join("");
  }

  _card(instance, cfg) {
    const meta = RECIPE_META[instance.recipe] || { label: instance.recipe, icon: "mdi:robot", color: cfg.design.accent_color };
    const state = this._automationState(instance);
    const missing = !state || this._missingByInstance[instance.id];
    const external = Boolean(this._externalByInstance[instance.id]);
    const on = state?.state === "on";
    const status = missing ? "No encontrada" : on ? "Activa" : "Pausada";
    const detail = this._instanceDetail(instance);
    return `<article class="card ${missing ? "missing" : ""}">
      <div class="card-top">
        <div class="recipe-icon">${this._icon(meta.icon, 27, meta.color)}</div>
        <div class="card-copy"><div class="card-title">${this._escape(instance.alias || meta.label)}</div><div class="card-detail">${this._escape(detail)}</div></div>
        <button class="toggle ${on ? "on" : ""}" data-action="toggle-automation" data-instance-id="${this._escape(instance.id)}" ${missing ? "disabled" : ""} aria-label="${this._escape(status)}"><span></span></button>
      </div>
      <div class="card-bottom"><div class="status ${missing ? "bad" : on ? "good" : ""}"><span class="dot"></span>${status}${external ? " · Modificada en HA" : ""}</div><div class="card-actions">${this._hass?.user?.is_admin ? `<button class="mini" data-action="edit-instance" data-instance-id="${this._escape(instance.id)}">Editar</button><button class="mini" data-action="open-native" data-instance-id="${this._escape(instance.id)}">HA</button>` : ""}</div></div>
    </article>`;
  }

  _instanceDetail(instance) {
    const p = instance.params || {};
    if (instance.recipe === "lighting_sun") {
      const a = p.sunset_enabled ? "Anochecer" : "";
      const b = p.sunrise_enabled ? "Amanecer" : "";
      return `${[a,b].filter(Boolean).join(" + ")} · ${(p.lights || []).length} luz/luces`;
    }
    if (instance.recipe === "lights_away") return `Casa vacía · ${Number(p.delay_minutes || 0)} min · ${(p.lights || []).length} luz/luces`;
    if (instance.recipe === "high_power") return `>${Number(p.threshold_w || 0)} W durante ${Number(p.duration_minutes || 0)} min`;
    if (instance.recipe === "energy_limit") return `${Number(p.threshold_kwh || 0)} kWh · ${p.energy_sensor || "sensor sin configurar"}`;
    return "";
  }

  _navigation(cfg) {
    const nav = cfg.navigation || {};
    const buttons = (nav.buttons || []).filter((b) => b.show !== false);
    if (!buttons.length) return "";
    const current = window.location.pathname;
    return `<nav class="nav">${buttons.map((b) => {
      const active = current === b.path || (b.path && b.path !== "/" && current.startsWith(`${b.path}/`));
      const color = b.color || (active ? nav.active_color : nav.text_color);
      return `<button class="nav-btn ${active ? "active" : ""}" data-nav="${this._escape(b.path)}">${this._icon(b.icon || "mdi:circle-outline", nav.icon_size || 23, color)}${nav.show_labels !== false ? `<span>${this._escape(b.label || "")}</span>` : ""}</button>`;
    }).join("")}</nav>`;
  }

  _recipeChooserHtml() {
    return `<div class="overlay"><section class="chooser"><div class="drawer-head"><div><div class="drawer-title">Nueva automatización</div><div class="drawer-sub">Elige una receta Smart. Después podrás ajustar sus entidades y límites.</div></div><button class="icon-btn" data-action="close-chooser">${this._icon("mdi:close", 22)}</button></div><div class="recipe-list">${Object.entries(RECIPE_META).map(([key, meta]) => `<button class="recipe-choice" data-action="choose-recipe" data-recipe="${key}"><span class="recipe-icon">${this._icon(meta.icon, 29, meta.color)}</span><span><b>${meta.label}</b><small>${meta.description}</small></span>${this._icon("mdi:chevron-right", 22)}</button>`).join("")}</div></section></div>`;
  }

  _automationEditorHtml() {
    const ed = this._automationEditor;
    const p = ed.params;
    const meta = RECIPE_META[ed.recipe];
    return `<div class="overlay editor-overlay"><section class="drawer">
      <div class="drawer-head"><div><div class="drawer-title">${ed.isNew ? "Nueva" : "Editar"} · ${this._escape(meta.label)}</div><div class="drawer-sub">La ejecución será una automatización nativa de Home Assistant.</div></div><button class="icon-btn" data-action="cancel-instance">${this._icon("mdi:close", 22)}</button></div>
      <div class="drawer-body">
        ${this._externalByInstance[ed.id] ? `<div class="warning">Esta automatización fue modificada desde Home Assistant. Guardar desde Smart Automations reemplazará esa configuración nativa.</div>` : ""}
        ${this._fieldText("auto.alias", "Nombre", p.alias)}
        ${this._recipeFields(ed)}
      </div>
      <div class="drawer-actions">${!ed.isNew ? `<button class="btn danger" data-action="delete-instance">Eliminar</button>` : `<span></span>`}<div><button class="btn ghost" data-action="cancel-instance">Cancelar</button><button class="btn primary" data-action="save-instance">Guardar</button></div></div>
    </section></div>`;
  }

  _recipeFields(ed) {
    const p = ed.params;
    if (ed.recipe === "lighting_sun") {
      return `${this._selectorField("auto.lights", "Luz o luces", { entity: { multiple: true, filter: [{ domain: ["light", "switch"] }] } }, p.lights || [])}
        <div class="two">${this._fieldCheck("auto.sunset_enabled", "Al anochecer", p.sunset_enabled)}${this._fieldSelect("auto.sunset_action", "Acción anochecer", p.sunset_action, [["turn_on","Encender"],["turn_off","Apagar"]])}</div>
        ${this._fieldNumber("auto.sunset_offset_min", "Ajuste anochecer (min)", p.sunset_offset_min, -180, 180, 1, "Negativo = antes; positivo = después")}
        <div class="two">${this._fieldCheck("auto.sunrise_enabled", "Al amanecer", p.sunrise_enabled)}${this._fieldSelect("auto.sunrise_action", "Acción amanecer", p.sunrise_action, [["turn_on","Encender"],["turn_off","Apagar"]])}</div>
        ${this._fieldNumber("auto.sunrise_offset_min", "Ajuste amanecer (min)", p.sunrise_offset_min, -180, 180, 1, "Negativo = antes; positivo = después")}`;
    }
    if (ed.recipe === "lights_away") {
      return `${this._selectorField("auto.presence_entities", "Personas o móviles", { entity: { multiple: true, filter: [{ domain: ["person", "device_tracker"] }] } }, p.presence_entities || [])}
        <div class="help">La automatización dispara cuando una entidad seleccionada sale de <code>zone.home</code> y comprueba que todas estén fuera antes de apagar.</div>
        ${this._selectorField("auto.lights", "Luces a apagar", { entity: { multiple: true, filter: [{ domain: ["light", "switch"] }] } }, p.lights || [])}
        ${this._fieldNumber("auto.delay_minutes", "Espera antes de apagar (min)", p.delay_minutes, 0, 120, 1)}`;
    }
    if (ed.recipe === "high_power") {
      return `${this._selectorField("auto.power_sensor", "Sensor de potencia", { entity: { filter: [{ domain: "sensor", device_class: "power" }, { domain: "sensor", unit_of_measurement: ["W", "kW"] }] } }, p.power_sensor || "")}
        ${this._fieldNumber("auto.threshold_w", "Límite", p.threshold_w, 1, 100000, 1, "Watts")}
        ${this._fieldNumber("auto.duration_minutes", "Debe permanecer arriba (min)", p.duration_minutes, 0, 240, 1)}
        ${this._notificationFields(p)}`;
    }
    return `${this._selectorField("auto.energy_sensor", "Sensor de kWh facturados", { entity: { include_entities: ["sensor.power_record_ciclo_kwh_mes_facturado", "sensor.power_record_ciclo_kwh_diario_facturado"], filter: [{ domain: "sensor", device_class: "energy" }, { domain: "sensor", unit_of_measurement: ["kWh", "Wh"] }] } }, p.energy_sensor || "")}
      <div class="recommended"><b>Entidades de laboratorio recomendadas</b><code>sensor.power_record_ciclo_kwh_mes_facturado</code><code>sensor.power_record_ciclo_kwh_diario_facturado</code></div>
      ${this._fieldNumber("auto.threshold_kwh", "Límite de consumo", p.threshold_kwh, 0.01, 100000, 0.01, "kWh")}
      ${this._notificationFields(p)}`;
  }

  _notificationFields(p) {
    return `${this._selectorField("auto.notify_entity", "Destino de notificación", { entity: { filter: [{ domain: "notify" }] } }, p.notify_entity || "")}
      <div class="help">Si no seleccionas un <code>notify.*</code>, se usará una notificación persistente dentro de Home Assistant.</div>
      ${this._fieldText("auto.title", "Título", p.title || "")}
      ${this._fieldText("auto.message", "Mensaje", p.message || "")}`;
  }

  _settingsHtml() {
    const cfg = this._editSettings;
    return `<div class="overlay editor-overlay"><section class="drawer settings-drawer">
      <div class="drawer-head"><div><div class="drawer-title">Personalización</div><div class="drawer-sub">Smart Automations · Panel Standard</div></div><button class="icon-btn" data-action="cancel-settings">${this._icon("mdi:close", 22)}</button></div>
      <div class="tabs">${[["general","Encabezado"],["appearance","Apariencia"],["navigation","Navegación"],["data","Datos"],["diagnostics","Diagnóstico"]].map(([k,l]) => `<button class="tab ${this._settingsTab===k?"active":""}" data-action="settings-tab" data-tab="${k}">${l}</button>`).join("")}</div>
      <div class="drawer-body">${this._settingsBody(cfg)}</div>
      <div class="drawer-actions"><span></span><div><button class="btn ghost" data-action="cancel-settings">Cancelar</button><button class="btn primary" data-action="save-settings">Guardar</button></div></div>
    </section></div>`;
  }

  _settingsBody(cfg) {
    if (this._settingsTab === "general") {
      return `${this._fieldCheck("settings.header.show", "Mostrar encabezado", cfg.header.show)}
        ${this._fieldText("settings.header.title", "Título", cfg.header.title)}
        ${this._fieldText("settings.header.subtitle", "Subtítulo", cfg.header.subtitle)}
        ${this._selectorField("settings.header.icon", "Icono MDI", { icon: {} }, cfg.header.icon)}
        <div class="two">${this._fieldText("settings.header.icon_color", "Color icono", cfg.header.icon_color, "color")}${this._fieldNumber("settings.header.icon_size", "Tamaño icono", cfg.header.icon_size, 16, 64, 1, "px")}</div>
        <div class="two">${this._fieldText("settings.header.title_color", "Color título", cfg.header.title_color, "color")}${this._fieldNumber("settings.header.title_size", "Tamaño título", cfg.header.title_size, 16, 48, 1, "px")}</div>
        <div class="two">${this._fieldText("settings.header.subtitle_color", "Color subtítulo", cfg.header.subtitle_color, "color")}${this._fieldNumber("settings.header.subtitle_size", "Tamaño subtítulo", cfg.header.subtitle_size, 9, 28, 1, "px")}</div>
        ${this._fieldSelect("settings.header.align", "Alineación", cfg.header.align, [["left","Izquierda"],["center","Centro"],["right","Derecha"]])}`;
    }
    if (this._settingsTab === "appearance") {
      const d = cfg.design;
      return `<div class="settings-section-title">Panel y responsive</div>
        ${this._fieldNumber("settings.design.panel_max_width", "Ancho máximo del panel", d.panel_max_width, 320, 1600, 10, "px")}
        <div class="help">Para el estilo móvil de la Suite recomendamos <b>520 px</b>. En teléfonos el panel nunca excede el ancho disponible.</div>
        <div class="two">${this._fieldNumber("settings.design.panel_padding", "Margen interior", d.panel_padding, 0, 60, 1, "px")}${this._fieldNumber("settings.design.section_gap", "Separación secciones", d.section_gap, 0, 80, 1, "px")}</div>
        <div class="two">${this._fieldNumber("settings.design.card_gap", "Separación tarjetas", d.card_gap, 0, 50, 1, "px")}${this._fieldNumber("settings.design.card_min_height", "Alto mínimo tarjeta", d.card_min_height, 70, 300, 1, "px")}</div>
        <div class="settings-section-title">Columnas</div>
        <div class="three">${this._fieldNumber("settings.design.columns_mobile", "Móvil", d.columns_mobile, 1, 4, 1)}${this._fieldNumber("settings.design.columns_tablet", "Tablet", d.columns_tablet, 1, 6, 1)}${this._fieldNumber("settings.design.columns_desktop", "PC", d.columns_desktop, 1, 8, 1)}</div>
        <div class="settings-section-title">Tarjetas</div>
        <div class="two">${this._fieldNumber("settings.design.card_radius", "Radio", d.card_radius, 0, 60, 1, "px")}${this._fieldNumber("settings.design.card_padding", "Padding", d.card_padding, 4, 50, 1, "px")}</div>
        <div class="two">${this._fieldNumber("settings.design.card_border_width", "Borde", d.card_border_width, 0, 6, 1, "px")}${this._fieldNumber("settings.design.summary_padding", "Padding resumen", d.summary_padding, 4, 50, 1, "px")}</div>
        ${this._fieldText("settings.design.card_shadow", "Sombra CSS", d.card_shadow)}
        <div class="settings-section-title">Colores</div>
        <div class="two">${this._fieldText("settings.design.background", "Fondo", d.background, "color")}${this._fieldText("settings.design.background_secondary", "Fondo secundario", d.background_secondary, "color")}</div>
        <div class="two">${this._fieldText("settings.design.card_background", "Fondo tarjetas", d.card_background, "color")}${this._fieldText("settings.design.card_border", "Borde tarjetas", d.card_border, "color")}</div>
        <div class="two">${this._fieldText("settings.design.text_color", "Texto", d.text_color, "color")}${this._fieldText("settings.design.muted_color", "Texto secundario", d.muted_color, "color")}</div>
        <div class="two">${this._fieldText("settings.design.accent_color", "Acento", d.accent_color, "color")}${this._fieldText("settings.design.category_title_color", "Títulos de categoría", d.category_title_color, "color")}</div>
        ${this._fieldText("settings.design.unavailable_color", "Error / no disponible", d.unavailable_color, "color")}
        <div class="settings-section-title">Tipografía</div>
        ${this._fieldText("settings.design.font_family", "Familia de fuente", d.font_family)}`;
    }
    if (this._settingsTab === "navigation") {
      const n = cfg.navigation;
      const buttons = (n.buttons || []).map((b, i) => `<div class="nav-editor"><div class="two">${this._fieldCheck(`settings.navigation.buttons.${i}.show`, "Mostrar", b.show)}${this._fieldText(`settings.navigation.buttons.${i}.label`, "Texto", b.label)}</div>${this._selectorField(`settings.navigation.buttons.${i}.icon`, "Icono", { icon: {} }, b.icon)}<div class="two">${this._fieldText(`settings.navigation.buttons.${i}.path`, "Ruta", b.path)}${this._fieldText(`settings.navigation.buttons.${i}.color`, "Color icono", b.color || n.text_color, "color")}</div><button class="mini danger-text" data-action="remove-nav" data-index="${i}">Eliminar botón</button></div>`).join("");
      return `${this._fieldCheck("settings.navigation.show", "Mostrar navegación", n.show)}
        <div class="two">${this._fieldSelect("settings.navigation.position", "Posición", n.position, [["top","Arriba"],["bottom","Abajo"]])}${this._fieldCheck("settings.navigation.show_labels", "Mostrar texto", n.show_labels)}</div>
        <div class="three">${this._fieldNumber("settings.navigation.columns", "Columnas", n.columns, 1, 8, 1)}${this._fieldNumber("settings.navigation.gap", "Separación", n.gap, 0, 40, 1, "px")}${this._fieldNumber("settings.navigation.button_height", "Altura", n.button_height, 36, 120, 1, "px")}</div>
        <div class="three">${this._fieldNumber("settings.navigation.radius", "Radio", n.radius, 0, 50, 1, "px")}${this._fieldNumber("settings.navigation.icon_size", "Icono", n.icon_size, 12, 50, 1, "px")}${this._fieldNumber("settings.navigation.font_size", "Texto", n.font_size, 8, 24, 1, "px")}</div>
        <div class="two">${this._fieldText("settings.navigation.background", "Fondo", n.background, "color")}${this._fieldText("settings.navigation.border_color", "Borde", n.border_color, "color")}</div>
        <div class="two">${this._fieldText("settings.navigation.text_color", "Texto", n.text_color, "color")}${this._fieldText("settings.navigation.active_color", "Activo", n.active_color, "color")}</div>
        ${buttons}<button class="btn ghost full" data-action="add-nav">+ Agregar botón</button>`;
    }
    if (this._settingsTab === "data") {
      return `<div class="data-actions"><button class="btn ghost" data-action="export-config">Exportar JSON</button><button class="btn ghost" data-action="import-config">Importar JSON</button><button class="btn danger" data-action="reset-ui">Restablecer panel</button><input id="import-file" type="file" accept="application/json,.json" hidden></div><div class="info-box">${this._icon("mdi:shield-check-outline",20)}<span><b>Restablecer panel</b> conserva las automatizaciones administradas y sólo restablece apariencia/navegación. No borra automatizaciones nativas de Home Assistant.</span></div><textarea class="json-preview" readonly>${this._escape(JSON.stringify(cfg, null, 2))}</textarea>`;
    }
    const instances = cfg.instances || [];
    const external = instances.filter((i) => this._externalByInstance[i.id]).length;
    const missing = instances.filter((i) => !this._automationState(i) || this._missingByInstance[i.id]).length;
    return `<div class="diag"><div><span>Panel</span><b>${PANEL_VERSION}</b></div><div><span>Suite</span><b>${this._escape(this._panel?.config?.suite_version || "—")}</b></div><div><span>Instancias administradas</span><b>${instances.length}</b></div><div><span>Modificadas en HA</span><b>${external}</b></div><div><span>No encontradas</span><b>${missing}</b></div><div><span>Backend</span><b>${this._backendOk ? "OK" : "ERROR"}</b></div></div><div class="help">El diagnóstico central de Smart Home Suite también reportará si este módulo está habilitado, cargado y con su panel registrado.</div>`;
  }

  _fieldText(path, label, value, type = "text") {
    return `<label class="field"><span>${this._escape(label)}</span><input type="${type}" value="${this._escape(value ?? "")}" data-bind="${this._escape(path)}"></label>`;
  }

  _fieldNumber(path, label, value, min, max, step = 1, suffix = "") {
    return `<label class="field"><span>${this._escape(label)}</span><div class="number-wrap"><input type="number" value="${this._escape(value ?? 0)}" min="${min}" max="${max}" step="${step}" data-bind="${this._escape(path)}">${suffix ? `<small>${this._escape(suffix)}</small>` : ""}</div></label>`;
  }

  _fieldCheck(path, label, checked) {
    return `<label class="check"><input type="checkbox" ${checked ? "checked" : ""} data-bind="${this._escape(path)}"><span>${this._escape(label)}</span></label>`;
  }

  _fieldSelect(path, label, value, options) {
    return `<label class="field"><span>${this._escape(label)}</span><select data-bind="${this._escape(path)}">${options.map(([v,l]) => `<option value="${this._escape(v)}" ${String(v)===String(value)?"selected":""}>${this._escape(l)}</option>`).join("")}</select></label>`;
  }

  _selectorField(path, label, selector, value) {
    const encoded = encodeURIComponent(JSON.stringify(selector));
    return `<label class="field selector-field"><span>${this._escape(label)}</span><div class="selector-host" data-selector-path="${this._escape(path)}" data-selector="${encoded}" data-selector-value="${this._escape(JSON.stringify(value ?? ""))}"></div><input class="selector-fallback" type="text" value="${this._escape(Array.isArray(value) ? value.join(", ") : value || "")}" data-selector-fallback="${this._escape(path)}" placeholder="entity_id / mdi:..."></label>`;
  }

  _mountSelectors() {
    for (const host of this.shadowRoot.querySelectorAll(".selector-host")) {
      if (host.dataset.mounted === "1") continue;
      const path = host.dataset.selectorPath;
      let selector, value;
      try { selector = JSON.parse(decodeURIComponent(host.dataset.selector)); } catch (_) { continue; }
      try { value = JSON.parse(host.dataset.selectorValue || '""'); } catch (_) { value = ""; }
      const mount = () => {
        if (!customElements.get("ha-selector") || !host.isConnected) return false;
        const el = document.createElement("ha-selector");
        el.hass = this._hass;
        el.selector = selector;
        el.value = value;
        el.narrow = this._narrow;
        el.required = false;
        el.addEventListener("value-changed", (ev) => {
          const val = ev?.detail?.value;
          this._setBoundValue(path, val);
          const fallback = host.parentElement?.querySelector(`[data-selector-fallback="${CSS.escape(path)}"]`);
          if (fallback) fallback.value = Array.isArray(val) ? val.join(", ") : (val ?? "");
        });
        host.replaceChildren(el);
        host.dataset.mounted = "1";
        return true;
      };
      if (mount()) continue;
      customElements.whenDefined("ha-selector").then(() => mount()).catch(() => {});
    }
  }

  _parseFallback(path, text) {
    if (["auto.lights", "auto.presence_entities"].includes(path)) return String(text).split(",").map((x) => x.trim()).filter(Boolean);
    return String(text).trim();
  }

  _getSettingsPath(obj, path) {
    return path.split(".").reduce((acc, key) => acc?.[key], obj);
  }

  _setSettingsPath(obj, path, value) {
    const parts = path.split(".");
    let cur = obj;
    for (let i = 0; i < parts.length - 1; i++) {
      const key = parts[i];
      const next = parts[i + 1];
      if (cur[key] === undefined) cur[key] = /^\d+$/.test(next) ? [] : {};
      cur = cur[key];
    }
    cur[parts.at(-1)] = value;
  }

  _setBoundValue(path, value) {
    if (path.startsWith("auto.")) {
      if (!this._automationEditor) return;
      this._automationEditor.params[path.slice(5)] = value;
      return;
    }
    if (path.startsWith("settings.")) {
      if (!this._editSettings) return;
      this._setSettingsPath(this._editSettings, path.slice(9), value);
      // Panel Standard: preview every setting immediately without persisting it.
      this._queueRender();
    }
  }

  _onInput(ev) {
    // Real-time preview for text, number and color fields in Personalización.
    // Focus/selection and drawer scroll are restored after each render.
    const bind = ev.target?.dataset?.bind;
    if (bind?.startsWith("settings.")) {
      let value;
      if (ev.target.type === "checkbox") value = Boolean(ev.target.checked);
      else if (ev.target.type === "number") {
        const parsed = Number(ev.target.value);
        if (!Number.isFinite(parsed)) return;
        value = parsed;
      } else value = ev.target.value;
      this._setBoundValue(bind, value);
      return;
    }
    const fallback = ev.target?.dataset?.selectorFallback;
    if (fallback?.startsWith("settings.")) {
      this._setBoundValue(fallback, this._parseFallback(fallback, ev.target.value));
    }
  }

  _onChange(ev) {
    const bind = ev.target?.dataset?.bind;
    if (bind) {
      let value;
      if (ev.target.type === "checkbox") value = Boolean(ev.target.checked);
      else if (ev.target.type === "number") value = Number(ev.target.value);
      else value = ev.target.value;
      this._setBoundValue(bind, value);
      return;
    }
    const fallback = ev.target?.dataset?.selectorFallback;
    if (fallback) {
      this._setBoundValue(fallback, this._parseFallback(fallback, ev.target.value));
      return;
    }
    if (ev.target?.id === "import-file" && ev.target.files?.[0]) {
      this._importFile(ev.target.files[0]);
    }
  }

  async _onClick(ev) {
    const nav = ev.target.closest?.("[data-nav]");
    if (nav) { this._navigate(nav.dataset.nav); return; }
    const target = ev.target.closest?.("[data-action]");
    if (!target) return;
    const action = target.dataset.action;

    if (action === "open-settings") {
      this._editSettings = deepClone(this._config());
      this._settingsOpen = true;
      this._settingsTab = "general";
      this._queueRender();
      return;
    }
    if (action === "cancel-settings") { this._settingsOpen = false; this._editSettings = null; this._queueRender(); return; }
    if (action === "settings-tab") { this._settingsTab = target.dataset.tab; this._queueRender(); return; }
    if (action === "save-settings") { await this._saveSettings(); return; }
    if (action === "add-automation") { this._recipeChooser = true; this._queueRender(); return; }
    if (action === "close-chooser") { this._recipeChooser = false; this._queueRender(); return; }
    if (action === "choose-recipe") {
      const recipe = target.dataset.recipe;
      this._recipeChooser = false;
      this._automationEditor = { id: newId("instance"), recipe, params: recipeDefaults(recipe), isNew: true };
      this._queueRender();
      return;
    }
    if (action === "cancel-instance") { this._automationEditor = null; this._queueRender(); return; }
    if (action === "save-instance") { await this._saveInstance(); return; }
    if (action === "delete-instance") { await this._deleteInstance(); return; }
    if (action === "edit-instance") {
      const inst = this._config().instances.find((i) => i.id === target.dataset.instanceId);
      if (!inst) return;
      this._automationEditor = { id: inst.id, recipe: inst.recipe, params: deepClone(inst.params || recipeDefaults(inst.recipe)), automation_id: inst.automation_id, isNew: false };
      this._queueRender();
      return;
    }
    if (action === "open-native") {
      const inst = this._config().instances.find((i) => i.id === target.dataset.instanceId);
      if (inst?.automation_id) this._navigate(`/config/automation/edit/${encodeURIComponent(inst.automation_id)}`);
      return;
    }
    if (action === "toggle-automation") { await this._toggleInstance(target.dataset.instanceId); return; }
    if (action === "add-nav") {
      this._editSettings.navigation.buttons.push({ show: true, label: "Nuevo", icon: "mdi:circle-outline", path: "/", color: this._editSettings.navigation.text_color || this._editSettings.design.accent_color });
      this._queueRender(); return;
    }
    if (action === "remove-nav") {
      this._editSettings.navigation.buttons.splice(Number(target.dataset.index), 1);
      this._queueRender(); return;
    }
    if (action === "export-config") { this._exportConfig(); return; }
    if (action === "import-config") { this.shadowRoot.getElementById("import-file")?.click(); return; }
    if (action === "reset-ui") { await this._resetUi(); return; }
  }

  _validateEditor(ed) {
    const p = ed.params;
    if (!String(p.alias || "").trim()) return "Escribe un nombre para la automatización.";
    if (ed.recipe === "lighting_sun") {
      if (!(p.lights || []).length) return "Selecciona al menos una luz.";
      if (!p.sunset_enabled && !p.sunrise_enabled) return "Activa amanecer o anochecer.";
    }
    if (ed.recipe === "lights_away") {
      if (!(p.presence_entities || []).length) return "Selecciona al menos una persona o dispositivo móvil.";
      if (!(p.lights || []).length) return "Selecciona al menos una luz.";
    }
    if (ed.recipe === "high_power") {
      if (!p.power_sensor) return "Selecciona el sensor de potencia.";
      if (!(Number(p.threshold_w) > 0)) return "El límite de potencia debe ser mayor que cero.";
    }
    if (ed.recipe === "energy_limit") {
      if (!p.energy_sensor) return "Selecciona el sensor de kWh facturados.";
      if (!(Number(p.threshold_kwh) > 0)) return "El límite de kWh debe ser mayor que cero.";
    }
    return "";
  }

  _marker(ed) {
    return `Managed by Smart Home Suite / Smart Automations | instance=${ed.id} | recipe=${ed.recipe} | recipe_version=${RECIPE_VERSION}`;
  }

  _notifyAction(params, dynamicLine) {
    const message = `${params.message || "Aviso de Smart Automations"}${dynamicLine ? ` ${dynamicLine}` : ""}`;
    if (params.notify_entity) {
      return { action: "notify.send_message", target: { entity_id: params.notify_entity }, data: { title: params.title || "Smart Automations", message } };
    }
    return { action: "persistent_notification.create", data: { title: params.title || "Smart Automations", message } };
  }

  _buildNativeConfig(ed) {
    const p = ed.params;
    const base = { alias: p.alias, description: this._marker(ed), triggers: [], conditions: [], actions: [], mode: "single" };
    if (ed.recipe === "lighting_sun") {
      if (p.sunset_enabled) base.triggers.push({ trigger: "sun", event: "sunset", offset: Number(p.sunset_offset_min || 0) * 60, id: "sunset" });
      if (p.sunrise_enabled) base.triggers.push({ trigger: "sun", event: "sunrise", offset: Number(p.sunrise_offset_min || 0) * 60, id: "sunrise" });
      const choose = [];
      if (p.sunset_enabled) choose.push({ conditions: [{ condition: "trigger", id: "sunset" }], sequence: [{ action: `homeassistant.${p.sunset_action || "turn_on"}`, target: { entity_id: p.lights } }] });
      if (p.sunrise_enabled) choose.push({ conditions: [{ condition: "trigger", id: "sunrise" }], sequence: [{ action: `homeassistant.${p.sunrise_action || "turn_off"}`, target: { entity_id: p.lights } }] });
      base.actions = [{ choose }];
      return base;
    }
    if (ed.recipe === "lights_away") {
      base.triggers = (p.presence_entities || []).map((entity, idx) => ({ trigger: "zone", entity_id: entity, zone: "zone.home", event: "leave", id: `leave_${idx + 1}` }));
      const safeAwayConditions = (p.presence_entities || []).flatMap((entity) => [
        { condition: "not", conditions: [{ condition: "state", entity_id: entity, state: ["unknown", "unavailable"] }] },
        { condition: "not", conditions: [{ condition: "zone", entity_id: entity, zone: "zone.home" }] },
      ]);
      base.conditions = deepClone(safeAwayConditions);
      const actions = [];
      if (Number(p.delay_minutes || 0) > 0) actions.push({ delay: { minutes: Number(p.delay_minutes) } });
      // Re-check after delay so a return home or tracker failure prevents shutdown.
      actions.push(...deepClone(safeAwayConditions));
      actions.push({ action: "homeassistant.turn_off", target: { entity_id: p.lights } });
      base.actions = actions;
      base.mode = "restart";
      return base;
    }
    if (ed.recipe === "high_power") {
      const unit = String(this._hass?.states?.[p.power_sensor]?.attributes?.unit_of_measurement || "W");
      const thresholdState = unit === "kW" ? Number(p.threshold_w) / 1000 : Number(p.threshold_w);
      const trigger = { trigger: "numeric_state", entity_id: p.power_sensor, above: thresholdState };
      if (Number(p.duration_minutes || 0) > 0) trigger.for = { minutes: Number(p.duration_minutes) };
      base.triggers = [trigger];
      base.actions = [this._notifyAction(p, `Valor actual: {{ states('${p.power_sensor}') }} ${unit}.` )];
      return base;
    }
    const energyUnit = String(this._hass?.states?.[p.energy_sensor]?.attributes?.unit_of_measurement || "kWh");
    const energyThresholdState = energyUnit === "Wh" ? Number(p.threshold_kwh) * 1000 : Number(p.threshold_kwh);
    base.triggers = [{ trigger: "numeric_state", entity_id: p.energy_sensor, above: energyThresholdState }];
    base.actions = [this._notifyAction(p, `Valor actual: {{ states('${p.energy_sensor}') }} ${energyUnit}.`)];
    return base;
  }

  _normalizeNativeConfig(config) {
    const c = deepClone(config || {});
    delete c.id;
    // The native API can return empty max fields or normalize legacy keys; only
    // compare fields generated by this pilot.
    return c;
  }

  async _saveInstance() {
    const ed = this._automationEditor;
    if (!ed || !this._hass?.user?.is_admin) return;
    const error = this._validateEditor(ed);
    if (error) { this._toast(error, "error"); return; }
    const automationId = ed.automation_id || String(Date.now());
    const nativeConfig = this._buildNativeConfig(ed);
    try {
      await this._hass.callApi("POST", `config/automation/config/${automationId}`, nativeConfig);
      const cfg = this._config();
      const instances = deepClone(cfg.instances || []);
      const item = {
        id: ed.id,
        recipe: ed.recipe,
        recipe_version: RECIPE_VERSION,
        alias: ed.params.alias,
        automation_id: automationId,
        params: deepClone(ed.params),
        generated_hash: hashObject(this._normalizeNativeConfig(nativeConfig)),
        updated_at: new Date().toISOString(),
      };
      const idx = instances.findIndex((i) => i.id === ed.id);
      if (idx >= 0) instances[idx] = { ...instances[idx], ...item };
      else instances.push({ ...item, created_at: new Date().toISOString() });
      const saveCfg = { ...cfg, instances };
      await this._hass.callWS({ type: `${DOMAIN}/config/save`, config: saveCfg });
      this._storedConfig = saveCfg;
      delete this._externalByInstance[ed.id];
      delete this._missingByInstance[ed.id];
      this._automationEditor = null;
      this._toast("Automatización guardada en Home Assistant");
      setTimeout(() => this._queueRender(), 1200);
    } catch (err) {
      console.error(err);
      this._toast(`No se pudo guardar: ${err?.body?.message || err?.message || err}`, "error");
    }
  }

  async _deleteInstance() {
    const ed = this._automationEditor;
    if (!ed || !this._hass?.user?.is_admin) return;
    if (!confirm(`¿Eliminar “${ed.params.alias}” también de las automatizaciones nativas de Home Assistant?`)) return;
    try {
      if (ed.automation_id) await this._hass.callApi("DELETE", `config/automation/config/${ed.automation_id}`);
      const cfg = this._config();
      const saveCfg = { ...cfg, instances: (cfg.instances || []).filter((i) => i.id !== ed.id) };
      await this._hass.callWS({ type: `${DOMAIN}/config/save`, config: saveCfg });
      this._storedConfig = saveCfg;
      this._automationEditor = null;
      delete this._externalByInstance[ed.id];
      delete this._missingByInstance[ed.id];
      this._toast("Automatización eliminada");
    } catch (err) {
      this._toast(`No se pudo eliminar: ${err?.body?.message || err?.message || err}`, "error");
    }
  }

  async _toggleInstance(instanceId) {
    const inst = this._config().instances.find((i) => i.id === instanceId);
    const state = inst ? this._automationState(inst) : null;
    if (!state) { this._toast("La automatización nativa no está disponible", "error"); return; }
    const service = state.state === "on" ? "turn_off" : "turn_on";
    try {
      await this._hass.callService("automation", service, { entity_id: state.entity_id });
      this._toast(service === "turn_on" ? "Automatización activada" : "Automatización pausada");
    } catch (err) {
      this._toast(`Sin permiso o error al cambiar estado: ${err?.message || err}`, "error");
    }
  }

  async _verifyManagedAutomations() {
    const cfg = this._config();
    for (const inst of cfg.instances || []) {
      if (!inst.automation_id) continue;
      try {
        const current = await this._hass.callApi("GET", `config/automation/config/${inst.automation_id}`);
        const currentHash = hashObject(this._normalizeNativeConfig(current));
        this._externalByInstance[inst.id] = Boolean(inst.generated_hash && currentHash !== inst.generated_hash);
        this._missingByInstance[inst.id] = false;
      } catch (_) {
        this._missingByInstance[inst.id] = true;
      }
    }
    this._queueRender();
  }

  async _saveSettings() {
    if (!this._hass?.user?.is_admin || !this._editSettings) return;
    try {
      await this._hass.callWS({ type: `${DOMAIN}/config/save`, config: this._editSettings });
      this._storedConfig = deepClone(this._editSettings);
      this._settingsOpen = false;
      this._editSettings = null;
      this._toast("Personalización guardada");
    } catch (err) {
      this._toast(`No se pudo guardar: ${err?.message || err}`, "error");
    }
  }

  async _resetUi() {
    if (!confirm("¿Restablecer apariencia y navegación? Las automatizaciones administradas se conservarán.")) return;
    try {
      await this._hass.callWS({ type: `${DOMAIN}/config/reset_ui` });
      const current = this._config();
      this._storedConfig = { schema_version: current.schema_version || 2, instances: deepClone(current.instances || []) };
      this._editSettings = deepClone(this._config());
      this._toast("Panel restablecido; automatizaciones conservadas");
    } catch (err) {
      this._toast(`No se pudo restablecer: ${err?.message || err}`, "error");
    }
  }

  _exportConfig() {
    const data = this._editSettings || this._config();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `smart-automations-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async _importFile(file) {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("La raíz debe ser un objeto JSON");
      const migrated = migrateConfig(parsed);
      this._editSettings = deepMerge(DEFAULTS, migrated.config);
      this._toast("JSON importado a la copia de trabajo; pulsa Guardar");
      this._queueRender();
    } catch (err) {
      this._toast(`Archivo inválido: ${err?.message || err}`, "error");
    }
  }

  _navigate(path) {
    if (!path) return;
    history.pushState(null, "", path);
    window.dispatchEvent(new Event("location-changed"));
  }

  _toast(message, type = "ok") {
    this._toastMessage = message;
    this._toastType = type;
    this._queueRender();
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => { this._toastMessage = ""; this._queueRender(); }, 2800);
  }

  _styles(cfg) {
    const d = cfg.design || {};
    const n = cfg.navigation || {};
    const mobile = Math.max(1, Math.round(Number(d.columns_mobile || 1)));
    const tablet = Math.max(1, Math.round(Number(d.columns_tablet || 2)));
    const desktop = Math.max(1, Math.round(Number(d.columns_desktop || 2)));
    const panelWidth = Math.max(320, Number(d.panel_max_width || 520));
    const panelPad = Math.max(0, Number(d.panel_padding || 12));
    const cardRadius = Math.max(0, Number(d.card_radius || 20));
    const cardBorderWidth = Math.max(0, Number(d.card_border_width ?? 1));
    return `
      :host{display:block;min-height:100vh;min-height:100dvh;background:radial-gradient(circle at 50% -15%,${d.background_secondary} 0%,transparent 42%),${d.background};color:${d.text_color};font-family:${d.font_family || "Roboto,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif"};-webkit-font-smoothing:antialiased}
      *{box-sizing:border-box}button,input,select,textarea{font:inherit}button{color:inherit}.page{width:100%;max-width:${panelWidth}px;margin:0 auto;padding:max(${panelPad}px,env(safe-area-inset-top)) max(${panelPad}px,env(safe-area-inset-right)) max(${Math.max(panelPad,18)}px,env(safe-area-inset-bottom)) max(${panelPad}px,env(safe-area-inset-left));overflow-x:hidden}
      .header{min-height:76px;display:flex;align-items:center;justify-content:space-between;gap:12px;position:relative}.head-main{display:flex;align-items:center;gap:12px;min-width:0;max-width:calc(100% - 150px)}.head-copy{min-width:0}.head-icon,.recipe-icon{display:grid;place-items:center;background:color-mix(in srgb, ${d.accent_color} 10%, transparent);border-radius:15px;flex:none}.head-icon{width:48px;height:48px}.recipe-icon{width:46px;height:46px}.title{font-weight:750;line-height:1.05;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.subtitle{margin-top:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.align-center .head-main{position:absolute;left:50%;transform:translateX(-50%);text-align:center;max-width:calc(100% - 280px)}.align-right .head-main{order:2;margin-left:auto;text-align:right}.align-right .head-actions{order:1}.head-actions{display:flex;gap:8px;align-items:center;flex:none}.icon-btn{width:43px;height:43px;border-radius:14px;border:${cardBorderWidth}px solid ${d.card_border};background:${d.card_background};display:grid;place-items:center;cursor:pointer}.btn{min-height:42px;border-radius:13px;padding:0 14px;border:${cardBorderWidth}px solid ${d.card_border};background:${d.card_background};display:inline-flex;gap:7px;align-items:center;justify-content:center;cursor:pointer;font-weight:650;font-size:13px}.btn.primary{background:color-mix(in srgb, ${d.accent_color} 15%, transparent);border-color:color-mix(in srgb, ${d.accent_color} 48%, transparent);color:${d.accent_color}}.btn.ghost{background:${d.card_background}}.btn.danger{background:rgba(239,100,97,.09);border-color:rgba(239,100,97,.35);color:${d.unavailable_color || "#ef6461"}}.btn.full{width:100%;margin-top:10px}
      .summary{margin:12px 0 ${Math.max(0, Number(d.section_gap || 22))}px;border:${cardBorderWidth}px solid ${d.card_border};border-radius:${cardRadius}px;background:${d.card_background};padding:${Math.max(4, Number(d.summary_padding || 15))}px;box-shadow:${d.card_shadow || "none"};display:flex;justify-content:space-between;align-items:center;gap:12px}.summary-title{font-weight:700}.summary-copy{font-size:13px;color:${d.muted_color};margin-top:4px}.category{margin:0 0 ${Math.max(0, Number(d.section_gap || 22))}px}.category-head{display:flex;align-items:center;gap:8px;padding:0 4px 9px;font-weight:700;color:${d.category_title_color || d.text_color}}.pill{margin-left:auto;background:rgba(255,255,255,.06);border-radius:999px;padding:3px 8px;color:${d.muted_color};font-size:11px}.cards{display:grid;grid-template-columns:repeat(${mobile},minmax(0,1fr));gap:${Math.max(0, Number(d.card_gap || 10))}px}@media (min-width:560px){.cards{grid-template-columns:repeat(${tablet},minmax(0,1fr))}}@media (min-width:820px){.cards{grid-template-columns:repeat(${desktop},minmax(0,1fr))}}
      .card{border:${cardBorderWidth}px solid ${d.card_border};border-radius:${cardRadius}px;background:${d.card_background};padding:${Math.max(4, Number(d.card_padding || 14))}px;min-width:0;min-height:${Math.max(70, Number(d.card_min_height || 112))}px;box-shadow:${d.card_shadow || "none"};display:flex;flex-direction:column;justify-content:space-between}.card.missing{border-color:${d.unavailable_color || "#ef6461"}}.card-top{display:flex;align-items:flex-start;gap:11px}.card-copy{min-width:0;flex:1}.card-title{font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.card-detail{font-size:12px;color:${d.muted_color};margin-top:5px;line-height:1.35;overflow-wrap:anywhere}.toggle{width:45px;height:26px;border:1px solid #37434b;border-radius:999px;background:#202a31;padding:2px;cursor:pointer;flex:none}.toggle span{display:block;width:20px;height:20px;border-radius:50%;background:#7f8b94;transition:.15s}.toggle.on{background:rgba(119,216,152,.15);border-color:rgba(119,216,152,.45)}.toggle.on span{transform:translateX(18px);background:#77d898}.toggle:disabled{opacity:.45;cursor:not-allowed}.card-bottom{display:flex;justify-content:space-between;align-items:center;margin-top:14px;gap:8px;flex-wrap:wrap}.status{font-size:11px;color:${d.muted_color};display:flex;align-items:center;gap:5px;min-width:0}.status.good{color:#77d898}.status.bad{color:${d.unavailable_color || "#ef6461"}}.dot{width:6px;height:6px;border-radius:50%;background:currentColor;flex:none}.card-actions{display:flex;gap:5px;margin-left:auto}.mini{border:${cardBorderWidth}px solid ${d.card_border};background:rgba(255,255,255,.025);border-radius:9px;padding:5px 8px;font-size:11px;cursor:pointer}.danger-text{color:${d.unavailable_color || "#ef6461"}}.empty{border:${cardBorderWidth}px dashed ${d.card_border};border-radius:${cardRadius}px;padding:30px 20px;text-align:center}.empty-icon{margin-bottom:8px}.empty-title{font-weight:700}.empty-copy{max-width:520px;margin:7px auto 14px;color:${d.muted_color};font-size:13px;line-height:1.45}
      .nav{display:grid;grid-template-columns:repeat(${Math.max(1, Number(n.columns || 4))},minmax(0,1fr));gap:${Math.max(0, Number(n.gap || 8))}px;margin:16px 0}.nav-btn{min-height:${Math.max(36, Number(n.button_height || 58))}px;border:1px solid ${n.border_color || d.card_border};background:${n.background || d.card_background};border-radius:${Math.max(0, Number(n.radius || 15))}px;display:flex;flex-direction:column;gap:4px;align-items:center;justify-content:center;font-size:${Math.max(8, Number(n.font_size || 10))}px;cursor:pointer;color:${n.text_color || d.muted_color};min-width:0;overflow:hidden}.nav-btn span{max-width:100%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.nav-btn.active{color:${n.active_color || d.accent_color};border-color:${n.active_color || d.accent_color}}.version{text-align:center;color:${d.muted_color};opacity:.55;font-size:10px;margin-top:20px}.warning{border:1px solid ${d.unavailable_color || "#ef6461"};background:rgba(239,100,97,.08);color:${d.unavailable_color || "#ef6461"};border-radius:13px;padding:10px 12px;margin-bottom:12px;font-size:12px;line-height:1.4}
      .overlay{position:fixed;inset:0;z-index:1000;background:rgba(0,0,0,.55);backdrop-filter:blur(3px);display:flex;justify-content:flex-end}.chooser{width:min(520px,100%);height:100%;background:#0d1419;border-left:1px solid ${d.card_border};padding:0;overflow:auto}.drawer{width:min(560px,100%);height:100dvh;background:#0d1419;border-left:1px solid ${d.card_border};display:flex;flex-direction:column}.drawer-head{flex:none;min-height:78px;padding:15px 16px;display:flex;align-items:center;justify-content:space-between;gap:12px;border-bottom:1px solid ${d.card_border};background:#0d1419;position:relative;z-index:2}.drawer-title{font-size:19px;font-weight:750}.drawer-sub{font-size:12px;color:${d.muted_color};margin-top:3px;line-height:1.35}.drawer-body{flex:1;overflow:auto;padding:16px}.drawer-actions{flex:none;min-height:70px;border-top:1px solid ${d.card_border};padding:12px 16px;display:flex;justify-content:space-between;align-items:center;background:#0d1419}.drawer-actions>div{display:flex;gap:8px}.recipe-list{padding:14px}.recipe-choice{width:100%;border:1px solid ${d.card_border};background:${d.card_background};border-radius:17px;padding:13px;margin-bottom:9px;display:flex;align-items:center;gap:12px;text-align:left;cursor:pointer}.recipe-choice span:nth-child(2){flex:1;display:flex;flex-direction:column;gap:4px}.recipe-choice small{color:${d.muted_color};font-size:12px;line-height:1.35}.field{display:block;margin-bottom:14px}.field>span{display:block;font-size:12px;color:#aeb7be;margin:0 0 6px 2px}.field input,.field select,.field textarea,.selector-fallback{width:100%;min-height:43px;border:1px solid ${d.card_border};background:#111a20;color:${d.text_color};border-radius:12px;padding:9px 11px;outline:none}.field input:focus,.field select:focus{border-color:${d.accent_color}}.field input[type=color]{padding:4px}.two{display:grid;grid-template-columns:1fr 1fr;gap:10px}.three{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}.check{min-height:43px;border:1px solid ${d.card_border};background:#111a20;border-radius:12px;padding:9px 11px;display:flex;align-items:center;gap:9px;margin-bottom:14px;font-size:12px;color:#d9dfe3}.check input{width:18px;height:18px}.number-wrap{display:flex;align-items:center;gap:8px}.number-wrap input{flex:1;min-width:0}.number-wrap small{font-size:11px;color:${d.muted_color};white-space:nowrap}.selector-host{min-height:43px}.selector-host ha-selector{display:block;width:100%}.selector-fallback{display:none;margin-top:6px}.selector-host:empty + .selector-fallback{display:block}.help{font-size:11px;color:${d.muted_color};line-height:1.4;margin:-6px 2px 14px}.help code,.recommended code{color:#b9c5cd}.info-box{display:flex;gap:9px;border:1px solid color-mix(in srgb, ${d.accent_color} 28%, transparent);background:color-mix(in srgb, ${d.accent_color} 6%, transparent);border-radius:13px;padding:11px 12px;font-size:11px;color:#b8c1c8;line-height:1.45;margin:12px 0}.recommended{border:1px dashed ${d.card_border};border-radius:12px;padding:10px 11px;margin:-5px 0 14px;font-size:11px;color:${d.muted_color};display:flex;flex-direction:column;gap:4px}.tabs{flex:none;display:flex;gap:4px;padding:8px 10px;border-bottom:1px solid ${d.card_border};overflow:auto;background:#0d1419}.tab{border:0;background:transparent;color:${d.muted_color};border-radius:10px;padding:8px 10px;cursor:pointer;font-size:12px;white-space:nowrap}.tab.active{background:color-mix(in srgb, ${d.accent_color} 12%, transparent);color:${d.accent_color}}.settings-section-title{font-size:12px;font-weight:750;color:${d.text_color};margin:2px 0 12px;padding-top:4px}.nav-editor{border:1px solid ${d.card_border};border-radius:14px;padding:11px;margin-bottom:10px}.data-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px}.data-actions .danger{grid-column:1/-1}.json-preview{width:100%;height:320px;border:1px solid ${d.card_border};background:#080d11;color:#aeb7be;border-radius:13px;padding:10px;font-family:ui-monospace,monospace;font-size:10px}.diag{display:grid;grid-template-columns:1fr 1fr;gap:8px}.diag>div{border:1px solid ${d.card_border};border-radius:13px;background:${d.card_background};padding:11px}.diag span{display:block;color:${d.muted_color};font-size:10px}.diag b{display:block;margin-top:4px;font-size:13px}.toast{position:fixed;z-index:2000;left:50%;bottom:22px;transform:translateX(-50%);max-width:min(520px,calc(100% - 24px));padding:10px 14px;border-radius:12px;background:#182229;border:1px solid #33414a;box-shadow:0 10px 35px rgba(0,0,0,.35);font-size:12px}.toast.error{border-color:${d.unavailable_color || "#ef6461"};color:${d.unavailable_color || "#ef6461"}}
      @media(max-width:700px){.head-main{max-width:calc(100% - 105px)}.head-actions .btn span{display:none}.head-actions .btn{width:43px;padding:0}.align-center .head-main{position:static;transform:none;text-align:left;max-width:calc(100% - 105px)}.align-right .head-main{order:1;margin-left:0;text-align:left}.align-right .head-actions{order:2}.summary{align-items:flex-start}.drawer,.chooser{width:100%;border-left:0}.two,.three{grid-template-columns:1fr}.data-actions{grid-template-columns:1fr}.data-actions .danger{grid-column:auto}.diag{grid-template-columns:1fr 1fr}}
      @media(max-width:390px){.page{padding-left:max(${Math.min(panelPad,10)}px,env(safe-area-inset-left));padding-right:max(${Math.min(panelPad,10)}px,env(safe-area-inset-right))}.head-icon{width:44px;height:44px}.header{gap:8px}.head-main{gap:9px}.summary{flex-direction:column}.summary .btn{width:100%}.card-top{gap:9px}.recipe-icon{width:42px;height:42px}.card-actions{width:100%;justify-content:flex-end}.diag{grid-template-columns:1fr}}
    `;
  }

}

if (!customElements.get("smart-automations-panel")) customElements.define("smart-automations-panel", SmartAutomationsPanel);
