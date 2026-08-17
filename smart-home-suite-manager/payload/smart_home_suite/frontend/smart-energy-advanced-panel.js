/**
 * Smart Energy Advanced Panel V1.3.0
 * Mobile-first advanced electrical dashboard for Home Assistant.
 * No external JavaScript dependencies.
 */

const PANEL_VERSION = "1.3.0";
const BACKEND_DOMAIN = "smart_energy_advanced_panel";

const deepClone = (value) => JSON.parse(JSON.stringify(value));

function deepMerge(base, extra) {
  if (Array.isArray(base)) return Array.isArray(extra) ? deepClone(extra) : deepClone(base);
  if (!base || typeof base !== "object") return extra === undefined ? base : extra;
  const out = { ...base };
  if (!extra || typeof extra !== "object" || Array.isArray(extra)) return out;
  for (const [key, value] of Object.entries(extra)) {
    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      base[key] &&
      typeof base[key] === "object" &&
      !Array.isArray(base[key])
    ) {
      out[key] = deepMerge(base[key], value);
    } else {
      out[key] = deepClone(value);
    }
  }
  return out;
}

const DEFAULT_ACTIONS = () => ({
  tap: { action: "more-info", target: "" },
  hold: { action: "none", target: "" },
});

const DEFAULTS = {
  locale: "es-MX",
  demo_when_missing: true,
  show_demo_badge: true,

  header: {
    show: true,
    title: "Energía",
    subtitle: "Medición avanzada",
    icon: "mdi:lightning-bolt-circle",
    icon_color: "#35ddd5",
    title_color: "#f5f7fa",
    subtitle_color: "#89949f",
    title_size: 27,
    subtitle_size: 14,
    icon_size: 32,
    align: "left",
  },

  design: {
    background: "#080d11",
    background_secondary: "#0c1318",
    panel_max_width: 520,
    panel_padding: 12,
    section_gap: 17,
    card_gap: 10,
    font_family: "Roboto, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",

    card_background: "#11181e",
    card_border_color: "#26323a",
    card_border_width: 1,
    card_radius: 20,
    card_padding: 15,
    card_shadow: "0 10px 30px rgba(0,0,0,.18)",

    section_title_color: "#dfe6ea",
    section_subtitle_color: "#71808a",
    label_color: "#9aa6af",
    value_color: "#f5f7fa",
    unit_color: "#aeb7be",
    accent_color: "#35ddd5",
    track_color: "#223038",
  },

  navigation: {
    show: false,
    position: "top",
    columns: 3,
    gap: 8,
    button_height: 56,
    radius: 16,
    background: "#11181e",
    border_color: "#26323a",
    text_color: "#aeb7be",
    active_color: "#35ddd5",
    icon_size: 23,
    font_size: 11,
    show_labels: true,
    buttons: [
      { show: true, label: "Resumen", icon: "mdi:home-lightning-bolt", path: "/smart-home", color: "#35ddd5" },
      { show: true, label: "Avanzado", icon: "mdi:lightning-bolt-circle", path: "/energy-advanced", color: "#35ddd5" },
    ],
  },

  native_power_graph: {
    show: true,
    title: "Fuentes de energía",
    show_legend: true,
    // "native" conserva exactamente el fondo que decida Home Assistant.
    // "panel" hereda el Fondo tarjetas del custom panel.
    // "custom" usa background_color.
    background_mode: "native",
    background_color: "#11181e",
  },

  sections: [
    {
      id: "realtime",
      show: true,
      title: "Tiempo real",
      subtitle: "Lecturas eléctricas instantáneas",
      icon: "mdi:flash",
      color: "#35ddd5",
    },
    {
      id: "energy",
      show: true,
      title: "Energía facturada",
      subtitle: "Acumulados calculados para el ciclo",
      icon: "mdi:counter",
      color: "#65c8ff",
    },
    {
      id: "costs",
      show: true,
      title: "Costos",
      subtitle: "Estimación económica del consumo",
      icon: "mdi:cash-multiple",
      color: "#77d898",
    },
    {
      id: "reference",
      show: true,
      title: "Referencias",
      subtitle: "Espacio para futuros datos del medidor",
      icon: "mdi:chart-box-outline",
      color: "#b59cff",
    },
  ],

  widgets: [
    {
      id: "voltage_f1",
      section: "realtime",
      show: true,
      entity: "sensor.power_record_01_fase_1_voltage",
      label: "Voltaje Fase 1",
      icon: "mdi:sine-wave",
      category: "voltage",
      kind: "bar",
      span: 2,
      unit: "auto",
      prefix: "",
      decimals: 1,
      multiplier: 1,
      offset: 0,
      demo_value: 126.0,
      min: 105,
      max: 135,
      color: "#65c8ff",
      value_size: 28,
      actions: DEFAULT_ACTIONS(),
    },
    {
      id: "current_f1",
      section: "realtime",
      show: true,
      entity: "sensor.power_record_03_fase_1_corriente",
      label: "Corriente Fase 1",
      icon: "mdi:current-ac",
      category: "current",
      kind: "metric",
      span: 1,
      unit: "auto",
      prefix: "",
      decimals: 2,
      multiplier: 1,
      offset: 0,
      demo_value: 8.42,
      min: 0,
      max: 60,
      color: "#57d7cd",
      value_size: 25,
      actions: DEFAULT_ACTIONS(),
    },
    {
      id: "current_f2",
      section: "realtime",
      show: true,
      entity: "sensor.power_record_04_fase_2_corriente",
      label: "Corriente Fase 2",
      icon: "mdi:current-ac",
      category: "current",
      kind: "metric",
      span: 1,
      unit: "auto",
      prefix: "",
      decimals: 2,
      multiplier: 1,
      offset: 0,
      demo_value: 6.18,
      min: 0,
      max: 60,
      color: "#57d7cd",
      value_size: 25,
      actions: DEFAULT_ACTIONS(),
    },
    {
      id: "current_total",
      section: "realtime",
      show: true,
      entity: "sensor.power_record_05_corriente_total",
      label: "Corriente total",
      icon: "mdi:transmission-tower",
      category: "current",
      kind: "bar",
      span: 2,
      unit: "auto",
      prefix: "",
      decimals: 2,
      multiplier: 1,
      offset: 0,
      demo_value: 14.60,
      min: 0,
      max: 100,
      color: "#35ddd5",
      value_size: 27,
      actions: DEFAULT_ACTIONS(),
    },
    {
      id: "power_f1",
      section: "realtime",
      show: true,
      entity: "sensor.power_record_06_fase_1_potencia",
      label: "Potencia Fase 1",
      icon: "mdi:flash-outline",
      category: "power",
      kind: "metric",
      span: 1,
      unit: "auto",
      prefix: "",
      decimals: 0,
      multiplier: 1,
      offset: 0,
      demo_value: 1048,
      min: 0,
      max: 6000,
      color: "#f4c95d",
      value_size: 25,
      actions: DEFAULT_ACTIONS(),
    },
    {
      id: "power_f2",
      section: "realtime",
      show: true,
      entity: "sensor.power_record_07_fase_2_potencia",
      label: "Potencia Fase 2",
      icon: "mdi:flash-outline",
      category: "power",
      kind: "metric",
      span: 1,
      unit: "auto",
      prefix: "",
      decimals: 0,
      multiplier: 1,
      offset: 0,
      demo_value: 762,
      min: 0,
      max: 6000,
      color: "#f4c95d",
      value_size: 25,
      actions: DEFAULT_ACTIONS(),
    },
    {
      id: "power_total",
      section: "realtime",
      show: true,
      entity: "sensor.power_record_08_potencia_total",
      label: "Potencia total",
      icon: "mdi:lightning-bolt",
      category: "power",
      kind: "hero",
      span: 2,
      unit: "auto",
      prefix: "",
      decimals: 0,
      multiplier: 1,
      offset: 0,
      demo_value: 1810,
      min: 0,
      max: 10000,
      color: "#f5a623",
      value_size: 42,
      actions: DEFAULT_ACTIONS(),
    },
    {
      id: "energy_day",
      section: "energy",
      show: true,
      entity: "sensor.power_record_ciclo_kwh_diario_facturado",
      label: "kWh del día",
      icon: "mdi:calendar-today",
      category: "energy",
      kind: "metric",
      span: 1,
      unit: "auto",
      prefix: "",
      decimals: 2,
      multiplier: 1,
      offset: 0,
      demo_value: 13.84,
      min: 0,
      max: 80,
      color: "#65c8ff",
      value_size: 25,
      actions: DEFAULT_ACTIONS(),
    },
    {
      id: "energy_month",
      section: "energy",
      show: true,
      entity: "sensor.power_record_ciclo_kwh_mes_facturado",
      label: "kWh del mes",
      icon: "mdi:calendar-month",
      category: "energy",
      kind: "metric",
      span: 1,
      unit: "auto",
      prefix: "",
      decimals: 2,
      multiplier: 1,
      offset: 0,
      demo_value: 324.27,
      min: 0,
      max: 1200,
      color: "#65c8ff",
      value_size: 25,
      actions: DEFAULT_ACTIONS(),
    },
    {
      id: "cost_day",
      section: "costs",
      show: true,
      entity: "sensor.medidor_de_consumo_electrico_costo_del_dia",
      label: "Costo del día",
      icon: "mdi:cash-clock",
      category: "cost",
      kind: "metric",
      span: 2,
      unit: "auto",
      prefix: "$",
      decimals: 2,
      multiplier: 1,
      offset: 0,
      demo_value: 42.67,
      min: 0,
      max: 300,
      color: "#77d898",
      value_size: 28,
      actions: DEFAULT_ACTIONS(),
    },
    {
      id: "cost_month",
      section: "costs",
      show: true,
      entity: "sensor.medidor_de_consumo_electrico_costo_acumulado_del_mes",
      label: "Costo acumulado del mes",
      icon: "mdi:cash-multiple",
      category: "cost",
      kind: "hero",
      span: 2,
      unit: "auto",
      prefix: "$",
      decimals: 2,
      multiplier: 1,
      offset: 0,
      demo_value: 1284.50,
      min: 0,
      max: 5000,
      color: "#77d898",
      value_size: 40,
      actions: DEFAULT_ACTIONS(),
    },
  ],
};

class SmartEnergyAdvancedPanel extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    this._hass = null;
    this._panel = null;
    this._narrow = false;
    this._storedConfig = {};
    this._editConfig = null;
    this._loaded = false;
    this._loading = false;
    this._backendOk = true;
    this._editorOpen = false;
    this._editorTab = "general";
    this._renderQueued = false;
    this._lastSignature = "";
    this._toastMessage = "";
    this._toastType = "ok";
    this._toastTimer = null;

    this._picker = null;
    this._pickerSearch = "";
    this._pickerMode = "recommended";

    // Selector MDI nativo. El campo de texto manual siempre permanece
    // disponible como fallback para que esta mejora sea fail-open.
    this._iconPicker = null;

    this._pointer = null;
    this._suppressClickUntil = 0;

    // Tarjeta nativa de Home Assistant. Se mantiene en el light DOM y se
    // proyecta mediante <slot> para que los renders frecuentes del panel no
    // destruyan/recreen la gráfica ni sus suscripciones de Energy.
    this._powerGraphCard = null;
    this._powerGraphLoading = null;
    this._powerGraphConfigSignature = "";
    this._powerGraphError = "";

    this.shadowRoot.addEventListener("click", (ev) => this._onClick(ev));
    this.shadowRoot.addEventListener("change", (ev) => this._onChange(ev));
    this.shadowRoot.addEventListener("input", (ev) => this._onInput(ev));
    this.shadowRoot.addEventListener("pointerdown", (ev) => this._onPointerDown(ev));
    this.shadowRoot.addEventListener("pointermove", (ev) => this._onPointerMove(ev));
    this.shadowRoot.addEventListener("pointerup", (ev) => this._onPointerUp(ev));
    this.shadowRoot.addEventListener("pointercancel", () => this._cancelPointer());
  }

  set hass(value) {
    this._hass = value;
    if (this._powerGraphCard) this._powerGraphCard.hass = value;
    if (!this._loaded && !this._loading) this._loadConfig();

    // Igual que el panel resumen: los estados siguen llegando, pero con el
    // editor abierto NO reconstruimos la interfaz. Así el scroll y el foco
    // permanecen estables mientras el medidor actualiza cada pocos segundos.
    if (!this._editorOpen) this._queueRender();
  }

  get hass() { return this._hass; }

  set panel(value) {
    this._panel = value;
    this._queueRender();
  }

  get panel() { return this._panel; }

  set narrow(value) {
    this._narrow = Boolean(value);
    if (!this._editorOpen) this._queueRender();
  }

  get narrow() { return this._narrow; }

  connectedCallback() {
    if (this._hass && !this._loaded && !this._loading) this._loadConfig();
    this._queueRender();
  }

  async _loadConfig() {
    if (!this._hass || this._loading || this._loaded) return;
    this._loading = true;
    try {
      const result = await this._hass.callWS({ type: `${BACKEND_DOMAIN}/config/get` });
      this._storedConfig = result?.config || {};
      this._backendOk = true;
    } catch (err) {
      console.error("Smart Energy Advanced Panel: backend no disponible", err);
      this._storedConfig = {};
      this._backendOk = false;
    } finally {
      this._loaded = true;
      this._loading = false;

      try {
        const params = new URLSearchParams(window.location.search);
        if (
          this._hass?.user?.is_admin &&
          (params.get("settings") === "1" || params.get("configure") === "1")
        ) {
          this._editConfig = deepClone(this._config());
          this._editorOpen = true;
          this._editorTab = "general";
        }
      } catch (_) {}

      this._lastSignature = "";
      this._queueRender();
    }
  }

  _config() {
    const source = this._editorOpen && this._editConfig ? this._editConfig : this._storedConfig;
    const cfg = deepMerge(DEFAULTS, source || {});

    // Completa acciones faltantes en configuraciones importadas antiguas.
    cfg.widgets = (cfg.widgets || []).map((w) => ({
      ...w,
      actions: deepMerge(DEFAULT_ACTIONS(), w.actions || {}),
    }));
    return cfg;
  }

  _queueRender(preserveEditor = false) {
    if (!this.isConnected || this._renderQueued) return;
    const snapshot = preserveEditor ? this._captureEditorState() : null;
    this._renderQueued = true;
    requestAnimationFrame(() => {
      this._renderQueued = false;
      this._render();
      if (snapshot) this._restoreEditorState(snapshot);
    });
  }

  _captureEditorState() {
    const body = this.shadowRoot?.querySelector(".editor-body");
    const active = this.shadowRoot?.activeElement;
    const dataSetting = active?.dataset?.setting || null;
    const id = active?.id || null;
    let selection = null;
    try {
      if (typeof active?.selectionStart === "number") {
        selection = [active.selectionStart, active.selectionEnd];
      }
    } catch (_) {}
    return {
      scrollTop: body?.scrollTop || 0,
      dataSetting,
      id,
      selection,
    };
  }

  _restoreEditorState(snapshot) {
    requestAnimationFrame(() => {
      const body = this.shadowRoot?.querySelector(".editor-body");
      if (body) body.scrollTop = snapshot.scrollTop || 0;
      let el = null;
      if (snapshot.dataSetting) {
        el = [...this.shadowRoot.querySelectorAll("[data-setting]")]
          .find((item) => item.dataset.setting === snapshot.dataSetting);
      }
      if (!el && snapshot.id) el = this.shadowRoot.getElementById(snapshot.id);
      if (el) {
        try {
          el.focus({ preventScroll: true });
          if (snapshot.selection && typeof el.setSelectionRange === "function") {
            el.setSelectionRange(snapshot.selection[0], snapshot.selection[1]);
          }
        } catch (_) {}
      }
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

  _cssSize(value, fallback = "") {
    if (value === "" || value === null || value === undefined) return fallback;
    if (typeof value === "number") return `${value}px`;
    return String(value);
  }

  _num(value, fallback = 0) {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  }

  _clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
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
      if (cursor[part] === undefined || cursor[part] === null) {
        cursor[part] = /^\d+$/.test(next) ? [] : {};
      }
      cursor = cursor[part];
    }
    cursor[parts.at(-1)] = value;
  }

  _entityData(widget, cfg) {
    const stateObj = widget.entity ? this._hass?.states?.[widget.entity] : null;
    if (!stateObj && cfg.demo_when_missing && widget.demo_value !== undefined) {
      return { raw: widget.demo_value, stateObj: null, isDemo: true, missing: false };
    }
    if (!stateObj) {
      return {
        raw: "Entidad no encontrada",
        stateObj: null,
        isDemo: false,
        missing: true,
      };
    }
    return {
      raw: stateObj.state,
      stateObj,
      isDemo: false,
      missing: false,
    };
  }

  _numeric(raw, widget) {
    const n = Number.parseFloat(String(raw).replace(",", "."));
    if (!Number.isFinite(n)) return null;
    return n * this._num(widget.multiplier, 1) + this._num(widget.offset, 0);
  }

  _formatNumber(value, decimals, locale) {
    if (!Number.isFinite(value)) return "—";
    const d = this._clamp(Math.round(this._num(decimals, 0)), 0, 6);
    try {
      return new Intl.NumberFormat(locale || "es-MX", {
        minimumFractionDigits: d,
        maximumFractionDigits: d,
      }).format(value);
    } catch (_) {
      return value.toFixed(d);
    }
  }

  _displayValue(data, widget, cfg) {
    if (data.missing) return "No disponible";
    const numeric = this._numeric(data.raw, widget);
    if (numeric !== null) return this._formatNumber(numeric, widget.decimals, cfg.locale);
    return String(data.raw ?? "—");
  }

  _unit(data, widget) {
    if (widget.unit === "auto") return data.stateObj?.attributes?.unit_of_measurement || "";
    return widget.unit || "";
  }

  _icon(icon, size = 24, color = "currentColor") {
    if (!icon) return "";
    return `<ha-icon icon="${this._escape(icon)}" style="--mdc-icon-size:${this._cssSize(size, "24px")};color:${this._escape(color)}"></ha-icon>`;
  }

  _hasDemo(cfg) {
    return (cfg.widgets || []).some(
      (w) => w.show && cfg.demo_when_missing && !this._hass?.states?.[w.entity] && w.demo_value !== undefined
    );
  }

  _signature(cfg) {
    const ids = (cfg.widgets || []).filter((w) => w.show && w.entity).map((w) => w.entity);
    const states = ids.map((id) => {
      const s = this._hass?.states?.[id];
      return [id, s?.state ?? null, s?.attributes?.unit_of_measurement ?? null];
    });
    return JSON.stringify([
      this._narrow,
      this._storedConfig,
      states,
      this._backendOk,
    ]);
  }

  _barRatio(widget, numeric) {
    const min = this._num(widget.min, 0);
    const max = Math.max(min + 0.000001, this._num(widget.max, min + 1));
    if (!Number.isFinite(numeric)) return 0;
    return this._clamp((numeric - min) / (max - min), 0, 1);
  }

  _widgetCard(widget, cfg) {
    if (!widget?.show) return "";
    const data = this._entityData(widget, cfg);
    const value = this._displayValue(data, widget, cfg);
    const unit = this._unit(data, widget);
    const numeric = data.missing ? null : this._numeric(data.raw, widget);
    const ratio = this._barRatio(widget, numeric);
    const kind = ["metric", "bar", "hero"].includes(widget.kind) ? widget.kind : "metric";
    const span = Number(widget.span) === 2 ? 2 : 1;
    const color = widget.color || cfg.design.accent_color;
    const interactive = this._widgetHasAnyAction(widget);

    return `
      <section
        class="metric-card kind-${kind} span-${span} ${data.missing ? "missing" : ""} ${interactive ? "interactive" : ""}"
        data-widget-id="${this._escape(widget.id)}"
        tabindex="${interactive ? "0" : "-1"}"
        role="${interactive ? "button" : "group"}"
        aria-label="${this._escape(widget.label || widget.entity || "Dato eléctrico")}"
        style="--widget-color:${this._escape(color)};--widget-value-size:${this._cssSize(widget.value_size, kind === "hero" ? "40px" : "25px")}"
      >
        <div class="card-top">
          <div class="metric-icon">${this._icon(widget.icon, kind === "hero" ? 27 : 23, color)}</div>
          <div class="metric-label">${this._escape(widget.label || "")}</div>
          ${data.isDemo ? `<span class="mini-demo">demo</span>` : ""}
        </div>

        <div class="metric-value-line">
          ${widget.prefix ? `<span class="metric-prefix">${this._escape(widget.prefix)}</span>` : ""}
          <span class="metric-value">${this._escape(value)}</span>
          ${unit ? `<span class="metric-unit">${this._escape(unit)}</span>` : ""}
        </div>

        ${kind === "bar" || kind === "hero" ? `
          <div class="bar-wrap" aria-hidden="true">
            <div class="bar-track"><div class="bar-fill" style="width:${(ratio * 100).toFixed(1)}%"></div></div>
            <div class="bar-scale">
              <span>${this._escape(this._formatNumber(this._num(widget.min, 0), widget.decimals > 1 ? 0 : widget.decimals, cfg.locale))}</span>
              <span>${this._escape(this._formatNumber(this._num(widget.max, 1), widget.decimals > 1 ? 0 : widget.decimals, cfg.locale))}${unit ? ` ${this._escape(unit)}` : ""}</span>
            </div>
          </div>
        ` : ""}

        ${data.missing && widget.entity ? `<div class="missing-id">${this._escape(widget.entity)}</div>` : ""}
      </section>
    `;
  }

  _widgetHasAnyAction(widget) {
    const a = widget.actions || {};
    return (a.tap?.action && a.tap.action !== "none") || (a.hold?.action && a.hold.action !== "none");
  }

  _sectionBlock(section, cfg) {
    if (!section?.show) return "";
    const widgets = (cfg.widgets || []).filter((w) => w.show && w.section === section.id);
    if (!widgets.length) return "";

    return `
      <section class="data-section">
        <div class="section-heading">
          <div class="section-icon">${this._icon(section.icon, 21, section.color || cfg.design.accent_color)}</div>
          <div>
            <div class="section-title">${this._escape(section.title || "")}</div>
            ${section.subtitle ? `<div class="section-subtitle">${this._escape(section.subtitle)}</div>` : ""}
          </div>
        </div>
        <div class="metric-grid">
          ${widgets.map((w) => this._widgetCard(w, cfg)).join("")}
        </div>
      </section>
    `;
  }

  _nativePowerGraphSlot(cfg) {
    const graph = cfg.native_power_graph;
    if (!graph?.show) return "";

    const fallback = this._powerGraphError
      ? `<div class="native-graph-status error">Gráfico nativo no disponible · ${this._escape(this._powerGraphError)}</div>`
      : `<div class="native-graph-status">Cargando gráfico de fuentes de energía…</div>`;

    return `
      <section class="native-power-graph-section" aria-label="Gráfico de fuentes de energía">
        <slot name="native-power-sources-graph">${fallback}</slot>
      </section>
    `;
  }

  _nativePowerGraphConfig(cfg) {
    const graph = cfg.native_power_graph || {};
    // No usamos collection_key ni manipulamos internals. Sin selector de fecha,
    // la tarjeta nativa usa el día actual, igual que en el panel de Energía.
    return {
      type: "power-sources-graph",
      title: graph.title || undefined,
      show_legend: graph.show_legend !== false,
    };
  }

  _applyNativePowerGraphAppearance(card, cfg) {
    if (!card) return;
    const graph = cfg.native_power_graph || {};
    const mode = graph.background_mode || "native";

    // Únicamente usamos variables de tema heredables que el ha-card nativo ya
    // consume. No consultamos ni modificamos el shadowRoot de power-sources-graph.
    if (mode === "native") {
      card.style.removeProperty("--ha-card-background");
      card.style.removeProperty("--card-background-color");
      return;
    }

    const background = mode === "custom"
      ? (graph.background_color || cfg.design?.card_background || "#11181e")
      : (cfg.design?.card_background || graph.background_color || "#11181e");

    card.style.setProperty("--ha-card-background", background);
    card.style.setProperty("--card-background-color", background);
  }

  async _syncNativePowerGraph(cfg) {
    const graph = cfg.native_power_graph || {};

    if (!graph.show) {
      if (this._powerGraphCard) {
        try { this._powerGraphCard.remove(); } catch (_) {}
        this._powerGraphCard = null;
      }
      this._powerGraphLoading = null;
      this._powerGraphConfigSignature = "";
      this._powerGraphError = "";
      return;
    }

    const cardConfig = this._nativePowerGraphConfig(cfg);
    const signature = JSON.stringify(cardConfig);

    if (this._powerGraphCard) {
      this._powerGraphCard.hass = this._hass;
      this._applyNativePowerGraphAppearance(this._powerGraphCard, cfg);
      if (signature !== this._powerGraphConfigSignature) {
        try {
          this._powerGraphCard.setConfig(cardConfig);
          this._powerGraphConfigSignature = signature;
          this._powerGraphError = "";
        } catch (err) {
          console.error("Smart Energy Advanced Panel: error configurando power-sources-graph", err);
          this._powerGraphError = err?.message || String(err);
        }
      }
      return;
    }

    if (this._powerGraphLoading) return this._powerGraphLoading;

    this._powerGraphLoading = (async () => {
      try {
        let card;
        const nativeTag = "hui-power-sources-graph-card";

        // Si el Energy Dashboard ya cargó la clase, podemos usarla directamente.
        if (customElements.get(nativeTag)) {
          card = document.createElement(nativeTag);
          card.setConfig(cardConfig);
        } else {
          // Ruta normal: pedir a Home Assistant sus helpers para crear/lazy-load
          // la misma tarjeta que usaría Lovelace, sin importar su módulo interno.
          if (typeof window.loadCardHelpers !== "function") {
            throw new Error("No se pudo solicitar la tarjeta nativa a Home Assistant");
          }
          const helpers = await window.loadCardHelpers();
          if (!helpers?.createCardElement) {
            throw new Error("El creador de tarjetas nativas no está disponible");
          }
          card = helpers.createCardElement(cardConfig);
        }

        if (card?.tagName?.toLowerCase() !== nativeTag) {
          throw new Error("power-sources-graph no está disponible en esta versión de Home Assistant");
        }

        card.slot = "native-power-sources-graph";
        card.classList.add("native-power-sources-graph-card");
        card.style.display = "block";
        card.style.width = "100%";
        card.style.minWidth = "0";
        card.hass = this._hass;
        this._applyNativePowerGraphAppearance(card, cfg);

        // Light DOM deliberado: el shadowRoot se reconstruye al actualizar
        // métricas; el card permanece conectado y solo cambia el <slot> receptor.
        this.appendChild(card);
        this._powerGraphCard = card;
        this._powerGraphConfigSignature = signature;
        this._powerGraphError = "";
      } catch (err) {
        console.error("Smart Energy Advanced Panel: no se pudo cargar power-sources-graph", err);
        this._powerGraphError = err?.message || String(err);
        this._lastSignature = "";
        this._queueRender();
      } finally {
        this._powerGraphLoading = null;
      }
    })();

    return this._powerGraphLoading;
  }

  _navigation(cfg) {
    const n = cfg.navigation;
    if (!n?.show) return "";
    const buttons = (n.buttons || []).filter((b) => b.show);
    if (!buttons.length) return "";
    const current = window.location.pathname;

    return `
      <nav class="nav-grid" style="--nav-cols:${Math.max(1, this._num(n.columns, 3))};--nav-gap:${this._cssSize(n.gap, "8px")};--nav-h:${this._cssSize(n.button_height, "56px")};--nav-radius:${this._cssSize(n.radius, "16px")};--nav-bg:${this._escape(n.background)};--nav-border:${this._escape(n.border_color)};--nav-text:${this._escape(n.text_color)};--nav-active:${this._escape(n.active_color)};--nav-font:${this._cssSize(n.font_size, "11px")}">
        ${buttons.map((b) => {
          const active = b.path && current.startsWith(String(b.path).split("?")[0]);
          return `<button class="nav-button ${active ? "active" : ""}" data-nav-path="${this._escape(b.path || "/")}" title="${this._escape(b.label || "")}">
            ${this._icon(b.icon, n.icon_size, b.color || (active ? n.active_color : n.text_color))}
            ${n.show_labels ? `<span>${this._escape(b.label || "")}</span>` : ""}
          </button>`;
        }).join("")}
      </nav>
    `;
  }

  _header(cfg) {
    const h = cfg.header;
    const settingsButton = this._hass?.user?.is_admin
      ? `<button class="settings-button" data-action="open-editor" title="Personalización" aria-label="Abrir Personalización">${this._icon("mdi:cog", 25, cfg.design.label_color)}</button>`
      : "";

    if (!h?.show) {
      return settingsButton ? `<div class="panel-admin-tools">${settingsButton}</div>` : "";
    }

    return `
      <header class="panel-header align-${this._escape(h.align || "left")}">
        <div class="header-main">
          <div class="header-icon">${this._icon(h.icon, h.icon_size, h.icon_color)}</div>
          <div class="header-copy">
            <div class="header-title" style="color:${this._escape(h.title_color)};font-size:${this._cssSize(h.title_size)}">${this._escape(h.title)}</div>
            <div class="header-subtitle" style="color:${this._escape(h.subtitle_color)};font-size:${this._cssSize(h.subtitle_size)}">${this._escape(h.subtitle)}</div>
          </div>
        </div>
        ${settingsButton}
      </header>
    `;
  }

  _render() {
    if (!this.shadowRoot) return;
    if (!this._hass || !this._panel || !this._loaded) {
      this.shadowRoot.innerHTML = `
        <style>:host{display:block;min-height:100vh;background:#080d11;color:#fff;font-family:system-ui,sans-serif}.loading{padding:30px;text-align:center;opacity:.7}</style>
        <div class="loading">Cargando energía avanzada…</div>`;
      return;
    }

    const cfg = this._config();
    const sig = this._signature(cfg);
    if (!this._editorOpen && sig === this._lastSignature) return;
    this._lastSignature = sig;

    const navTop = cfg.navigation?.show && cfg.navigation.position === "top";
    const navBottom = cfg.navigation?.show && cfg.navigation.position === "bottom";

    this.shadowRoot.innerHTML = `
      <style>${this._styles(cfg)}</style>
      <main class="page">
        ${this._header(cfg)}
        ${!this._backendOk ? `<div class="warning-badge">Backend no disponible · revisa smart_energy_advanced_panel</div>` : ""}
        ${cfg.show_demo_badge && this._hasDemo(cfg) ? `<div class="demo-badge">Modo demo · selecciona entidades reales en Personalización</div>` : ""}
        ${navTop ? this._navigation(cfg) : ""}
        <div class="sections">
          ${(cfg.sections || []).map((s) => `${this._sectionBlock(s, cfg)}${s.id === "realtime" ? this._nativePowerGraphSlot(cfg) : ""}`).join("")}
          ${!(cfg.sections || []).some((s) => s.id === "realtime") ? this._nativePowerGraphSlot(cfg) : ""}
        </div>
        ${navBottom ? this._navigation(cfg) : ""}
        <div class="version">v${PANEL_VERSION}</div>
      </main>
      ${this._editorOpen ? this._editor(cfg) : ""}
      ${this._picker ? this._entityPicker(cfg) : ""}
      ${this._iconPicker ? this._iconPickerDialog() : ""}
      ${this._toastMessage ? `<div class="toast ${this._toastType}">${this._escape(this._toastMessage)}</div>` : ""}
    `;

    // La gráfica nativa se sincroniza después del render. El elemento real no
    // vive dentro de shadowRoot, por lo que no se recrea con cada lectura.
    this._syncNativePowerGraph(cfg);

    // El selector visual se monta como componente nativo de Home Assistant
    // solamente cuando el usuario lo solicita. Si HA no lo expone, el input
    // manual mdi:... sigue siendo plenamente utilizable.
    this._mountNativeIconPicker();
  }

  _styles(cfg) {
    const d = cfg.design;
    return `
      :host{
        display:block;min-height:100vh;min-height:100dvh;box-sizing:border-box;
        background:radial-gradient(circle at 50% -18%,${d.background_secondary} 0%,transparent 42%),${d.background};
        color:${d.value_color};font-family:${d.font_family};-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility
      }
      *{box-sizing:border-box}
      button,input,select,textarea{font:inherit}
      button{touch-action:manipulation}
      .page{
        width:100%;min-height:100vh;min-height:100dvh;max-width:${this._cssSize(d.panel_max_width,"520px")};
        margin:0 auto;
        padding:max(${this._cssSize(d.panel_padding,"12px")},env(safe-area-inset-top))
                max(${this._cssSize(d.panel_padding,"12px")},env(safe-area-inset-right))
                max(${this._cssSize(d.panel_padding,"12px")},env(safe-area-inset-bottom))
                max(${this._cssSize(d.panel_padding,"12px")},env(safe-area-inset-left))
      }

      .panel-header{min-height:76px;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:3px 3px 13px;position:relative}
      .header-main{display:flex;align-items:center;gap:12px;min-width:0;max-width:calc(100% - 56px)}
      .header-copy{min-width:0}
      .header-title{font-weight:730;line-height:1.08;letter-spacing:-.035em}
      .header-subtitle{margin-top:4px;font-weight:500}
      .header-icon{width:47px;height:47px;display:grid;place-items:center;border:1px solid color-mix(in srgb,${d.accent_color} 24%,transparent);background:color-mix(in srgb,${d.accent_color} 8%,transparent);border-radius:15px;flex:0 0 auto}
      .panel-header.align-left .header-main{text-align:left;margin-right:auto}
      .panel-header.align-center{justify-content:center}
      .panel-header.align-center .header-main{position:absolute;left:50%;transform:translateX(-50%);text-align:center;max-width:calc(100% - 112px)}
      .panel-header.align-center .settings-button{position:absolute;right:0}
      .panel-header.align-right .header-main{margin-left:auto;text-align:right;flex-direction:row-reverse}
      .settings-button{width:44px;height:44px;border:1px solid ${d.card_border_color};border-radius:14px;background:${d.card_background};display:grid;place-items:center;cursor:pointer}
      .panel-admin-tools{display:flex;justify-content:flex-end;padding:4px 0 10px}

      .warning-badge,.demo-badge{padding:10px 12px;border-radius:14px;font-size:11px;line-height:1.35;margin-bottom:12px}
      .warning-badge{color:#ff9d9a;background:rgba(239,100,97,.09);border:1px solid rgba(239,100,97,.25)}
      .demo-badge{color:#f5be63;background:rgba(245,166,35,.08);border:1px solid rgba(245,166,35,.22)}

      .sections{display:grid;gap:${this._cssSize(d.section_gap,"17px")}}
      .data-section{min-width:0}
      .native-power-graph-section{display:block;min-width:0;width:100%}
      .native-power-graph-section slot{display:block;min-width:0;width:100%}
      ::slotted(.native-power-sources-graph-card){display:block!important;width:100%!important;min-width:0!important}
      .native-graph-status{display:grid;place-items:center;min-height:180px;padding:20px;border:1px solid ${d.card_border_color};border-radius:${this._cssSize(d.card_radius,"20px")};background:${d.card_background};color:${d.label_color};font-size:11px;text-align:center}
      .native-graph-status.error{color:#f49b98;border-color:#713c3a}
      .section-heading{display:flex;align-items:center;gap:9px;padding:0 3px 9px}
      .section-icon{width:31px;height:31px;border-radius:10px;display:grid;place-items:center;background:rgba(255,255,255,.035)}
      .section-title{color:${d.section_title_color};font-size:14px;font-weight:720;line-height:1.15}
      .section-subtitle{color:${d.section_subtitle_color};font-size:10.5px;margin-top:3px;line-height:1.25}

      .metric-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:${this._cssSize(d.card_gap,"10px")}}
      .metric-card{
        min-width:0;position:relative;padding:${this._cssSize(d.card_padding,"15px")};
        background:${d.card_background};border:${this._cssSize(d.card_border_width,"1px")} solid ${d.card_border_color};
        border-radius:${this._cssSize(d.card_radius,"20px")};box-shadow:${d.card_shadow};
        overflow:hidden;outline:none;user-select:none;-webkit-tap-highlight-color:transparent
      }
      .metric-card.span-2{grid-column:1/-1}
      .metric-card.interactive{cursor:pointer}
      .metric-card.interactive:focus-visible{box-shadow:0 0 0 2px color-mix(in srgb,var(--widget-color) 55%,transparent),${d.card_shadow}}
      .metric-card.interactive:active{transform:scale(.992)}
      .metric-card.missing{border-color:rgba(239,100,97,.38)}
      .kind-hero{padding-top:17px;padding-bottom:16px;background:linear-gradient(145deg,color-mix(in srgb,var(--widget-color) 8%,${d.card_background}),${d.card_background} 58%)}

      .card-top{display:flex;align-items:center;gap:8px;min-width:0}
      .metric-icon{width:34px;height:34px;min-width:34px;border-radius:11px;display:grid;place-items:center;background:color-mix(in srgb,var(--widget-color) 9%,transparent)}
      .metric-label{min-width:0;flex:1;color:${d.label_color};font-size:12px;font-weight:620;line-height:1.2;overflow-wrap:anywhere}
      .mini-demo{font-size:8px;text-transform:uppercase;letter-spacing:.06em;color:#dba750;border:1px solid rgba(245,166,35,.22);border-radius:7px;padding:2px 4px}

      .metric-value-line{display:flex;align-items:baseline;gap:4px;min-width:0;margin-top:13px;flex-wrap:wrap}
      .metric-value,.metric-prefix{color:${d.value_color};font-size:var(--widget-value-size);font-weight:690;line-height:.98;letter-spacing:-.035em}
      .metric-unit{color:${d.unit_color};font-size:11px;font-weight:560}
      .kind-hero .metric-value,.kind-hero .metric-prefix{font-weight:730}
      .missing-id{margin-top:8px;color:#ef7876;font-size:9px;overflow-wrap:anywhere}

      .bar-wrap{margin-top:13px}
      .bar-track{height:7px;border-radius:999px;background:${d.track_color};overflow:hidden}
      .bar-fill{height:100%;border-radius:inherit;background:var(--widget-color);box-shadow:0 0 12px color-mix(in srgb,var(--widget-color) 30%,transparent);transition:width .28s ease}
      .bar-scale{display:flex;justify-content:space-between;gap:8px;color:#65737c;font-size:8.5px;margin-top:5px}

      .nav-grid{display:grid;grid-template-columns:repeat(var(--nav-cols),minmax(0,1fr));gap:var(--nav-gap);margin:0 0 ${this._cssSize(d.section_gap,"17px")}}
      .sections + .nav-grid{margin-top:${this._cssSize(d.section_gap,"17px")};margin-bottom:0}
      .nav-button{min-width:0;height:var(--nav-h);border:1px solid var(--nav-border);border-radius:var(--nav-radius);background:var(--nav-bg);color:var(--nav-text);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;cursor:pointer;font-size:var(--nav-font);font-weight:620}
      .nav-button.active{color:var(--nav-active);border-color:color-mix(in srgb,var(--nav-active) 38%,var(--nav-border))}
      .nav-button span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}

      .version{text-align:center;color:#50606a;font-size:9px;padding:14px 0 2px}

      .editor-backdrop{position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.72);display:flex;justify-content:flex-end}
      .editor{width:min(640px,100%);height:100%;background:#0b1116;color:#f5f7fa;border-left:1px solid #26323a;display:flex;flex-direction:column;box-shadow:-20px 0 60px rgba(0,0,0,.35)}
      .editor-top{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:14px 14px 10px;border-bottom:1px solid #202b32}
      .editor-title{font-size:19px;font-weight:720}
      .editor-actions{display:flex;gap:7px;flex-wrap:wrap;justify-content:flex-end}
      .editor-btn{min-height:38px;padding:0 12px;border-radius:12px;border:1px solid #2b3942;background:#111a20;color:#e8edf1;cursor:pointer}
      .editor-btn.primary{border-color:#247f7a;background:#123b3a;color:#55e6df}
      .editor-btn.danger{border-color:#703332;color:#ef8a87}
      .editor-tabs{display:flex;gap:5px;overflow:auto;padding:10px 12px;border-bottom:1px solid #202b32}
      .editor-tab{height:36px;white-space:nowrap;padding:0 12px;border:0;border-radius:11px;background:transparent;color:#8e9ba5;cursor:pointer}
      .editor-tab.active{background:#122126;color:#42ddd5}
      .editor-body{flex:1;overflow:auto;padding:14px;overscroll-behavior:contain}
      .edit-section{border:1px solid #26323a;border-radius:16px;background:#0f171c;margin-bottom:12px;overflow:hidden}
      .edit-section-title{font-size:14px;font-weight:700;padding:13px 14px;border-bottom:1px solid #202b32}
      .edit-section-content{padding:13px;display:grid;gap:12px}
      .field-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:11px}
      .field{display:grid;gap:6px;min-width:0}
      .field.full{grid-column:1/-1}
      .field label{font-size:11px;color:#8d9aa4;font-weight:650}
      .control{width:100%;height:39px;border-radius:11px;border:1px solid #2a3740;background:#0a1014;color:#ecf1f4;padding:0 10px;outline:none}
      textarea.control{height:auto;min-height:260px;padding:10px;resize:vertical;font-family:ui-monospace,SFMono-Regular,Consolas,monospace;font-size:11px;line-height:1.45}
      .control:focus{border-color:#2aaea7}
      .control[type=color]{padding:4px;height:39px}
      .checkbox-row{display:flex;align-items:center;gap:9px;min-height:39px}
      .checkbox-row input{width:18px;height:18px}
      .help{font-size:10.5px;line-height:1.45;color:#71808a}
      .item-card{border:1px solid #26323a;border-radius:14px;background:#0a1115;padding:11px;display:grid;gap:11px}
      .item-head{display:flex;align-items:center;justify-content:space-between;gap:8px}
      .item-name{font-size:12px;font-weight:700;color:#dce4e8;overflow-wrap:anywhere}
      .tiny-btn{min-height:31px;padding:0 9px;border-radius:10px;border:1px solid #33424b;background:#111a20;color:#9aa8b0;cursor:pointer;font-size:10px}
      .entity-line{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:7px;align-items:end}
      .icon-field-line{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:7px;align-items:center}
      .icon-picker-button{white-space:nowrap}
      .entity-current{font-size:9.5px;color:#65737c;overflow-wrap:anywhere}
      .action-box{border-top:1px dashed #28353d;padding-top:10px;display:grid;gap:9px}
      .action-title{font-size:10.5px;color:#7f8c95;font-weight:700;text-transform:uppercase;letter-spacing:.04em}
      .nav-note{padding:9px 10px;border-radius:11px;background:rgba(53,221,213,.05);border:1px solid rgba(53,221,213,.15);color:#77cfc9;font-size:10px;line-height:1.4}
      .editor-bottom{padding:9px 14px 12px;border-top:1px solid #202b32;color:#65737c;font-size:9.5px;line-height:1.4}

      .picker-backdrop{position:fixed;inset:0;z-index:10020;background:rgba(0,0,0,.76);display:grid;place-items:center;padding:12px}
      .picker{width:min(560px,100%);height:min(760px,92dvh);background:#0b1116;border:1px solid #2a3740;border-radius:19px;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 26px 70px rgba(0,0,0,.45)}
      .picker-top{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:13px;border-bottom:1px solid #202b32}
      .picker-title{font-size:16px;font-weight:720}
      .picker-search{padding:11px 13px 0}
      .picker-search input{width:100%;height:42px;border:1px solid #2a3740;background:#081014;color:#eef2f4;border-radius:12px;padding:0 12px;outline:none}
      .picker-search input:focus{border-color:#2aaea7}
      .picker-modes{display:flex;gap:7px;padding:9px 13px}
      .picker-mode{height:33px;border-radius:10px;border:1px solid #2a3740;background:#10181d;color:#8997a0;padding:0 10px;cursor:pointer;font-size:10.5px}
      .picker-mode.active{border-color:#247f7a;color:#4ce2da;background:#102726}
      .picker-results{flex:1;overflow:auto;padding:0 10px 10px}
      .entity-option{width:100%;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;text-align:left;padding:10px;border:0;border-bottom:1px solid #1d282f;background:transparent;color:#e8edf0;cursor:pointer}
      .entity-option:hover{background:#101a20}
      .entity-name{font-size:11.5px;font-weight:650;overflow-wrap:anywhere}
      .entity-id-small{font-size:9.5px;color:#71808a;margin-top:3px;overflow-wrap:anywhere}
      .entity-state{font-size:10px;color:#aab5bc;text-align:right;white-space:nowrap}
      .picker-empty{padding:22px;text-align:center;color:#71808a;font-size:11px}

      .icon-picker-backdrop{position:fixed;inset:0;z-index:10040;background:rgba(0,0,0,.78);display:grid;place-items:center;padding:12px}
      .icon-picker-dialog{width:min(560px,100%);max-height:min(760px,92dvh);background:#0b1116;border:1px solid #2a3740;border-radius:19px;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 26px 70px rgba(0,0,0,.45)}
      .icon-picker-body{padding:14px;overflow:auto;display:grid;gap:12px}
      .icon-picker-current{display:flex;align-items:center;gap:10px;padding:10px 11px;border:1px solid #25323a;border-radius:13px;background:#0a1115;color:#aeb8bf;font-size:10.5px;overflow-wrap:anywhere}
      .native-icon-picker-host{min-height:60px;display:block}
      .native-icon-picker-host ha-selector,.native-icon-picker-host ha-icon-picker{display:block;width:100%}
      .native-icon-picker-unavailable{padding:12px;border-radius:12px;border:1px solid #664b2d;background:rgba(245,166,35,.07);color:#d7b276;font-size:10.5px;line-height:1.45}

      .toast{position:fixed;z-index:10100;left:50%;bottom:max(20px,env(safe-area-inset-bottom));transform:translateX(-50%);max-width:min(90vw,460px);padding:10px 14px;border-radius:13px;background:#162129;border:1px solid #34444e;color:#e9eef1;font-size:11px;box-shadow:0 12px 40px rgba(0,0,0,.36)}
      .toast.error{border-color:#713c3a;color:#f49b98}

      @media (max-width:380px){
        .page{padding-left:10px;padding-right:10px}
        .metric-grid{gap:8px}
        .metric-card{padding:13px}
        .metric-label{font-size:11px}
        .field-grid{grid-template-columns:1fr}
        .field.full{grid-column:auto}
        .icon-field-line{grid-template-columns:1fr}
        .icon-picker-button{width:100%}
        .editor-top{align-items:flex-start}
      }
      @media (prefers-reduced-motion:reduce){
        .bar-fill{transition:none}
        .metric-card.interactive:active{transform:none}
      }
    `;
  }

  _editor(cfg) {
    if (!this._hass?.user?.is_admin) return "";
    const tabs = [
      ["general", "General"],
      ["widgets", "Datos"],
      ["navigation", "Navegación"],
      ["advanced", "Avanzado"],
    ];

    let content = "";
    if (this._editorTab === "widgets") content = this._editorWidgets(cfg);
    else if (this._editorTab === "navigation") content = this._editorNavigation(cfg);
    else if (this._editorTab === "advanced") content = this._editorAdvanced(cfg);
    else content = this._editorGeneral(cfg);

    return `
      <div class="editor-backdrop">
        <aside class="editor" aria-label="Personalización del panel avanzado">
          <div class="editor-top">
            <div class="editor-title">Personalización</div>
            <div class="editor-actions">
              <button class="editor-btn" data-action="close-editor">Cancelar</button>
              <button class="editor-btn primary" data-action="save-config">Guardar</button>
            </div>
          </div>
          <div class="editor-tabs">
            ${tabs.map(([id,label]) => `<button class="editor-tab ${this._editorTab === id ? "active" : ""}" data-action="tab" data-tab="${id}">${label}</button>`).join("")}
          </div>
          <div class="editor-body">${content}</div>
          <div class="editor-bottom">
            Los estados siguen actualizándose internamente mientras editas, pero el editor no se reconstruye por esos cambios.
          </div>
        </aside>
      </div>
    `;
  }

  _editSection(title, content) {
    return `<section class="edit-section"><div class="edit-section-title">${this._escape(title)}</div><div class="edit-section-content">${content}</div></section>`;
  }

  _input(path, label, value, options = {}) {
    const full = options.full ? " full" : "";
    const type = options.type || "text";

    if (type === "checkbox") {
      return `
        <div class="field${full}">
          <label>${this._escape(label)}</label>
          <label class="checkbox-row">
            <input type="checkbox" data-setting="${this._escape(path)}" data-value-type="boolean" ${value ? "checked" : ""}>
            <span>${value ? "Sí" : "No"}</span>
          </label>
        </div>`;
    }

    if (type === "select") {
      return `
        <div class="field${full}">
          <label>${this._escape(label)}</label>
          <select class="control" data-setting="${this._escape(path)}">
            ${(options.options || []).map(([v,t]) => `<option value="${this._escape(v)}" ${String(value) === String(v) ? "selected" : ""}>${this._escape(t)}</option>`).join("")}
          </select>
        </div>`;
    }

    if (type === "number") {
      return `
        <div class="field${full}">
          <label>${this._escape(label)}</label>
          <input class="control" type="number" data-setting="${this._escape(path)}" data-value-type="number" value="${this._escape(value)}" ${options.min !== undefined ? `min="${this._escape(options.min)}"` : ""} ${options.max !== undefined ? `max="${this._escape(options.max)}"` : ""} ${options.step !== undefined ? `step="${this._escape(options.step)}"` : ""}>
        </div>`;
    }

    return `
      <div class="field${full}">
        <label>${this._escape(label)}</label>
        <input class="control" type="${this._escape(type)}" data-setting="${this._escape(path)}" value="${this._escape(value)}">
      </div>`;
  }

  _iconInput(path, label, value, options = {}) {
    const full = options.full ? " full" : "";
    return `
      <div class="field${full}">
        <label>${this._escape(label)}</label>
        <div class="icon-field-line">
          <input class="control" type="text" data-setting="${this._escape(path)}" value="${this._escape(value || "")}" placeholder="mdi:nombre-icono" autocomplete="off">
          <button class="editor-btn icon-picker-button" type="button" data-action="open-icon-picker" data-icon-path="${this._escape(path)}" data-icon-label="${this._escape(label)}">Buscar icono</button>
        </div>
      </div>`;
  }

  _color(path, label, value) {
    return `
      <div class="field">
        <label>${this._escape(label)}</label>
        <input class="control" type="color" data-setting="${this._escape(path)}" value="${this._escape(value || "#35ddd5")}">
      </div>`;
  }

  _editorGeneral(cfg) {
    const h = cfg.header;
    const d = cfg.design;

    const sectionEditors = (cfg.sections || []).map((s,i) => `
      <div class="item-card">
        <div class="item-head">
          <span class="item-name">${this._icon(s.icon,20,s.color)} ${this._escape(s.title || s.id)}</span>
        </div>
        <div class="field-grid">
          ${this._input(`sections.${i}.show`, "Mostrar sección", s.show, {type:"checkbox"})}
          ${this._input(`sections.${i}.title`, "Título", s.title)}
          ${this._input(`sections.${i}.subtitle`, "Subtítulo", s.subtitle, {full:true})}
          ${this._iconInput(`sections.${i}.icon`, "Icono MDI", s.icon)}
          ${this._color(`sections.${i}.color`, "Color", s.color)}
        </div>
      </div>`).join("");

    return [
      this._editSection("Encabezado", `<div class="field-grid">
        ${this._input("header.show","Mostrar encabezado",h.show,{type:"checkbox"})}
        ${this._input("header.align","Alineación",h.align,{type:"select",options:[["left","Izquierda"],["center","Centro"],["right","Derecha"]]})}
        ${this._input("header.title","Título",h.title)}
        ${this._input("header.subtitle","Subtítulo",h.subtitle)}
        ${this._iconInput("header.icon","Icono MDI",h.icon)}
        ${this._color("header.icon_color","Color icono",h.icon_color)}
        ${this._color("header.title_color","Color título",h.title_color)}
        ${this._color("header.subtitle_color","Color subtítulo",h.subtitle_color)}
        ${this._input("header.title_size","Tamaño título",h.title_size,{type:"number",min:16,max:48,step:1})}
        ${this._input("header.subtitle_size","Tamaño subtítulo",h.subtitle_size,{type:"number",min:9,max:28,step:1})}
        ${this._input("header.icon_size","Tamaño icono",h.icon_size,{type:"number",min:16,max:50,step:1})}
      </div>`),

      this._editSection("Diseño global", `<div class="field-grid">
        ${this._color("design.background","Fondo principal",d.background)}
        ${this._color("design.background_secondary","Fondo secundario",d.background_secondary)}
        ${this._color("design.card_background","Fondo tarjetas",d.card_background)}
        ${this._color("design.card_border_color","Borde tarjetas",d.card_border_color)}
        ${this._color("design.label_color","Etiquetas",d.label_color)}
        ${this._color("design.value_color","Valores",d.value_color)}
        ${this._color("design.unit_color","Unidades",d.unit_color)}
        ${this._color("design.accent_color","Acento",d.accent_color)}
        ${this._color("design.track_color","Pista barras",d.track_color)}
        ${this._input("design.panel_max_width","Ancho máximo panel",d.panel_max_width,{type:"number",min:320,max:1000,step:10})}
        ${this._input("design.panel_padding","Padding panel",d.panel_padding,{type:"number",min:0,max:40,step:1})}
        ${this._input("design.section_gap","Separación secciones",d.section_gap,{type:"number",min:4,max:40,step:1})}
        ${this._input("design.card_gap","Separación tarjetas",d.card_gap,{type:"number",min:4,max:30,step:1})}
        ${this._input("design.card_radius","Radio tarjetas",d.card_radius,{type:"number",min:0,max:40,step:1})}
        ${this._input("design.card_padding","Padding tarjetas",d.card_padding,{type:"number",min:8,max:30,step:1})}
        ${this._input("design.card_border_width","Grosor borde",d.card_border_width,{type:"number",min:0,max:4,step:1})}
        ${this._input("design.font_family","Fuente CSS",d.font_family,{full:true})}
      </div>`),

      this._editSection("Datos demo", `<div class="field-grid">
        ${this._input("demo_when_missing","Usar demo si falta entidad",cfg.demo_when_missing,{type:"checkbox"})}
        ${this._input("show_demo_badge","Mostrar aviso demo",cfg.show_demo_badge,{type:"checkbox"})}
        ${this._input("locale","Formato regional",cfg.locale)}
      </div>`),

      this._editSection("Gráfico nativo de energía", `<div class="help" style="margin-bottom:10px">Usa directamente la tarjeta oficial <b>power-sources-graph</b> de Home Assistant. No se modifican sus datos, ejes, series, tooltip ni lógica interna. El fondo se aplica únicamente mediante variables de tema del <b>ha-card</b> nativo.</div><div class="field-grid">
        ${this._input("native_power_graph.show","Mostrar gráfico",cfg.native_power_graph?.show,{type:"checkbox"})}
        ${this._input("native_power_graph.title","Título",cfg.native_power_graph?.title || "Fuentes de energía",{full:true})}
        ${this._input("native_power_graph.show_legend","Mostrar leyenda",cfg.native_power_graph?.show_legend !== false,{type:"checkbox"})}
        ${this._input("native_power_graph.background_mode","Fondo",cfg.native_power_graph?.background_mode || "native",{type:"select",options:[["native","Nativo de Home Assistant"],["panel","Fondo de tarjetas del panel"],["custom","Color personalizado"]]})}
        ${this._color("native_power_graph.background_color","Color personalizado",cfg.native_power_graph?.background_color || d.card_background)}
      </div><div class="help" style="margin-top:10px">El modo <b>Nativo</b> conserva exactamente el comportamiento anterior. <b>Fondo de tarjetas del panel</b> sigue automáticamente Diseño global → Fondo tarjetas. <b>Color personalizado</b> afecta solo esta tarjeta.</div>`),

      this._editSection("Secciones", `<div style="display:grid;gap:10px">${sectionEditors}</div>`),
    ].join("");
  }

  _editorWidgets(cfg) {
    const sectionOptions = (cfg.sections || []).map((s) => [s.id, s.title || s.id]);
    const cards = (cfg.widgets || []).map((w,i) => {
      const state = this._hass?.states?.[w.entity];
      const stateText = state ? `${state.state}${state.attributes?.unit_of_measurement ? ` ${state.attributes.unit_of_measurement}` : ""}` : "Entidad no disponible";
      const a = deepMerge(DEFAULT_ACTIONS(), w.actions || {});

      return `
        <div class="item-card">
          <div class="item-head">
            <div style="display:flex;align-items:center;gap:8px;min-width:0">
              <span>${this._icon(w.icon,21,w.color || cfg.design.accent_color)}</span>
              <span class="item-name">${this._escape(w.label || w.id)}</span>
            </div>
            <button class="tiny-btn" data-action="remove-widget" data-index="${i}">Eliminar</button>
          </div>

          <div class="field-grid">
            ${this._input(`widgets.${i}.show`,"Mostrar",w.show,{type:"checkbox"})}
            ${this._input(`widgets.${i}.section`,"Sección",w.section,{type:"select",options:sectionOptions})}
            ${this._input(`widgets.${i}.label`,"Etiqueta",w.label)}
            ${this._iconInput(`widgets.${i}.icon`,"Icono MDI",w.icon)}
            <div class="field full">
              <label>Entidad</label>
              <div class="entity-line">
                <div>
                  <input class="control" data-setting="widgets.${i}.entity" value="${this._escape(w.entity || "")}">
                  <div class="entity-current">${this._escape(stateText)}</div>
                </div>
                <button class="editor-btn" data-action="open-picker" data-index="${i}">Elegir</button>
              </div>
            </div>
            ${this._input(`widgets.${i}.category`,"Filtro recomendado",w.category,{type:"select",options:[["voltage","Voltaje"],["current","Corriente"],["power","Potencia"],["energy","Energía"],["cost","Costo"],["other","Otro"]]})}
            ${this._input(`widgets.${i}.kind`,"Visualización",w.kind,{type:"select",options:[["metric","Valor"],["bar","Barra horizontal"],["hero","Destacado + barra"]]})}
            ${this._input(`widgets.${i}.span`,"Ancho",Number(w.span),{type:"select",options:[["1","Media fila"],["2","Fila completa"]]})}
            ${this._input(`widgets.${i}.unit`,"Unidad",w.unit)}
            ${this._input(`widgets.${i}.prefix`,"Prefijo",w.prefix)}
            ${this._input(`widgets.${i}.decimals`,"Decimales",w.decimals,{type:"number",min:0,max:6,step:1})}
            ${this._input(`widgets.${i}.multiplier`,"Multiplicador",w.multiplier,{type:"number",step:0.001})}
            ${this._input(`widgets.${i}.offset`,"Offset",w.offset,{type:"number",step:0.001})}
            ${this._input(`widgets.${i}.min`,"Mínimo barra",w.min,{type:"number",step:0.1})}
            ${this._input(`widgets.${i}.max`,"Máximo barra",w.max,{type:"number",step:0.1})}
            ${this._input(`widgets.${i}.value_size`,"Tamaño valor",w.value_size,{type:"number",min:16,max:60,step:1})}
            ${this._color(`widgets.${i}.color`,"Color",w.color || cfg.design.accent_color)}
          </div>

          <div class="action-box">
            <div class="action-title">Acciones · toque y mantener</div>
            <div class="field-grid">
              ${this._actionInputs(`widgets.${i}.actions.tap`,"Un clic / toque",a.tap)}
              ${this._actionInputs(`widgets.${i}.actions.hold`,"Mantener presionado",a.hold)}
            </div>
          </div>
        </div>
      `;
    }).join("");

    return `
      ${this._editSection("Widgets eléctricos", `
        <div class="help">Las barras no representan “bueno/malo”; únicamente ubican el valor entre el mínimo y máximo configurados. Usa Valor cuando una escala no aporte información.</div>
        <div style="display:grid;gap:10px">${cards}</div>
        <button class="editor-btn" data-action="add-widget">+ Agregar dato</button>
      `)}
    `;
  }

  _actionInputs(path, label, value) {
    const action = value?.action || "none";
    const target = value?.target || "";
    const options = [
      ["more-info","Más información (popup nativo)"],
      ["none","No hacer nada"],
      ["navigate","Navegar dentro de Home Assistant"],
      ["url","Abrir URL"],
      ["toggle","Alternar entidad (toggle)"],
    ];
    return `
      <div class="field">
        <label>${this._escape(label)}</label>
        <select class="control" data-setting="${this._escape(path)}.action">
          ${options.map(([v,t]) => `<option value="${v}" ${action === v ? "selected" : ""}>${t}</option>`).join("")}
        </select>
        <input class="control" data-setting="${this._escape(path)}.target" value="${this._escape(target)}" placeholder="${action === "navigate" ? "/ruta" : action === "url" ? "https://..." : "Opcional"}">
      </div>
    `;
  }

  _editorNavigation(cfg) {
    const n = cfg.navigation;
    const buttons = (n.buttons || []).map((b,i) => `
      <div class="item-card">
        <div class="item-head">
          <div style="display:flex;align-items:center;gap:8px">
            <span>${this._icon(b.icon,21,b.color || n.active_color)}</span>
            <span class="item-name">Botón ${i + 1}</span>
          </div>
          <button class="tiny-btn" data-action="remove-nav" data-index="${i}">Eliminar</button>
        </div>
        <div class="field-grid">
          ${this._input(`navigation.buttons.${i}.show`,"Mostrar",b.show,{type:"checkbox"})}
          ${this._input(`navigation.buttons.${i}.label`,"Texto",b.label)}
          ${this._iconInput(`navigation.buttons.${i}.icon`,"Icono MDI",b.icon)}
          ${this._input(`navigation.buttons.${i}.path`,"Ruta",b.path,{full:true})}
          ${this._color(`navigation.buttons.${i}.color`,"Color icono",b.color || n.active_color)}
        </div>
      </div>
    `).join("");

    return [
      this._editSection("Barra de navegación", `
        <div class="nav-note">Es independiente del botón que crearás en el resumen. Puedes dejarla apagada y entrar al panel únicamente mediante <b>/energy-advanced</b>.</div>
        <div class="field-grid">
          ${this._input("navigation.show","Mostrar navegación",n.show,{type:"checkbox"})}
          ${this._input("navigation.position","Posición",n.position,{type:"select",options:[["top","Arriba"],["bottom","Abajo"]]})}
          ${this._input("navigation.columns","Columnas",n.columns,{type:"number",min:1,max:6,step:1})}
          ${this._input("navigation.gap","Separación",n.gap,{type:"number",min:2,max:24,step:1})}
          ${this._input("navigation.button_height","Altura botones",n.button_height,{type:"number",min:40,max:100,step:1})}
          ${this._input("navigation.radius","Radio",n.radius,{type:"number",min:0,max:30,step:1})}
          ${this._input("navigation.icon_size","Tamaño icono",n.icon_size,{type:"number",min:14,max:40,step:1})}
          ${this._input("navigation.font_size","Tamaño texto",n.font_size,{type:"number",min:8,max:20,step:1})}
          ${this._input("navigation.show_labels","Mostrar texto",n.show_labels,{type:"checkbox"})}
          ${this._color("navigation.background","Fondo",n.background)}
          ${this._color("navigation.border_color","Borde",n.border_color)}
          ${this._color("navigation.text_color","Texto",n.text_color)}
          ${this._color("navigation.active_color","Activo",n.active_color)}
        </div>
      `),
      this._editSection("Botones", `<div style="display:grid;gap:10px">${buttons}</div><button class="editor-btn" data-action="add-nav">+ Agregar botón</button>`),
    ].join("");
  }

  _editorAdvanced(cfg) {
    return [
      this._editSection("Configuración JSON", `
        <div class="help">Permite editar cualquier propiedad, incluso si todavía no existe un control visual específico.</div>
        <textarea class="control" id="advanced-json">${this._escape(JSON.stringify(this._editConfig || cfg, null, 2))}</textarea>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button class="editor-btn" data-action="apply-json">Aplicar JSON</button>
          <button class="editor-btn" data-action="export-config">Exportar</button>
          <button class="editor-btn" data-action="import-config">Importar</button>
          <button class="editor-btn danger" data-action="reset-config">Restablecer</button>
          <input type="file" id="import-file" accept="application/json,.json" hidden>
        </div>
      `),
      this._editSection("Aislamiento", `
        <div class="help">
          Este panel usa el dominio <b>smart_energy_advanced_panel</b>, comandos WebSocket propios y una clave de almacenamiento distinta.
          Guardar o restablecer aquí no modifica <b>smart_home_panel</b>.
        </div>
      `),
    ].join("");
  }

  _recommendedEntity(entityId, stateObj, category) {
    if (!stateObj) return false;
    const unit = String(stateObj.attributes?.unit_of_measurement || "").toLowerCase();
    const dc = String(stateObj.attributes?.device_class || "").toLowerCase();
    const friendly = String(stateObj.attributes?.friendly_name || "").toLowerCase();
    const id = String(entityId || "").toLowerCase();
    const hay = `${id} ${friendly} ${unit} ${dc}`;

    switch (category) {
      case "voltage":
        return dc === "voltage" || /\b(v|volt|voltage|voltaje)\b/.test(hay);
      case "current":
        return dc === "current" || /\b(a|amp|ampere|corriente|current)\b/.test(hay);
      case "power":
        return dc === "power" || /\b(w|kw|mw|potencia|power)\b/.test(hay);
      case "energy":
        return dc === "energy" || /kwh|wh|energ[ií]a|energy|factur/.test(hay);
      case "cost":
        return /mxn|usd|\$|costo|cost|precio|price|tarifa/.test(hay);
      default:
        return true;
    }
  }

  _pickerResults() {
    if (!this._picker) return [];
    const cfg = this._config();
    const widget = cfg.widgets?.[this._picker.index];
    const category = widget?.category || "other";
    const q = this._pickerSearch.trim().toLowerCase();

    const rows = Object.entries(this._hass?.states || {}).map(([id,state]) => ({
      id,
      state,
      name: state.attributes?.friendly_name || id,
      unit: state.attributes?.unit_of_measurement || "",
    })).filter((row) => {
      if (this._pickerMode === "recommended" && !this._recommendedEntity(row.id, row.state, category)) return false;
      if (!q) return true;
      return `${row.id} ${row.name} ${row.state.state} ${row.unit}`.toLowerCase().includes(q);
    });

    rows.sort((a,b) => String(a.name).localeCompare(String(b.name), "es"));
    return rows.slice(0, 250);
  }

  _entityPicker(cfg) {
    if (!this._picker) return "";
    const widget = cfg.widgets?.[this._picker.index];
    const rows = this._pickerResults();

    return `
      <div class="picker-backdrop">
        <div class="picker">
          <div class="picker-top">
            <div>
              <div class="picker-title">Seleccionar entidad</div>
              <div class="help">${this._escape(widget?.label || "")}</div>
            </div>
            <button class="editor-btn" data-action="close-picker">Cerrar</button>
          </div>
          <div class="picker-search">
            <input id="picker-search" value="${this._escape(this._pickerSearch)}" placeholder="Buscar por nombre o entity_id" autocomplete="off">
          </div>
          <div class="picker-modes">
            <button class="picker-mode ${this._pickerMode === "recommended" ? "active" : ""}" data-action="picker-mode" data-mode="recommended">Recomendadas</button>
            <button class="picker-mode ${this._pickerMode === "all" ? "active" : ""}" data-action="picker-mode" data-mode="all">Todas</button>
          </div>
          <div class="picker-results" id="picker-results">
            ${rows.length ? rows.map((row) => `
              <button class="entity-option" data-action="pick-entity" data-entity="${this._escape(row.id)}">
                <span>
                  <div class="entity-name">${this._escape(row.name)}</div>
                  <div class="entity-id-small">${this._escape(row.id)}</div>
                </span>
                <span class="entity-state">${this._escape(row.state.state)}${row.unit ? ` ${this._escape(row.unit)}` : ""}</span>
              </button>
            `).join("") : `<div class="picker-empty">No hay entidades que coincidan.</div>`}
          </div>
        </div>
      </div>
    `;
  }

  _iconPickerDialog() {
    if (!this._iconPicker || !this._editConfig) return "";
    const current = String(this._getPath(this._editConfig, this._iconPicker.path) || "");
    return `
      <div class="icon-picker-backdrop" role="dialog" aria-modal="true" aria-label="Selector de iconos MDI">
        <div class="icon-picker-dialog">
          <div class="picker-top">
            <div>
              <div class="picker-title">Seleccionar icono</div>
              <div class="help">${this._escape(this._iconPicker.label || "Icono MDI")}</div>
            </div>
            <button class="editor-btn" type="button" data-action="close-icon-picker">Cerrar</button>
          </div>
          <div class="icon-picker-body">
            <div class="icon-picker-current">
              ${this._icon(current, 24, this._editConfig.design?.accent_color || "#35ddd5")}
              <span>${this._escape(current || "Sin icono seleccionado")}</span>
            </div>
            <div id="native-icon-picker-host" class="native-icon-picker-host"></div>
            <div class="help">El campo manual <b>mdi:...</b> permanece disponible detrás de este diálogo. El selector visual usa componentes nativos de Home Assistant y no mantiene una lista MDI propia.</div>
          </div>
        </div>
      </div>
    `;
  }

  _mountNativeIconPicker() {
    if (!this._iconPicker || !this._editConfig || !this._hass) return;
    const host = this.shadowRoot?.getElementById("native-icon-picker-host");
    if (!host || host.dataset.mounted === "1") return;
    host.dataset.mounted = "1";

    const path = this._iconPicker.path;
    const current = String(this._getPath(this._editConfig, path) || "");
    let picker = null;

    // Ruta primaria: selector genérico nativo de Home Assistant.
    if (customElements.get("ha-selector")) {
      picker = document.createElement("ha-selector");
      picker.hass = this._hass;
      picker.selector = { icon: {} };
      picker.value = current;
      picker.label = this._iconPicker.label || "Icono MDI";
    // Ruta secundaria: componente que Home Assistant utiliza directamente
    // en sus propios formularios de iconos.
    } else if (customElements.get("ha-icon-picker")) {
      picker = document.createElement("ha-icon-picker");
      picker.hass = this._hass;
      picker.value = current;
      picker.configValue = "icon";
      picker.label = this._iconPicker.label || "Icono MDI";
    }

    if (!picker) {
      host.innerHTML = `<div class="native-icon-picker-unavailable">El selector visual nativo no está disponible en esta sesión de Home Assistant. Cierra este diálogo y usa el campo manual <b>mdi:...</b>; el resto del panel no se ve afectado.</div>`;
      return;
    }

    picker.style.display = "block";
    picker.style.width = "100%";
    picker.addEventListener("value-changed", (event) => {
      event.stopPropagation();
      if (!this._iconPicker || !this._editConfig) return;
      const raw = event.detail?.value ?? event.target?.value ?? "";
      const value = String(raw || "").trim();

      // Ignora eventos iniciales/vacíos o valores ajenos a MDI. El usuario
      // siempre puede borrar/escribir manualmente desde el input original.
      if (!value.startsWith("mdi:") || value === current) return;

      this._setPath(this._editConfig, path, value);
      this._iconPicker = null;
      this._lastSignature = "";
      this._queueRender(true);
    });

    host.replaceChildren(picker);
  }

  _refreshPickerResults() {
    const root = this.shadowRoot?.getElementById("picker-results");
    if (!root) return;
    const rows = this._pickerResults();
    root.innerHTML = rows.length ? rows.map((row) => `
      <button class="entity-option" data-action="pick-entity" data-entity="${this._escape(row.id)}">
        <span>
          <div class="entity-name">${this._escape(row.name)}</div>
          <div class="entity-id-small">${this._escape(row.id)}</div>
        </span>
        <span class="entity-state">${this._escape(row.state.state)}${row.unit ? ` ${this._escape(row.unit)}` : ""}</span>
      </button>
    `).join("") : `<div class="picker-empty">No hay entidades que coincidan.</div>`;
  }

  _onInput(ev) {
    if (ev.target?.id === "picker-search") {
      this._pickerSearch = ev.target.value || "";
      this._refreshPickerResults();
      return;
    }
  }

  _onChange(ev) {
    const el = ev.target.closest?.("[data-setting]");
    if (!el || !this._editConfig) return;

    let value;
    const type = el.dataset.valueType;
    if (type === "boolean") value = Boolean(el.checked);
    else if (type === "number") value = Number(el.value);
    else value = el.value;

    const path = el.dataset.setting;

    // Los select de span contienen strings; guardamos número para el renderer.
    if (/\.span$/.test(path)) value = Number(value);

    this._setPath(this._editConfig, path, value);

    if (/^navigation\.buttons\.\d+\.show$/.test(path) && value === true) {
      this._editConfig.navigation.show = true;
    }

    this._lastSignature = "";
    this._queueRender(true);
  }

  async _onClick(ev) {
    const nav = ev.target.closest?.("[data-nav-path]");
    if (nav) {
      this._navigate(nav.dataset.navPath);
      return;
    }

    const widgetCard = ev.target.closest?.("[data-widget-id]");
    if (widgetCard && !this._editorOpen) {
      if (Date.now() < this._suppressClickUntil) {
        ev.preventDefault();
        ev.stopPropagation();
        return;
      }
      const widget = this._findWidget(widgetCard.dataset.widgetId);
      if (widget) await this._runWidgetAction(widget, "tap");
      return;
    }

    const target = ev.target.closest?.("[data-action]");
    if (!target) return;
    const action = target.dataset.action;

    if (action === "open-editor") {
      this._editConfig = deepClone(this._config());
      this._editorOpen = true;
      this._editorTab = "general";
      this._lastSignature = "";
      this._queueRender();
      return;
    }

    if (action === "close-editor") {
      this._picker = null;
      this._iconPicker = null;
      this._editorOpen = false;
      this._editConfig = null;
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

    if (action === "save-config") {
      await this._saveConfig();
      return;
    }

    if (action === "reset-config") {
      if (!confirm("¿Restablecer solamente la personalización del panel avanzado?")) return;
      try {
        await this._hass.callWS({ type: `${BACKEND_DOMAIN}/config/reset` });
        this._storedConfig = {};
        this._editConfig = deepClone(DEFAULTS);
        this._iconPicker = null;
        this._toast("Panel avanzado restablecido");
        this._lastSignature = "";
        this._queueRender(true);
      } catch (err) {
        this._toast(`No se pudo restablecer: ${err?.message || err}`, "error");
      }
      return;
    }

    if (action === "add-widget") {
      const id = `custom_${Date.now()}`;
      this._editConfig.widgets ||= [];
      this._editConfig.widgets.push({
        id,
        section: "reference",
        show: true,
        entity: "",
        label: "Nuevo dato",
        icon: "mdi:chart-box-outline",
        category: "other",
        kind: "metric",
        span: 1,
        unit: "auto",
        prefix: "",
        decimals: 2,
        multiplier: 1,
        offset: 0,
        demo_value: 0,
        min: 0,
        max: 100,
        color: this._editConfig.design?.accent_color || "#35ddd5",
        value_size: 25,
        actions: DEFAULT_ACTIONS(),
      });
      this._lastSignature = "";
      this._queueRender(true);
      return;
    }

    if (action === "remove-widget") {
      const index = Number(target.dataset.index);
      if (!Number.isInteger(index)) return;
      this._editConfig.widgets.splice(index, 1);
      this._lastSignature = "";
      this._queueRender(true);
      return;
    }

    if (action === "add-nav") {
      this._editConfig.navigation.buttons ||= [];
      this._editConfig.navigation.show = true;
      this._editConfig.navigation.buttons.push({
        show: true,
        label: "Nuevo",
        icon: "mdi:circle-outline",
        path: "/",
        color: this._editConfig.navigation.active_color || "#35ddd5",
      });
      this._lastSignature = "";
      this._queueRender(true);
      return;
    }

    if (action === "remove-nav") {
      const index = Number(target.dataset.index);
      this._editConfig.navigation.buttons.splice(index, 1);
      this._lastSignature = "";
      this._queueRender(true);
      return;
    }

    if (action === "open-icon-picker") {
      if (!this._editConfig) return;
      const path = String(target.dataset.iconPath || "");
      if (!path) return;
      this._picker = null;
      this._iconPicker = {
        path,
        label: target.dataset.iconLabel || "Icono MDI",
      };
      this._lastSignature = "";
      this._queueRender(true);
      return;
    }

    if (action === "close-icon-picker") {
      this._iconPicker = null;
      this._lastSignature = "";
      this._queueRender(true);
      return;
    }

    if (action === "open-picker") {
      this._iconPicker = null;
      this._picker = { index: Number(target.dataset.index) };
      this._pickerSearch = "";
      this._pickerMode = "recommended";
      this._lastSignature = "";
      this._queueRender(true);
      return;
    }

    if (action === "close-picker") {
      this._picker = null;
      this._lastSignature = "";
      this._queueRender(true);
      return;
    }

    if (action === "picker-mode") {
      this._pickerMode = target.dataset.mode === "all" ? "all" : "recommended";
      this._lastSignature = "";
      this._queueRender(true);
      return;
    }

    if (action === "pick-entity") {
      if (!this._picker || !this._editConfig) return;
      const entity = target.dataset.entity || "";
      const index = this._picker.index;
      if (this._editConfig.widgets?.[index]) {
        this._editConfig.widgets[index].entity = entity;
      }
      this._picker = null;
      this._lastSignature = "";
      this._queueRender(true);
      return;
    }

    if (action === "apply-json") {
      const area = this.shadowRoot.getElementById("advanced-json");
      try {
        const parsed = JSON.parse(area.value);
        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
          throw new Error("La raíz debe ser un objeto JSON");
        }
        this._editConfig = parsed;
        this._toast("JSON aplicado; pulsa Guardar para persistirlo");
        this._lastSignature = "";
        this._queueRender(true);
      } catch (err) {
        this._toast(`JSON inválido: ${err.message}`, "error");
      }
      return;
    }

    if (action === "export-config") {
      const blob = new Blob(
        [JSON.stringify(this._editConfig || this._config(), null, 2)],
        { type: "application/json" }
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "smart-energy-advanced-panel-config.json";
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      return;
    }

    if (action === "import-config") {
      const input = this.shadowRoot.getElementById("import-file");
      if (!input) return;
      input.onchange = async () => {
        const file = input.files?.[0];
        if (!file) return;
        try {
          const parsed = JSON.parse(await file.text());
          if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
            throw new Error("La raíz debe ser un objeto JSON");
          }
          this._editConfig = parsed;
          this._toast("Configuración importada; pulsa Guardar");
          this._lastSignature = "";
          this._queueRender(true);
        } catch (err) {
          this._toast(`No se pudo importar: ${err.message}`, "error");
        }
      };
      input.click();
      return;
    }
  }

  async _saveConfig() {
    if (!this._hass?.user?.is_admin || !this._editConfig) return;
    try {
      await this._hass.callWS({
        type: `${BACKEND_DOMAIN}/config/save`,
        config: this._editConfig,
      });
      this._storedConfig = deepClone(this._editConfig);
      this._picker = null;
      this._iconPicker = null;
      this._editorOpen = false;
      this._editConfig = null;
      this._backendOk = true;
      this._toast("Configuración guardada");
      this._lastSignature = "";
      this._queueRender();
    } catch (err) {
      this._backendOk = false;
      this._toast(`No se pudo guardar: ${err?.message || err}`, "error");
    }
  }

  _toast(message, type = "ok") {
    this._toastMessage = message;
    this._toastType = type;
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => {
      this._toastMessage = "";
      if (!this._editorOpen) this._queueRender();
      else this._queueRender(true);
    }, 2600);
    if (!this._editorOpen) this._queueRender();
    else this._queueRender(true);
  }

  _findWidget(id) {
    return (this._config().widgets || []).find((w) => w.id === id);
  }

  async _runWidgetAction(widget, gesture) {
    const spec = widget.actions?.[gesture] || { action: "none", target: "" };
    const action = spec.action || "none";
    const target = spec.target || "";

    if (action === "none") return;

    if (action === "more-info") {
      if (!widget.entity) return;
      this.dispatchEvent(new CustomEvent("hass-more-info", {
        detail: { entityId: widget.entity },
        bubbles: true,
        composed: true,
      }));
      return;
    }

    if (action === "navigate") {
      if (target) this._navigate(target);
      return;
    }

    if (action === "url") {
      if (!target) return;
      if (target.startsWith("/") && !target.startsWith("//")) this._navigate(target);
      else window.open(target, "_blank", "noopener,noreferrer");
      return;
    }

    if (action === "toggle") {
      if (!widget.entity) return;
      try {
        await this._hass.callService("homeassistant", "toggle", { entity_id: widget.entity });
      } catch (err) {
        this._toast(`No se pudo alternar ${widget.entity}`, "error");
      }
    }
  }

  _navigate(path) {
    if (!path) return;
    if (/^https?:\/\//i.test(path)) {
      window.location.href = path;
      return;
    }
    history.pushState(null, "", path);
    window.dispatchEvent(new Event("location-changed"));
  }

  _onPointerDown(ev) {
    if (this._editorOpen || ev.button !== undefined && ev.button !== 0) return;
    const card = ev.target.closest?.("[data-widget-id]");
    if (!card) return;
    const widget = this._findWidget(card.dataset.widgetId);
    if (!widget || !widget.actions?.hold || widget.actions.hold.action === "none") return;

    this._pointer = {
      pointerId: ev.pointerId,
      widgetId: widget.id,
      x: ev.clientX,
      y: ev.clientY,
      started: performance.now(),
      cancelled: false,
    };
  }

  _onPointerMove(ev) {
    if (!this._pointer || this._pointer.pointerId !== ev.pointerId) return;
    const dx = ev.clientX - this._pointer.x;
    const dy = ev.clientY - this._pointer.y;
    if (Math.hypot(dx, dy) > 12) this._pointer.cancelled = true;
  }

  async _onPointerUp(ev) {
    if (!this._pointer || this._pointer.pointerId !== ev.pointerId) return;
    const pointer = this._pointer;
    this._pointer = null;
    if (pointer.cancelled) return;

    const elapsed = performance.now() - pointer.started;
    if (elapsed < 500) return;

    const widget = this._findWidget(pointer.widgetId);
    if (!widget) return;

    this._suppressClickUntil = Date.now() + 800;
    await this._runWidgetAction(widget, "hold");
  }

  _cancelPointer() {
    this._pointer = null;
  }
}

if (!customElements.get("smart-energy-advanced-panel")) {
  customElements.define("smart-energy-advanced-panel", SmartEnergyAdvancedPanel);
}
