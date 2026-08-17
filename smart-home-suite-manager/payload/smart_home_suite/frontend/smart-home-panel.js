/**
 * Smart Home Panel V2
 * Generic mobile-first custom panel for Home Assistant.
 *
 * - Persistent settings through the companion custom integration.
 * - Visual personalization screen (admin only).
 * - Optional navigation buttons.
 * - SVG tachometer gauge with configurable ranges and value position.
 * - No external JavaScript dependencies.
 */

const PANEL_VERSION = "2.0.5";


const ENTITY_FILTERS = {
  cost: {
    title: "Costo mensual",
    domains: ["sensor"],
    device_classes: ["monetary"],
    units: ["MXN", "$", "USD", "EUR"],
    keywords: ["costo", "cost", "precio", "price", "mxn", "moneda", "currency", "electric"],
  },
  season: {
    title: "Temporada",
    domains: ["sensor", "input_select", "select", "input_text"],
    device_classes: [],
    units: [],
    keywords: ["temporada", "season", "verano", "invierno", "summer", "winter", "cfe"],
  },
  tariff: {
    title: "Rango de tarifa",
    domains: ["sensor", "input_select", "select", "input_text"],
    device_classes: [],
    units: [],
    keywords: ["tarifa", "tramo", "rango", "tariff", "rate", "cfe"],
  },
  power: {
    title: "Potencia instantánea",
    domains: ["sensor"],
    device_classes: ["power"],
    units: ["W", "kW", "MW"],
    keywords: ["potencia", "power", "consumo", "watt", "watts"],
  },
};

// Permite que una instalación que venía de V2.0.2 con los entity_id genéricos
// adopte automáticamente los sensores reales de esta prueba, sin borrar .storage.
const LEGACY_ENTITY_MIGRATIONS = {
  monthly_cost: ["sensor.monthly_electric_cost", "sensor.medidor_de_consumo_electrico_costo_acumulado_del_mes"],
  season: ["sensor.billing_season", "sensor.power_record_temporada_cfe_actual"],
  tariff: ["sensor.tariff_range", "sensor.medidor_de_consumo_electrico_tramo_cfe_actual"],
  power: ["sensor.current_power", "sensor.power_record_08_potencia_total"],
};

const DEFAULTS = {
  locale: "es-MX",
  demo_when_missing: true,
  show_demo_badge: true,

  header: {
    show: true,
    title: "Smart Home",
    subtitle: "Resumen de energía",
    icon: "mdi:home-lightning-bolt",
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
    gap: 12,
    font_family: "Roboto, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",

    card_background: "#11181e",
    card_border_color: "#26323a",
    card_border_width: 1,
    card_radius: 20,
    card_padding: 17,
    card_shadow: "0 10px 30px rgba(0,0,0,.18)",

    label_color: "#9aa6af",
    value_color: "#f5f7fa",
    unit_color: "#aeb7be",
    accent_color: "#35ddd5",
  },

  navigation: {
    show: false,
    position: "top",
    columns: 4,
    gap: 8,
    button_height: 58,
    radius: 16,
    background: "#11181e",
    border_color: "#26323a",
    text_color: "#aeb7be",
    active_color: "#35ddd5",
    icon_size: 24,
    font_size: 11,
    show_labels: true,
    buttons: [
      { show: true, label: "Inicio", icon: "mdi:home", path: "/smart-home", color: "#35ddd5" },
      { show: false, label: "Energía", icon: "mdi:flash", path: "/lovelace/energia", color: "#35ddd5" },
      { show: false, label: "Clima", icon: "mdi:thermostat", path: "/lovelace/clima", color: "#35ddd5" },
      { show: false, label: "Seguridad", icon: "mdi:shield-home", path: "/lovelace/seguridad", color: "#35ddd5" },
    ],
  },

  monthly_cost: {
    show: true,
    entity: "sensor.medidor_de_consumo_electrico_costo_acumulado_del_mes",
    demo_value: 1284.50,
    label: "Costo estimado del mes",
    icon: "mdi:cash",
    prefix: "$",
    unit: "MXN",
    decimals: 2,
    multiplier: 1,
    offset: 0,
    state_map: {},
    tap_action: {
      action: "more-info",
      navigation_path: "",
      url_path: "",
    },
    hold_action: {
      action: "none",
      navigation_path: "",
      url_path: "",
    },
    style: {
      height: 130,
      width: "100%",
      background: "",
      border_color: "",
      border_width: "",
      border_radius: "",
      padding: "",
      align: "left",
      icon_color: "#35ddd5",
      icon_size: 31,
      icon_background: "rgba(53,221,213,.10)",
      icon_box_size: 54,
      label_color: "",
      label_size: 14,
      label_weight: 500,
      value_color: "",
      value_size: 39,
      value_weight: 650,
      unit_color: "",
      unit_size: 14,
      unit_weight: 500,
    },
  },

  season: {
    show: true,
    entity: "sensor.power_record_temporada_cfe_actual",
    demo_value: "Verano",
    label: "Temporada",
    icon: "mdi:white-balance-sunny",
    prefix: "",
    unit: "",
    decimals: 0,
    multiplier: 1,
    offset: 0,
    state_map: {
      summer: "Verano",
      winter: "Invierno",
      verano: "Verano",
      invierno: "Invierno",
    },
    tap_action: {
      action: "more-info",
      navigation_path: "",
      url_path: "",
    },
    hold_action: {
      action: "none",
      navigation_path: "",
      url_path: "",
    },
    style: {
      height: 96,
      width: "100%",
      background: "",
      border_color: "",
      border_width: "",
      border_radius: "",
      padding: "",
      align: "left",
      icon_color: "#f6b73c",
      icon_size: 28,
      icon_background: "rgba(246,183,60,.10)",
      icon_box_size: 50,
      label_color: "",
      label_size: 13,
      label_weight: 500,
      value_color: "",
      value_size: 27,
      value_weight: 620,
      unit_color: "",
      unit_size: 13,
      unit_weight: 500,
    },
  },

  tariff: {
    show: true,
    entity: "sensor.medidor_de_consumo_electrico_tramo_cfe_actual",
    demo_value: "Intermedio",
    label: "Rango de tarifa",
    icon: "mdi:transmission-tower",
    prefix: "",
    unit: "",
    decimals: 0,
    multiplier: 1,
    offset: 0,
    state_map: {},
    tap_action: {
      action: "more-info",
      navigation_path: "",
      url_path: "",
    },
    hold_action: {
      action: "none",
      navigation_path: "",
      url_path: "",
    },
    style: {
      height: 96,
      width: "100%",
      background: "",
      border_color: "",
      border_width: "",
      border_radius: "",
      padding: "",
      align: "left",
      icon_color: "#66d17a",
      icon_size: 28,
      icon_background: "rgba(102,209,122,.10)",
      icon_box_size: 50,
      label_color: "",
      label_size: 13,
      label_weight: 500,
      value_color: "",
      value_size: 27,
      value_weight: 620,
      unit_color: "",
      unit_size: 13,
      unit_weight: 500,
    },
  },

  power: {
    show: true,
    entity: "sensor.power_record_08_potencia_total",
    demo_value: 1247,
    label: "Consumo actual",
    icon: "mdi:flash",
    unit: "W",
    decimals: 0,
    multiplier: 1,
    offset: 0,
    tap_action: {
      action: "more-info",
      navigation_path: "",
      url_path: "",
    },
    hold_action: {
      action: "none",
      navigation_path: "",
      url_path: "",
    },
    gauge: {
      min: 0,
      max: 10000,
      start_angle: 150,
      end_angle: 390,
      max_width: 380,
      svg_height: 330,
      center_y: 135,
      radius: 104,
      arc_thickness: 17,
      track_color: "#1f2b33",
      needle_color_mode: "auto",
      needle_color: "#f5f7fa",
      needle_width: 4,
      needle_length: 78,
      hub_color: "#f5f7fa",
      hub_size: 7,
      tick_color: "#73808a",
      tick_label_color: "#82909a",
      tick_label_size: 10,
      tick_count: 5,
      value_color: "#f5f7fa",
      value_size: 38,
      value_y: 270,
      unit_color: "#9aa6af",
      unit_size: 14,
      unit_y: 296,
      show_ticks: true,
      show_numeric_value: true,
      ranges: [
        { from: 0, to: 1500, color: "#66d17a" },
        { from: 1500, to: 3500, color: "#35ddd5" },
        { from: 3500, to: 6500, color: "#f6b73c" },
        { from: 6500, to: 10000, color: "#ef6461" },
      ],
    },
    style: {
      height: "auto",
      width: "100%",
      background: "",
      border_color: "",
      border_width: "",
      border_radius: "",
      padding: 16,
      align: "center",
      icon_color: "#35ddd5",
      icon_size: 28,
      icon_background: "rgba(53,221,213,.10)",
      icon_box_size: 48,
      label_color: "",
      label_size: 15,
      label_weight: 600,
    },
  },
};

const deepClone = (obj) => JSON.parse(JSON.stringify(obj));

function deepMerge(base, custom) {
  if (Array.isArray(base)) return Array.isArray(custom) ? deepClone(custom) : deepClone(base);
  if (base && typeof base === "object") {
    const out = { ...base };
    if (custom && typeof custom === "object" && !Array.isArray(custom)) {
      for (const [key, value] of Object.entries(custom)) {
        out[key] = deepMerge(base[key], value);
      }
    }
    return out;
  }
  return custom !== undefined ? custom : base;
}

class SmartHomePanel extends HTMLElement {
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
    this._editorTab = "general";
    this._editConfig = null;
    this._toastMessage = "";
    this._toastType = "ok";
    this._entityPickerState = null;
    this._pressGesture = null;
    this._renderQueued = false;
    this._lastSignature = "";

    this.shadowRoot.addEventListener("click", (ev) => this._onClick(ev));
    this.shadowRoot.addEventListener("change", (ev) => this._onChange(ev));
    this.shadowRoot.addEventListener("input", (ev) => this._onInput(ev));
    this.shadowRoot.addEventListener("pointerdown", (ev) => this._onWidgetPointerDown(ev));
    this.shadowRoot.addEventListener("pointermove", (ev) => this._onWidgetPointerMove(ev));
    this.shadowRoot.addEventListener("pointerup", (ev) => this._onWidgetPointerUp(ev));
    this.shadowRoot.addEventListener("pointercancel", (ev) => this._cancelWidgetPress(ev));
    this.shadowRoot.addEventListener("keydown", (ev) => this._onWidgetKeyDown(ev));
    this.shadowRoot.addEventListener("contextmenu", (ev) => {
      if (ev.target.closest?.("[data-widget-key]")) ev.preventDefault();
    });
  }

  set hass(value) {
    this._hass = value;
    if (!this._loaded && !this._loading) this._loadConfig();

    // Mientras Personalización está abierta, Home Assistant puede entregar
    // actualizaciones de estado varias veces por segundo. Redibujar el editor
    // completo en cada actualización destruía el DOM y regresaba el scroll al
    // inicio. Conservamos los estados nuevos en this._hass, pero pausamos el
    // render automático del panel hasta cerrar/guardar el editor. Los cambios
    // hechos por el usuario siguen forzando su propio render cuando hace falta.
    if (this._editorOpen) return;

    this._queueRender();
  }

  get hass() { return this._hass; }

  set panel(value) {
    this._panel = value;
    this._queueRender();
  }

  get panel() { return this._panel; }

  set narrow(value) {
    this._narrow = Boolean(value);
    this._queueRender();
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
      const result = await this._hass.callWS({ type: "smart_home_panel/config/get" });
      this._storedConfig = result?.config || {};
      this._backendOk = true;
    } catch (err) {
      console.error("Smart Home Panel: no se pudo cargar la configuración persistente", err);
      this._storedConfig = {};
      this._backendOk = false;
    } finally {
      this._loaded = true;
      this._loading = false;

      // Acceso de recuperación: un administrador puede abrir el editor directamente
      // usando /smart-home?settings=1 aunque una futura personalización o CSS oculte
      // accidentalmente el botón de engrane.
      try {
        const params = new URLSearchParams(window.location.search);
        if (this._hass?.user?.is_admin && (params.get("settings") === "1" || params.get("configure") === "1")) {
          this._editConfig = deepClone(this._config());
          this._editorOpen = true;
          this._editorTab = "general";
        }
      } catch (err) {
        console.debug("Smart Home Panel: no se pudo evaluar el modo de recuperación", err);
      }

      this._lastSignature = "";
      this._queueRender();
    }
  }

  _config() {
    const source = this._editorOpen && this._editConfig ? this._editConfig : this._storedConfig;
    const cfg = deepMerge(DEFAULTS, source || {});

    // Migra únicamente los placeholders históricos y solo cuando el sensor nuevo
    // realmente existe en Home Assistant. No modifica selecciones personalizadas.
    for (const [key, [legacyId, preferredId]] of Object.entries(LEGACY_ENTITY_MIGRATIONS)) {
      if (cfg?.[key]?.entity === legacyId && this._hass?.states?.[preferredId]) {
        cfg[key].entity = preferredId;
      }
    }
    return cfg;
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
    if (!stateObj) return { raw: "Entidad no encontrada", stateObj: null, isDemo: false, missing: true };
    return { raw: stateObj.state, stateObj, isDemo: false, missing: false };
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

  _mappedText(raw, widget) {
    const key = String(raw ?? "");
    const map = widget.state_map || {};
    return map[key] ?? map[key.toLowerCase()] ?? key;
  }

  _displayValue(data, widget, cfg) {
    if (data.missing) return "Entidad no encontrada";
    const numeric = this._numeric(data.raw, widget);
    if (numeric !== null) return this._formatNumber(numeric, widget.decimals, cfg.locale);
    return this._mappedText(data.raw, widget);
  }

  _unit(data, widget) {
    if (widget.unit === "auto") return data.stateObj?.attributes?.unit_of_measurement || "";
    return widget.unit || "";
  }

  _icon(icon, size, color) {
    if (!icon) return "";
    return `<ha-icon icon="${this._escape(icon)}" style="--mdc-icon-size:${this._cssSize(size, "26px")};color:${this._escape(color || "currentColor")}"></ha-icon>`;
  }

  _cardVars(widget, cfg) {
    const s = widget.style || {};
    const d = cfg.design;
    const take = (local, global) => (s[local] !== "" && s[local] !== undefined && s[local] !== null) ? s[local] : d[global];
    return [
      `--w-bg:${take("background", "card_background")}`,
      `--w-border:${take("border_color", "card_border_color")}`,
      `--w-border-width:${this._cssSize(take("border_width", "card_border_width"), "1px")}`,
      `--w-radius:${this._cssSize(take("border_radius", "card_radius"), "20px")}`,
      `--w-padding:${this._cssSize(take("padding", "card_padding"), "17px")}`,
      `--w-shadow:${d.card_shadow}`,
      `--w-height:${this._cssSize(s.height, "auto")}`,
      `--w-width:${this._cssSize(s.width, "100%")}`,
      `--w-align:${["left", "center", "right"].includes(s.align) ? s.align : "left"}`,
      `--w-justify:${s.align === "center" ? "center" : s.align === "right" ? "flex-end" : "flex-start"}`,
      `--icon-color:${s.icon_color || d.accent_color}`,
      `--icon-size:${this._cssSize(s.icon_size, "28px")}`,
      `--icon-bg:${s.icon_background || "transparent"}`,
      `--icon-box:${this._cssSize(s.icon_box_size, "50px")}`,
      `--label-color:${s.label_color || d.label_color}`,
      `--label-size:${this._cssSize(s.label_size, "13px")}`,
      `--label-weight:${s.label_weight || 500}`,
      `--value-color:${s.value_color || d.value_color}`,
      `--value-size:${this._cssSize(s.value_size, "27px")}`,
      `--value-weight:${s.value_weight || 600}`,
      `--unit-color:${s.unit_color || d.unit_color}`,
      `--unit-size:${this._cssSize(s.unit_size, "13px")}`,
      `--unit-weight:${s.unit_weight || 500}`,
    ].join(";");
  }

  _entityCard(widget, cfg, key) {
    if (!widget?.show) return "";
    const data = this._entityData(widget, cfg);
    const value = this._displayValue(data, widget, cfg);
    const unit = this._unit(data, widget);
    const s = widget.style || {};
    const interactive = this._hasWidgetAction(widget);
    return `
      <section class="entity-card ${data.missing ? "missing" : ""} ${interactive ? "interactive-surface" : ""}" style="${this._escape(this._cardVars(widget, cfg))}" ${interactive ? `data-widget-key="${this._escape(key)}" role="button" tabindex="0"` : ""}>
        <div class="entity-icon">${this._icon(widget.icon, s.icon_size, s.icon_color || cfg.design.accent_color)}</div>
        <div class="entity-content">
          <div class="entity-label">${this._escape(widget.label || "")}</div>
          <div class="entity-value-line">
            ${widget.prefix ? `<span class="entity-prefix">${this._escape(widget.prefix)}</span>` : ""}
            <span class="entity-value">${this._escape(value)}</span>
            ${unit ? `<span class="entity-unit">${this._escape(unit)}</span>` : ""}
          </div>
          ${data.missing && widget.entity ? `<div class="entity-id">${this._escape(widget.entity)}</div>` : ""}
        </div>
      </section>`;
  }

  _polar(cx, cy, r, degrees) {
    const rad = degrees * Math.PI / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  _arcPath(cx, cy, r, a1, a2) {
    const start = this._polar(cx, cy, r, a1);
    const end = this._polar(cx, cy, r, a2);
    const largeArc = Math.abs(a2 - a1) > 180 ? 1 : 0;
    const sweep = a2 >= a1 ? 1 : 0;
    return `M ${start.x.toFixed(3)} ${start.y.toFixed(3)} A ${r} ${r} 0 ${largeArc} ${sweep} ${end.x.toFixed(3)} ${end.y.toFixed(3)}`;
  }

  _rangeColor(value, gauge) {
    for (const range of gauge.ranges || []) {
      if (value >= this._num(range.from, gauge.min) && value <= this._num(range.to, gauge.max)) return range.color;
    }
    return gauge.needle_color;
  }

  _gauge(widget, cfg, key) {
    if (!widget?.show) return "";
    const data = this._entityData(widget, cfg);
    const numeric = data.missing ? null : this._numeric(data.raw, widget);
    const g = widget.gauge;
    const s = widget.style || {};

    const min = this._num(g.min, 0);
    const max = Math.max(min + 1, this._num(g.max, 10000));
    const startAngle = this._num(g.start_angle, 150);
    const endAngle = this._num(g.end_angle, 390);
    const span = endAngle - startAngle;
    const valid = numeric !== null && Number.isFinite(numeric);
    const clamped = this._clamp(valid ? numeric : min, min, max);
    const ratio = (clamped - min) / (max - min);
    const needleAngle = startAngle + ratio * span;

    const cx = 180;
    const cy = this._num(g.center_y, 135);
    const radius = this._num(g.radius, 104);
    const needleLength = this._num(g.needle_length, 78);
    const needleTip = this._polar(cx, cy, needleLength, needleAngle);
    const track = this._arcPath(cx, cy, radius, startAngle, endAngle);

    const rangePaths = (g.ranges || []).map((range) => {
      const from = this._clamp(this._num(range.from, min), min, max);
      const to = this._clamp(this._num(range.to, max), min, max);
      if (to <= from) return "";
      const a1 = startAngle + ((from - min) / (max - min)) * span;
      const a2 = startAngle + ((to - min) / (max - min)) * span;
      return `<path d="${this._arcPath(cx, cy, radius, a1, a2)}" fill="none" stroke="${this._escape(range.color || cfg.design.accent_color)}" stroke-width="${this._num(g.arc_thickness, 17)}" stroke-linecap="round"/>`;
    }).join("");

    let ticks = "";
    if (g.show_ticks) {
      const count = Math.max(2, Math.round(this._num(g.tick_count, 5)));
      for (let i = 0; i <= count; i++) {
        const tr = i / count;
        const angle = startAngle + tr * span;
        const p1 = this._polar(cx, cy, radius - 17, angle);
        const p2 = this._polar(cx, cy, radius - 5, angle);
        const pl = this._polar(cx, cy, radius - 34, angle);
        const tickValue = min + tr * (max - min);
        ticks += `
          <line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${this._escape(g.tick_color)}" stroke-width="2" stroke-linecap="round"/>
          <text x="${pl.x}" y="${pl.y}" text-anchor="middle" dominant-baseline="middle" fill="${this._escape(g.tick_label_color)}" font-size="${this._num(g.tick_label_size, 10)}">${this._escape(this._formatNumber(tickValue, 0, cfg.locale))}</text>`;
      }
    }

    const needleColor = g.needle_color_mode === "auto" ? this._rangeColor(clamped, g) : g.needle_color;
    const display = valid ? this._formatNumber(numeric, widget.decimals, cfg.locale) : (data.missing ? "—" : this._mappedText(data.raw, widget));
    const unit = this._unit(data, widget);

    const interactive = this._hasWidgetAction(widget);
    return `
      <section class="gauge-card ${data.missing ? "missing" : ""} ${interactive ? "interactive-surface" : ""}" style="${this._escape(this._cardVars(widget, cfg))}" ${interactive ? `data-widget-key="${this._escape(key)}" role="button" tabindex="0"` : ""}>
        <div class="gauge-heading">
          <div class="entity-icon gauge-heading-icon">${this._icon(widget.icon, s.icon_size, s.icon_color || cfg.design.accent_color)}</div>
          <div>
            <div class="entity-label">${this._escape(widget.label || "")}</div>
            ${data.missing && widget.entity ? `<div class="entity-id">${this._escape(widget.entity)}</div>` : ""}
          </div>
        </div>
        <div class="gauge-wrap" style="max-width:${this._cssSize(g.max_width, "380px")};height:${this._cssSize(g.svg_height, "330px")}">
          <svg class="gauge-svg" viewBox="0 0 360 330" role="img" aria-label="${this._escape(`${widget.label}: ${display} ${unit}`)}">
            <path d="${track}" fill="none" stroke="${this._escape(g.track_color)}" stroke-width="${this._num(g.arc_thickness, 17)}" stroke-linecap="round"/>
            ${rangePaths}
            ${ticks}
            <line x1="${cx}" y1="${cy}" x2="${needleTip.x}" y2="${needleTip.y}" stroke="${this._escape(needleColor || g.needle_color)}" stroke-width="${this._num(g.needle_width, 4)}" stroke-linecap="round" class="needle"/>
            <circle cx="${cx}" cy="${cy}" r="${this._num(g.hub_size, 7)}" fill="${this._escape(g.hub_color)}"/>
            ${g.show_numeric_value ? `
              <text x="180" y="${this._num(g.value_y, 270)}" text-anchor="middle" fill="${this._escape(g.value_color)}" font-size="${this._num(g.value_size, 38)}" font-weight="650">${this._escape(display)}</text>
              <text x="180" y="${this._num(g.unit_y, 296)}" text-anchor="middle" fill="${this._escape(g.unit_color)}" font-size="${this._num(g.unit_size, 14)}" font-weight="500">${this._escape(unit)}</text>` : ""}
          </svg>
        </div>
      </section>`;
  }

  _navigation(cfg) {
    const nav = cfg.navigation;
    if (!nav?.show) return "";
    const buttons = (nav.buttons || []).filter((b) => b.show);
    if (!buttons.length) return "";
    const current = window.location.pathname;
    return `
      <nav class="nav-grid" style="--nav-cols:${Math.max(1, this._num(nav.columns, 4))};--nav-gap:${this._cssSize(nav.gap, "8px")};--nav-h:${this._cssSize(nav.button_height, "58px")};--nav-radius:${this._cssSize(nav.radius, "16px")};--nav-bg:${this._escape(nav.background)};--nav-border:${this._escape(nav.border_color)};--nav-text:${this._escape(nav.text_color)};--nav-active:${this._escape(nav.active_color)};--nav-font:${this._cssSize(nav.font_size, "11px")}">
        ${buttons.map((b) => {
          const active = current === b.path || (b.path !== "/" && current.startsWith(`${b.path}/`));
          return `<button class="nav-button ${active ? "active" : ""}" data-nav-path="${this._escape(b.path || "/")}" title="${this._escape(b.label || "")}">
            ${this._icon(b.icon, nav.icon_size, b.color || (active ? nav.active_color : nav.text_color))}
            ${nav.show_labels ? `<span>${this._escape(b.label || "")}</span>` : ""}
          </button>`;
        }).join("")}
      </nav>`;
  }

  _header(cfg) {
    const h = cfg.header;
    const settingsButton = this._hass?.user?.is_admin
      ? `<button class="settings-button" data-action="open-editor" title="Personalización" aria-label="Abrir Personalización">${this._icon("mdi:cog", 25, cfg.design.label_color)}</button>`
      : "";

    // El acceso de administración NO depende de que el encabezado sea visible.
    // Así, ocultar el título/encabezado nunca bloquea la pantalla de Personalización.
    if (!h?.show) {
      return settingsButton ? `<div class="panel-admin-tools">${settingsButton}</div>` : "";
    }

    return `
      <header class="panel-header align-${this._escape(h.align || "left")}">
        <div class="header-main">
          <div class="header-icon">${this._icon(h.icon, h.icon_size, h.icon_color)}</div>
          <div>
            <div class="header-title" style="color:${this._escape(h.title_color)};font-size:${this._cssSize(h.title_size)}">${this._escape(h.title)}</div>
            <div class="header-subtitle" style="color:${this._escape(h.subtitle_color)};font-size:${this._cssSize(h.subtitle_size)}">${this._escape(h.subtitle)}</div>
          </div>
        </div>
        ${settingsButton}
      </header>`;
  }

  _hasDemo(cfg) {
    return [cfg.monthly_cost, cfg.season, cfg.tariff, cfg.power].some((w) => w?.show && cfg.demo_when_missing && !this._hass?.states?.[w.entity] && w.demo_value !== undefined);
  }

  _signature(cfg) {
    const ids = [cfg.monthly_cost?.entity, cfg.season?.entity, cfg.tariff?.entity, cfg.power?.entity].filter(Boolean);
    const states = ids.map((id) => [id, this._hass?.states?.[id]?.state ?? null, this._hass?.states?.[id]?.attributes?.unit_of_measurement ?? null]);
    return JSON.stringify([this._narrow, this._storedConfig, this._editorOpen, this._editorTab, states, this._backendOk]);
  }

  _captureEditorUiState() {
    if (!this._editorOpen || !this.shadowRoot) return null;
    const body = this.shadowRoot.querySelector('.editor-body');
    const pickerResults = this.shadowRoot.querySelector('.entity-results');
    const active = this.shadowRoot.activeElement;

    let focus = null;
    if (active) {
      const setting = active.getAttribute?.('data-setting');
      const id = active.id || null;
      const entitySearch = active.id === 'entity-search';
      if (setting || id || entitySearch) {
        focus = {
          setting,
          id,
          selectionStart: typeof active.selectionStart === 'number' ? active.selectionStart : null,
          selectionEnd: typeof active.selectionEnd === 'number' ? active.selectionEnd : null,
        };
      }
    }

    return {
      editorScrollTop: body?.scrollTop || 0,
      editorScrollLeft: body?.scrollLeft || 0,
      pickerScrollTop: pickerResults?.scrollTop || 0,
      focus,
    };
  }

  _restoreEditorUiState(state) {
    if (!state || !this._editorOpen || !this.shadowRoot) return;
    const body = this.shadowRoot.querySelector('.editor-body');
    if (body) {
      body.scrollTop = state.editorScrollTop || 0;
      body.scrollLeft = state.editorScrollLeft || 0;
    }

    const pickerResults = this.shadowRoot.querySelector('.entity-results');
    if (pickerResults) pickerResults.scrollTop = state.pickerScrollTop || 0;

    const focus = state.focus;
    if (!focus) return;
    let target = null;
    if (focus.setting) {
      target = [...this.shadowRoot.querySelectorAll('[data-setting]')]
        .find((el) => el.getAttribute('data-setting') === focus.setting);
    } else if (focus.id) {
      target = this.shadowRoot.getElementById(focus.id);
    }
    if (!target) return;
    try {
      target.focus({ preventScroll: true });
      if (focus.selectionStart !== null && typeof target.setSelectionRange === 'function') {
        target.setSelectionRange(focus.selectionStart, focus.selectionEnd ?? focus.selectionStart);
      }
    } catch (_) {
      // Algunos controles (color/range/select) no aceptan selección de texto.
    }
  }

  _render() {
    if (!this.shadowRoot) return;
    if (!this._hass || !this._panel || !this._loaded) {
      this.shadowRoot.innerHTML = `<style>:host{display:block;min-height:100%;background:#080d11;color:#fff;font-family:system-ui,sans-serif}.loading{padding:30px;text-align:center;opacity:.7}</style><div class="loading">Cargando panel…</div>`;
      return;
    }

    const cfg = this._config();
    const sig = this._signature(cfg);
    if (sig === this._lastSignature) return;
    this._lastSignature = sig;

    // Los renders que sí son necesarios dentro del editor (cambiar pestaña,
    // checkbox, color, agregar rango, etc.) conservan posición y foco.
    const editorUiState = this._captureEditorUiState();

    const d = cfg.design;
    const navTop = cfg.navigation?.show && cfg.navigation.position === "top";
    const navBottom = cfg.navigation?.show && cfg.navigation.position === "bottom";

    this.shadowRoot.innerHTML = `
      <style>${this._styles(cfg)}</style>
      <main class="page">
        ${this._header(cfg)}
        ${!this._backendOk ? `<div class="warning-badge">Backend no disponible · revisa smart_home_panel</div>` : ""}
        ${cfg.show_demo_badge && this._hasDemo(cfg) ? `<div class="demo-badge">Modo demo · selecciona tus entidades en Personalización</div>` : ""}
        ${navTop ? this._navigation(cfg) : ""}
        <div class="stack">
          ${this._entityCard(cfg.monthly_cost, cfg, "monthly_cost")}
          ${this._entityCard(cfg.season, cfg, "season")}
          ${this._entityCard(cfg.tariff, cfg, "tariff")}
          ${this._gauge(cfg.power, cfg, "power")}
        </div>
        ${navBottom ? this._navigation(cfg) : ""}
        <div class="version">v${PANEL_VERSION}</div>
      </main>
      ${this._editorOpen ? this._editor(cfg) : ""}
      ${this._entityPickerState ? this._entityPicker() : ""}
      ${this._toastMessage ? `<div class="toast ${this._toastType}">${this._escape(this._toastMessage)}</div>` : ""}
    `;

    this._restoreEditorUiState(editorUiState);
  }

  _styles(cfg) {
    const d = cfg.design;
    return `
      :host{display:block;min-height:100vh;min-height:100dvh;box-sizing:border-box;background:radial-gradient(circle at 50% -20%,${d.background_secondary} 0%,transparent 42%),${d.background};color:${d.value_color};font-family:${d.font_family};-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}
      *{box-sizing:border-box}button,input,select,textarea{font:inherit}
      .page{width:100%;min-height:100vh;min-height:100dvh;max-width:${this._cssSize(d.panel_max_width,"520px")};margin:0 auto;padding:max(${this._cssSize(d.panel_padding,"12px")},env(safe-area-inset-top)) max(${this._cssSize(d.panel_padding,"12px")},env(safe-area-inset-right)) max(${this._cssSize(d.panel_padding,"12px")},env(safe-area-inset-bottom)) max(${this._cssSize(d.panel_padding,"12px")},env(safe-area-inset-left))}
      .panel-header{min-height:76px;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:3px 3px 13px;position:relative}.header-main{display:flex;align-items:center;gap:12px;min-width:0;max-width:calc(100% - 56px)}.panel-header.align-left .header-main{text-align:left;margin-right:auto}.panel-header.align-center{justify-content:center}.panel-header.align-center .header-main{position:absolute;left:50%;transform:translateX(-50%);text-align:center;max-width:calc(100% - 112px)}.panel-header.align-center .settings-button{position:absolute;right:0}.panel-header.align-right .header-main{margin-left:auto;text-align:right}.header-icon{width:48px;height:48px;display:grid;place-items:center;flex:0 0 auto}.header-title{line-height:1.05;font-weight:730;letter-spacing:-.4px}.header-subtitle{margin-top:5px;line-height:1.2;font-weight:500}.panel-admin-tools{min-height:52px;display:flex;align-items:center;justify-content:flex-end;padding:2px 2px 8px}.settings-button{width:44px;height:44px;border:1px solid rgba(255,255,255,.06);border-radius:14px;background:rgba(255,255,255,.025);display:grid;place-items:center;cursor:pointer;flex:0 0 auto}.settings-button:hover{background:rgba(255,255,255,.07)}
      .demo-badge,.warning-badge{width:max-content;max-width:100%;margin:0 2px ${this._cssSize(d.gap,"12px")};padding:6px 10px;border-radius:999px;font-size:10px;font-weight:750;letter-spacing:.06em;text-transform:uppercase}.demo-badge{color:#f5a623;background:rgba(245,166,35,.10);border:1px solid rgba(245,166,35,.32)}.warning-badge{color:#ef7876;background:rgba(239,100,97,.10);border:1px solid rgba(239,100,97,.32)}
      .stack{display:grid;grid-template-columns:minmax(0,1fr);gap:${this._cssSize(d.gap,"12px")}}
      .entity-card,.gauge-card{width:var(--w-width);min-height:var(--w-height);padding:var(--w-padding);background:var(--w-bg);border:var(--w-border-width) solid var(--w-border);border-radius:var(--w-radius);box-shadow:var(--w-shadow);overflow:hidden}.interactive-surface{cursor:pointer;user-select:none;-webkit-tap-highlight-color:transparent;transition:transform .12s ease,border-color .12s ease,background-color .12s ease}.interactive-surface:active{transform:scale(.995)}.interactive-surface:focus-visible{outline:2px solid ${d.accent_color};outline-offset:2px}.entity-card{display:flex;align-items:center;justify-content:var(--w-justify);gap:14px;text-align:var(--w-align)}.entity-icon{width:var(--icon-box);height:var(--icon-box);min-width:var(--icon-box);display:grid;place-items:center;border-radius:15px;color:var(--icon-color);background:var(--icon-bg)}.entity-content{min-width:0;max-width:calc(100% - var(--icon-box) - 14px);flex:0 1 auto;text-align:var(--w-align)}.entity-label{text-align:var(--w-align);color:var(--label-color);font-size:var(--label-size);font-weight:var(--label-weight);line-height:1.25}.entity-value-line{margin-top:7px;display:flex;align-items:baseline;justify-content:var(--w-justify);flex-wrap:wrap;gap:5px}.entity-value,.entity-prefix{color:var(--value-color);font-size:var(--value-size);font-weight:var(--value-weight);line-height:1;letter-spacing:-.025em}.entity-unit{color:var(--unit-color);font-size:var(--unit-size);font-weight:var(--unit-weight)}.entity-id{margin-top:6px;color:#ef7876;font-size:10px;overflow-wrap:anywhere;text-align:var(--w-align)}.missing{border-color:rgba(239,100,97,.45)}
      .gauge-heading{display:flex;align-items:center;justify-content:var(--w-justify);gap:12px;margin-bottom:0;text-align:var(--w-align)}.gauge-heading-icon{width:var(--icon-box);height:var(--icon-box);min-width:var(--icon-box)}.gauge-wrap{width:100%;margin:0 auto;display:flex;align-items:center;justify-content:center}.gauge-svg{display:block;width:100%;height:100%;overflow:visible;font-family:${d.font_family}}.needle{filter:drop-shadow(0 0 4px rgba(255,255,255,.12));transition:x2 .25s ease,y2 .25s ease,stroke .25s ease}
      .nav-grid{display:grid;grid-template-columns:repeat(var(--nav-cols),minmax(0,1fr));gap:var(--nav-gap);margin:0 0 ${this._cssSize(d.gap,"12px")}}.stack + .nav-grid{margin-top:${this._cssSize(d.gap,"12px")}}.nav-button{min-width:0;height:var(--nav-h);border:1px solid var(--nav-border);border-radius:var(--nav-radius);background:var(--nav-bg);color:var(--nav-text);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;cursor:pointer;font-size:var(--nav-font);font-weight:600}.nav-button.active{color:var(--nav-active);border-color:color-mix(in srgb,var(--nav-active) 38%,var(--nav-border))}.nav-button span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}.nav-disabled-note,.nav-enabled-note{grid-column:1/-1;padding:9px 11px;border-radius:11px;font-size:11px;line-height:1.4}.nav-disabled-note{color:#f2b75c;background:rgba(246,183,60,.08);border:1px solid rgba(246,183,60,.24)}.nav-enabled-note{color:#64d7a0;background:rgba(102,209,122,.07);border:1px solid rgba(102,209,122,.20);width:max-content}.version{text-align:center;color:#50606a;font-size:9px;padding:10px 0 2px}
      .editor-backdrop{position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.72);display:flex;justify-content:flex-end}.editor{width:min(620px,100%);height:100%;background:#0b1116;color:#f5f7fa;border-left:1px solid #26323a;display:flex;flex-direction:column;box-shadow:-20px 0 60px rgba(0,0,0,.35)}.editor-top{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:14px 14px 10px;border-bottom:1px solid #202b32}.editor-title{font-size:20px;font-weight:700}.editor-actions{display:flex;gap:8px}.editor-btn{height:38px;padding:0 13px;border-radius:12px;border:1px solid #2b3942;background:#111a20;color:#e8edf1;cursor:pointer}.editor-btn.primary{border-color:#247f7a;background:#123b3a;color:#55e6df}.editor-btn.danger{border-color:#703332;color:#ef8a87}.editor-tabs{display:flex;gap:5px;overflow:auto;padding:10px 12px;border-bottom:1px solid #202b32}.editor-tab{height:36px;white-space:nowrap;padding:0 12px;border:0;border-radius:11px;background:transparent;color:#8e9ba5;cursor:pointer}.editor-tab.active{background:#122126;color:#42ddd5}.editor-body{flex:1;overflow:auto;padding:14px}.section{border:1px solid #26323a;border-radius:16px;background:#0f171c;margin-bottom:12px;overflow:hidden}.section-title{font-size:14px;font-weight:700;padding:13px 14px;border-bottom:1px solid #202b32}.section-content{padding:13px;display:grid;gap:12px}.field-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:11px}.field{display:grid;gap:6px;min-width:0}.field.full{grid-column:1/-1}.field label{font-size:11px;color:#8d9aa4;font-weight:650}.control{width:100%;height:39px;border-radius:11px;border:1px solid #2a3740;background:#0a1014;color:#ecf1f4;padding:0 10px;outline:none}.control:focus{border-color:#2aaea7}.control[type=color]{padding:4px;height:39px}.control[type=range]{padding:0;border:0;background:transparent}.checkbox-row{display:flex;align-items:center;gap:9px;min-height:39px}.checkbox-row input{width:18px;height:18px}.range-readout{font-size:11px;color:#6f7d86;text-align:right}.help{font-size:11px;line-height:1.45;color:#71808a}.item-card{border:1px solid #26323a;border-radius:13px;padding:11px;display:grid;gap:10px;background:#0b1217}.item-head{display:flex;align-items:center;justify-content:space-between;gap:8px}.item-name{font-size:12px;font-weight:700}.icon-preview{display:inline-grid;place-items:center;width:34px;height:34px;border-radius:10px;background:#111e24}.row-actions{display:flex;gap:7px}.tiny-btn{height:32px;padding:0 10px;border:1px solid #2b3942;border-radius:10px;background:#111a20;color:#d9e0e5;cursor:pointer}.json-area{width:100%;min-height:420px;resize:vertical;border:1px solid #2a3740;border-radius:12px;background:#080d11;color:#dfe7eb;padding:12px;font:12px/1.45 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}.editor-footer{padding:10px 14px;border-top:1px solid #202b32;display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:10px;color:#66757f}.toast{position:fixed;z-index:10001;left:50%;bottom:24px;transform:translateX(-50%);max-width:min(90vw,480px);padding:10px 14px;border-radius:12px;background:#142027;border:1px solid #2e414c;color:#e9f0f3;font-size:12px;box-shadow:0 12px 30px rgba(0,0,0,.35)}.toast.error{border-color:#713b3a;color:#f3a09d}
      .entity-select{grid-column:1/-1}.entity-select-button{width:100%;min-height:66px;padding:10px 12px;border:1px solid #2b3942;border-radius:12px;background:#0d151a;color:#e8edf1;display:grid;grid-template-columns:36px minmax(0,1fr) 22px;align-items:center;gap:10px;text-align:left;cursor:pointer}.entity-select-button:hover{border-color:#3b525d;background:#101b21}.entity-select-icon{width:36px;height:36px;border-radius:10px;background:rgba(53,221,213,.08);display:grid;place-items:center;color:#35ddd5}.entity-select-main{min-width:0}.entity-select-name{font-size:13px;font-weight:650;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.entity-select-id{margin-top:3px;color:#7f8c96;font-size:10px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.entity-select-state{margin-top:3px;color:#aeb8bf;font-size:11px}.entity-select-arrow{color:#6e7c86;font-size:18px;text-align:center}.entity-picker-backdrop{position:fixed;inset:0;z-index:10050;background:rgba(0,0,0,.78);display:flex;align-items:flex-end;justify-content:center;padding:0}.entity-picker{width:min(620px,100%);height:min(86dvh,760px);background:#0b1116;border:1px solid #26323a;border-bottom:0;border-radius:22px 22px 0 0;box-shadow:0 -20px 60px rgba(0,0,0,.42);display:flex;flex-direction:column;overflow:hidden}.entity-picker-top{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;padding:15px 15px 11px;border-bottom:1px solid #202b32}.entity-picker-title{font-size:18px;font-weight:720}.entity-picker-subtitle{margin-top:3px;color:#83919b;font-size:11px}.entity-picker-close{width:38px;height:38px;border:1px solid #2b3942;border-radius:12px;background:#111a20;color:#dfe6ea;cursor:pointer}.entity-picker-tools{padding:12px;border-bottom:1px solid #202b32;display:grid;gap:9px}.entity-search{width:100%;height:42px;border:1px solid #2b3942;border-radius:12px;background:#0d151a;color:#f2f5f7;padding:0 12px;outline:none}.entity-search:focus{border-color:#2a8c87}.entity-filter-tabs{display:flex;gap:7px}.entity-filter-btn{height:34px;padding:0 11px;border:1px solid #2b3942;border-radius:999px;background:#10181e;color:#8f9ca5;cursor:pointer;font-size:11px}.entity-filter-btn.active{border-color:#257c78;background:#123332;color:#55e6df}.entity-results{flex:1;overflow:auto;padding:8px}.entity-option{width:100%;min-height:64px;padding:9px 10px;border:0;border-bottom:1px solid #1b252b;background:transparent;color:#edf2f5;display:grid;grid-template-columns:38px minmax(0,1fr) auto;align-items:center;gap:10px;text-align:left;cursor:pointer}.entity-option:hover{background:#101a20;border-radius:11px}.entity-option.selected{background:rgba(53,221,213,.07);border-radius:11px}.entity-option-icon{width:38px;height:38px;border-radius:11px;background:#111c22;display:grid;place-items:center;color:#35ddd5}.entity-option-main{min-width:0}.entity-option-name{font-size:13px;font-weight:650;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.entity-option-id{margin-top:3px;color:#71808a;font-size:10px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.entity-option-state{max-width:120px;text-align:right;color:#aeb8bf;font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.entity-empty{padding:30px 12px;text-align:center;color:#78858e;font-size:12px}.entity-picker-manual{padding:10px 12px max(12px,env(safe-area-inset-bottom));border-top:1px solid #202b32}.entity-manual-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px}.entity-manual-input{height:40px;border:1px solid #2b3942;border-radius:11px;background:#0d151a;color:#e9eef1;padding:0 11px;min-width:0}.entity-manual-btn{height:40px;border:1px solid #267d78;border-radius:11px;background:#123332;color:#55e6df;padding:0 12px;cursor:pointer}.entity-count{color:#70808a;font-size:10px;margin-left:auto;align-self:center}
      @media(max-width:560px){.page{max-width:100%;padding-left:10px;padding-right:10px}.panel-header{min-height:70px}.header-icon{width:44px;height:44px}.entity-card{gap:12px}.editor{border-left:0}.field-grid{grid-template-columns:1fr}.field.full{grid-column:auto}.editor-top{padding-top:max(14px,env(safe-area-inset-top))}.nav-grid{grid-template-columns:repeat(min(var(--nav-cols),4),minmax(0,1fr))}}
      @media(max-width:370px){.page{padding-left:8px;padding-right:8px}.entity-value,.entity-prefix{font-size:min(var(--value-size),34px)}.nav-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
      @media(prefers-reduced-motion:reduce){.needle{transition:none}}
    `;
  }

  _editor(cfg) {
    const tabs = [
      ["general", "General"],
      ["cards", "Tarjetas"],
      ["gauge", "Tacómetro"],
      ["navigation", "Navegación"],
      ["advanced", "Avanzado"],
    ];
    return `
      <div class="editor-backdrop">
        <section class="editor" role="dialog" aria-modal="true" aria-label="Personalización">
          <div class="editor-top">
            <div>
              <div class="editor-title">Personalización</div>
              <div class="help">Cambios visuales y entidades sin editar YAML.</div>
            </div>
            <div class="editor-actions">
              <button class="editor-btn" data-action="close-editor">Cancelar</button>
              <button class="editor-btn primary" data-action="save-config">Guardar</button>
            </div>
          </div>
          <div class="editor-tabs">
            ${tabs.map(([id,label]) => `<button class="editor-tab ${this._editorTab === id ? "active" : ""}" data-action="tab" data-tab="${id}">${label}</button>`).join("")}
          </div>
          <div class="editor-body">
            ${this._editorTab === "general" ? this._editorGeneral(cfg) : ""}
            ${this._editorTab === "cards" ? this._editorCards(cfg) : ""}
            ${this._editorTab === "gauge" ? this._editorGauge(cfg) : ""}
            ${this._editorTab === "navigation" ? this._editorNavigation(cfg) : ""}
            ${this._editorTab === "advanced" ? this._editorAdvanced(cfg) : ""}
          </div>
          <div class="editor-footer">
            <span>Los cambios se guardan en .storage mediante el backend.</span>
            <div class="row-actions">
              <button class="tiny-btn" data-action="export-config">Exportar</button>
              <button class="tiny-btn" data-action="import-config">Importar</button>
              <button class="tiny-btn" data-action="reset-config">Restablecer</button>
              <input id="import-file" type="file" accept="application/json,.json" hidden>
            </div>
          </div>
        </section>
      </div>`;
  }

  _section(title, body) {
    return `<section class="section"><div class="section-title">${this._escape(title)}</div><div class="section-content">${body}</div></section>`;
  }

  _entityDisplay(entityId) {
    const stateObj = this._hass?.states?.[entityId];
    if (!stateObj) {
      return {
        id: entityId || "",
        name: entityId ? "Entidad no encontrada" : "Seleccionar entidad",
        state: entityId ? "No disponible" : "Toca para buscar",
        icon: "mdi:magnify",
      };
    }
    const unit = stateObj.attributes?.unit_of_measurement || "";
    return {
      id: entityId,
      name: stateObj.attributes?.friendly_name || entityId,
      state: `${stateObj.state}${unit ? ` ${unit}` : ""}`,
      icon: stateObj.attributes?.icon || this._entityDefaultIcon(entityId, stateObj),
    };
  }

  _entityDefaultIcon(entityId, stateObj) {
    const domain = String(entityId || "").split(".")[0];
    const dc = stateObj?.attributes?.device_class;
    if (dc === "power") return "mdi:flash";
    if (domain === "sensor") return "mdi:gauge";
    if (domain === "select" || domain === "input_select") return "mdi:form-dropdown";
    if (domain === "input_text") return "mdi:form-textbox";
    return "mdi:circle-outline";
  }

  _entitySelect(path, label, value, profile = "all") {
    const item = this._entityDisplay(value);
    return `<div class="field full entity-select">
      <label>${this._escape(label)}</label>
      <button type="button" class="entity-select-button" data-action="open-entity-picker" data-path="${this._escape(path)}" data-profile="${this._escape(profile)}">
        <span class="entity-select-icon">${this._icon(item.icon,22,"#35ddd5")}</span>
        <span class="entity-select-main">
          <span class="entity-select-name">${this._escape(item.name)}</span>
          <span class="entity-select-id">${this._escape(item.id || "Sin entidad")}</span>
          <span class="entity-select-state">${this._escape(item.state)}</span>
        </span>
        <span class="entity-select-arrow">⌄</span>
      </button>
    </div>`;
  }

  _entityMatchesProfile(entityId, stateObj, profile) {
    if (!profile || profile === "all") return true;
    const filter = ENTITY_FILTERS[profile];
    if (!filter) return true;
    const domain = String(entityId).split(".")[0];
    const dc = String(stateObj?.attributes?.device_class || "").toLowerCase();
    const unit = String(stateObj?.attributes?.unit_of_measurement || "");
    const friendly = String(stateObj?.attributes?.friendly_name || "");
    const haystack = `${entityId} ${friendly} ${dc} ${unit}`.toLowerCase();

    const domainMatch = !filter.domains?.length || filter.domains.includes(domain);
    const classMatch = filter.device_classes?.some((x) => dc === String(x).toLowerCase());
    const unitMatch = filter.units?.some((x) => unit.toLowerCase() === String(x).toLowerCase());
    const keywordMatch = filter.keywords?.some((x) => haystack.includes(String(x).toLowerCase()));

    // El dominio válido es obligatorio; después basta con clase, unidad o palabra clave.
    // Para temporada/tarifa, donde device_class/unidad no suelen existir, las palabras
    // clave hacen el filtrado útil sin excluir sensores template personalizados.
    return domainMatch && (classMatch || unitMatch || keywordMatch);
  }

  _entityScore(entityId, stateObj, profile, query = "") {
    const filter = ENTITY_FILTERS[profile] || {};
    const friendly = String(stateObj?.attributes?.friendly_name || entityId);
    const dc = String(stateObj?.attributes?.device_class || "").toLowerCase();
    const unit = String(stateObj?.attributes?.unit_of_measurement || "").toLowerCase();
    const haystack = `${friendly} ${entityId}`.toLowerCase();
    let score = 0;
    if (this._entityMatchesProfile(entityId, stateObj, profile)) score += 100;
    if (filter.device_classes?.some((x) => dc === String(x).toLowerCase())) score += 50;
    if (filter.units?.some((x) => unit === String(x).toLowerCase())) score += 35;
    for (const kw of filter.keywords || []) if (haystack.includes(String(kw).toLowerCase())) score += 12;
    if (query) {
      const q = query.toLowerCase();
      if (entityId.toLowerCase() === q || friendly.toLowerCase() === q) score += 100;
      else if (entityId.toLowerCase().startsWith(q) || friendly.toLowerCase().startsWith(q)) score += 40;
      else if (haystack.includes(q)) score += 20;
    }
    return score;
  }

  _entityCandidates() {
    const picker = this._entityPickerState;
    if (!picker) return [];
    const q = String(picker.search || "").trim().toLowerCase();
    const current = this._getPath(this._editConfig || {}, picker.path) || "";
    const entries = Object.entries(this._hass?.states || {});
    const rows = [];
    for (const [entityId, stateObj] of entries) {
      const friendly = String(stateObj?.attributes?.friendly_name || entityId);
      const searchable = `${friendly} ${entityId} ${stateObj?.state || ""} ${stateObj?.attributes?.unit_of_measurement || ""}`.toLowerCase();
      if (q && !searchable.includes(q)) continue;
      const recommended = this._entityMatchesProfile(entityId, stateObj, picker.profile);
      if (!picker.showAll && !recommended && entityId !== current) continue;
      rows.push({ entityId, stateObj, friendly, recommended, score: this._entityScore(entityId, stateObj, picker.profile, q) });
    }
    rows.sort((a,b) => (b.score - a.score) || a.friendly.localeCompare(b.friendly, "es", { sensitivity: "base" }));
    return rows.slice(0, q ? 250 : 150);
  }

  _entityPickerResultsHtml() {
    const picker = this._entityPickerState;
    if (!picker) return "";
    const current = this._getPath(this._editConfig || {}, picker.path) || "";
    const rows = this._entityCandidates();
    if (!rows.length) return `<div class="entity-empty">No encontré entidades con ese filtro. Prueba “Todas” o escribe el entity_id manualmente.</div>`;
    return rows.map(({entityId,stateObj,friendly,recommended}) => {
      const unit = stateObj.attributes?.unit_of_measurement || "";
      const icon = stateObj.attributes?.icon || this._entityDefaultIcon(entityId, stateObj);
      const state = `${stateObj.state}${unit ? ` ${unit}` : ""}`;
      return `<button type="button" class="entity-option ${entityId === current ? "selected" : ""}" data-action="select-entity" data-entity-id="${this._escape(entityId)}">
        <span class="entity-option-icon">${this._icon(icon,22,recommended ? "#35ddd5" : "#87949d")}</span>
        <span class="entity-option-main">
          <span class="entity-option-name">${this._escape(friendly)}</span>
          <span class="entity-option-id">${this._escape(entityId)}</span>
        </span>
        <span class="entity-option-state">${this._escape(state)}</span>
      </button>`;
    }).join("");
  }

  _entityPicker() {
    const picker = this._entityPickerState;
    if (!picker) return "";
    const filter = ENTITY_FILTERS[picker.profile] || { title: "Entidad" };
    const count = this._entityCandidates().length;
    return `<div class="entity-picker-backdrop">
      <section class="entity-picker" role="dialog" aria-modal="true" aria-label="Seleccionar entidad">
        <div class="entity-picker-top">
          <div><div class="entity-picker-title">Seleccionar entidad</div><div class="entity-picker-subtitle">${this._escape(filter.title || "Entidad")} · busca por nombre, ID o estado</div></div>
          <button class="entity-picker-close" data-action="close-entity-picker" aria-label="Cerrar">✕</button>
        </div>
        <div class="entity-picker-tools">
          <input class="entity-search" id="entity-search" type="search" placeholder="Buscar entidad…" value="${this._escape(picker.search || "")}" autocomplete="off">
          <div class="entity-filter-tabs">
            <button class="entity-filter-btn ${!picker.showAll ? "active" : ""}" data-action="entity-filter" data-mode="recommended">Recomendadas</button>
            <button class="entity-filter-btn ${picker.showAll ? "active" : ""}" data-action="entity-filter" data-mode="all">Todas</button>
            <span class="entity-count">${count} resultados</span>
          </div>
        </div>
        <div class="entity-results" id="entity-results">${this._entityPickerResultsHtml()}</div>
        <div class="entity-picker-manual">
          <div class="entity-manual-row">
            <input class="entity-manual-input" id="entity-manual-id" type="text" placeholder="sensor.mi_entidad" value="${this._escape(this._getPath(this._editConfig || {}, picker.path) || "")}">
            <button class="entity-manual-btn" data-action="use-manual-entity">Usar ID</button>
          </div>
        </div>
      </section>
    </div>`;
  }

  _refreshEntityPickerResults() {
    if (!this._entityPickerState) return;
    const results = this.shadowRoot.getElementById("entity-results");
    if (results) results.innerHTML = this._entityPickerResultsHtml();
    const count = this.shadowRoot.querySelector(".entity-count");
    if (count) count.textContent = `${this._entityCandidates().length} resultados`;
  }

  _input(path, label, value, opts = {}) {
    const type = opts.type || "text";
    const full = opts.full ? " full" : "";
    const list = opts.list ? ` list="${opts.list}"` : "";
    const min = opts.min !== undefined ? ` min="${opts.min}"` : "";
    const max = opts.max !== undefined ? ` max="${opts.max}"` : "";
    const step = opts.step !== undefined ? ` step="${opts.step}"` : "";
    if (type === "checkbox") {
      return `<div class="field${full}"><label>${this._escape(label)}</label><div class="checkbox-row"><input type="checkbox" data-setting="${this._escape(path)}" data-value-type="boolean" ${value ? "checked" : ""}><span>${value ? "Activado" : "Desactivado"}</span></div></div>`;
    }
    if (type === "select") {
      const options = (opts.options || []).map(([v,l]) => `<option value="${this._escape(v)}" ${String(value)===String(v)?"selected":""}>${this._escape(l)}</option>`).join("");
      return `<div class="field${full}"><label>${this._escape(label)}</label><select class="control" data-setting="${this._escape(path)}" data-value-type="string">${options}</select></div>`;
    }
    return `<div class="field${full}"><label>${this._escape(label)}</label><input class="control" type="${this._escape(type)}" value="${this._escape(value)}" data-setting="${this._escape(path)}" data-value-type="${this._escape(opts.valueType || (type === "number" || type === "range" ? "number" : "string"))}"${list}${min}${max}${step}>${type === "range" ? `<div class="range-readout">${this._escape(value)}</div>` : ""}</div>`;
  }

  _color(path, label, value) {
    const safe = /^#[0-9a-f]{6}$/i.test(String(value || "")) ? value : "#000000";
    return `<div class="field"><label>${this._escape(label)}</label><div style="display:grid;grid-template-columns:48px 1fr;gap:7px"><input class="control" type="color" value="${this._escape(safe)}" data-setting="${this._escape(path)}" data-value-type="string"><input class="control" type="text" value="${this._escape(value)}" data-setting="${this._escape(path)}" data-value-type="string"></div></div>`;
  }

  _editorGeneral(cfg) {
    const h = cfg.header, d = cfg.design;
    return [
      this._section("Encabezado", `<div class="field-grid">
        ${this._input("header.show","Mostrar encabezado",h.show,{type:"checkbox"})}
        ${this._input("header.title","Título",h.title)}
        ${this._input("header.subtitle","Subtítulo",h.subtitle)}
        ${this._input("header.icon","Icono MDI",h.icon)}
        ${this._color("header.icon_color","Color del icono",h.icon_color)}
        ${this._color("header.title_color","Color del título",h.title_color)}
        ${this._color("header.subtitle_color","Color del subtítulo",h.subtitle_color)}
        ${this._input("header.title_size","Tamaño título",h.title_size,{type:"range",min:18,max:42,step:1})}
        ${this._input("header.subtitle_size","Tamaño subtítulo",h.subtitle_size,{type:"range",min:10,max:24,step:1})}
        ${this._input("header.icon_size","Tamaño icono",h.icon_size,{type:"range",min:18,max:52,step:1})}
        ${this._input("header.align","Alineación",h.align,{type:"select",options:[["left","Izquierda"],["center","Centro"],["right","Derecha"]]})}
      </div>`),
      this._section("Diseño global", `<div class="field-grid">
        ${this._color("design.background","Fondo",d.background)}
        ${this._color("design.background_secondary","Fondo secundario",d.background_secondary)}
        ${this._input("design.panel_max_width","Ancho máximo del panel",d.panel_max_width,{type:"range",min:340,max:760,step:10})}
        ${this._input("design.panel_padding","Padding del panel",d.panel_padding,{type:"range",min:4,max:36,step:1})}
        ${this._input("design.gap","Separación",d.gap,{type:"range",min:4,max:30,step:1})}
        ${this._input("design.font_family","Fuente / font-family",d.font_family,{full:true})}
        ${this._color("design.card_background","Fondo de tarjetas",d.card_background)}
        ${this._color("design.card_border_color","Borde de tarjetas",d.card_border_color)}
        ${this._input("design.card_border_width","Grosor de borde",d.card_border_width,{type:"range",min:0,max:4,step:1})}
        ${this._input("design.card_radius","Radio de esquinas",d.card_radius,{type:"range",min:0,max:40,step:1})}
        ${this._input("design.card_padding","Padding de tarjetas",d.card_padding,{type:"range",min:8,max:36,step:1})}
        ${this._color("design.label_color","Color de etiquetas",d.label_color)}
        ${this._color("design.value_color","Color de valores",d.value_color)}
        ${this._color("design.unit_color","Color de unidades",d.unit_color)}
        ${this._color("design.accent_color","Color principal",d.accent_color)}
        ${this._input("demo_when_missing","Usar datos demo si falta entidad",cfg.demo_when_missing,{type:"checkbox"})}
        ${this._input("show_demo_badge","Mostrar aviso de demo",cfg.show_demo_badge,{type:"checkbox"})}
      </div>`),
    ].join("");
  }

  _hasWidgetAction(widget) {
    const tap = widget?.tap_action?.action || "none";
    const hold = widget?.hold_action?.action || "none";
    return tap !== "none" || hold !== "none";
  }

  _actionOptions() {
    return [
      ["more-info", "Más información (popup nativo)"],
      ["none", "No hacer nada"],
      ["navigate", "Navegar dentro de Home Assistant"],
      ["url", "Abrir URL"],
      ["toggle", "Alternar entidad (toggle)"],
    ];
  }

  _actionEditor(key, widget) {
    const tap = widget.tap_action || { action: "more-info", navigation_path: "", url_path: "" };
    const hold = widget.hold_action || { action: "none", navigation_path: "", url_path: "" };
    return this._section(`Acciones · ${widget.label || key}`, `<div class="help">El toque corto y la pulsación mantenida son independientes. “Más información” abre el popup nativo de Home Assistant con historial y detalles de la entidad. La pulsación mantenida se reconoce a partir de 0.5 segundos, igual que las acciones nativas.</div><div class="field-grid">
      ${this._input(`${key}.tap_action.action`,"Un clic / toque",tap.action || "more-info",{type:"select",options:this._actionOptions(),full:true})}
      ${this._input(`${key}.tap_action.navigation_path`,"Ruta al tocar (solo Navegar)",tap.navigation_path || "",{full:true})}
      ${this._input(`${key}.tap_action.url_path`,"URL al tocar (solo Abrir URL)",tap.url_path || "",{full:true})}
      ${this._input(`${key}.hold_action.action`,"Mantener presionado",hold.action || "none",{type:"select",options:this._actionOptions(),full:true})}
      ${this._input(`${key}.hold_action.navigation_path`,"Ruta al mantener (solo Navegar)",hold.navigation_path || "",{full:true})}
      ${this._input(`${key}.hold_action.url_path`,"URL al mantener (solo Abrir URL)",hold.url_path || "",{full:true})}
    </div>`);
  }

  _cardEditor(key, title, cfg) {
    const w = cfg[key], s = w.style;
    return this._section(title, `<div class="field-grid">
      ${this._input(`${key}.show`,"Mostrar",w.show,{type:"checkbox"})}
      ${this._entitySelect(`${key}.entity`,"Entidad",w.entity,key === "monthly_cost" ? "cost" : key === "season" ? "season" : "tariff")}
      ${this._input(`${key}.label`,"Título",w.label)}
      ${this._input(`${key}.icon`,"Icono MDI",w.icon)}
      ${this._input(`${key}.prefix`,"Prefijo",w.prefix ?? "")}
      ${this._input(`${key}.unit`,"Unidad",w.unit ?? "")}
      ${this._input(`${key}.decimals`,"Decimales",w.decimals,{type:"number",min:0,max:6,step:1})}
      ${this._input(`${key}.multiplier`,"Multiplicador",w.multiplier,{type:"number",step:"0.001"})}
      ${this._input(`${key}.style.height`,"Altura",s.height,{type:"range",min:70,max:220,step:2})}
      ${this._input(`${key}.style.padding`,"Padding",s.padding || cfg.design.card_padding,{type:"range",min:6,max:36,step:1})}
      ${this._input(`${key}.style.align`,"Alineación de icono, título y valor",s.align,{type:"select",options:[["left","Izquierda"],["center","Centro"],["right","Derecha"]],full:true})}
      ${this._color(`${key}.style.background`,"Fondo (vacío = global)",s.background || cfg.design.card_background)}
      ${this._color(`${key}.style.border_color`,"Color de borde",s.border_color || cfg.design.card_border_color)}
      ${this._input(`${key}.style.border_width`,"Grosor borde",s.border_width === "" ? cfg.design.card_border_width : s.border_width,{type:"range",min:0,max:4,step:1})}
      ${this._input(`${key}.style.border_radius`,"Radio",s.border_radius === "" ? cfg.design.card_radius : s.border_radius,{type:"range",min:0,max:40,step:1})}
      ${this._color(`${key}.style.icon_color`,"Color icono",s.icon_color)}
      ${this._input(`${key}.style.icon_size`,"Tamaño icono",s.icon_size,{type:"range",min:16,max:54,step:1})}
      ${this._input(`${key}.style.icon_box_size`,"Caja de icono",s.icon_box_size,{type:"range",min:34,max:80,step:1})}
      ${this._color(`${key}.style.label_color`,"Color etiqueta",s.label_color || cfg.design.label_color)}
      ${this._input(`${key}.style.label_size`,"Tamaño etiqueta",s.label_size,{type:"range",min:10,max:26,step:1})}
      ${this._color(`${key}.style.value_color`,"Color valor",s.value_color || cfg.design.value_color)}
      ${this._input(`${key}.style.value_size`,"Tamaño valor",s.value_size,{type:"range",min:18,max:62,step:1})}
      ${this._input(`${key}.style.value_weight`,"Peso valor",s.value_weight,{type:"range",min:300,max:900,step:50})}
      ${this._color(`${key}.style.unit_color`,"Color unidad",s.unit_color || cfg.design.unit_color)}
      ${this._input(`${key}.style.unit_size`,"Tamaño unidad",s.unit_size,{type:"range",min:9,max:28,step:1})}
    </div>`) + this._actionEditor(key, w);
  }

  _editorCards(cfg) {
    return this._cardEditor("monthly_cost","Costo mensual",cfg) + this._cardEditor("season","Temporada",cfg) + this._cardEditor("tariff","Rango de tarifa",cfg);
  }

  _editorGauge(cfg) {
    const w = cfg.power, g = w.gauge, s = w.style;
    const ranges = (g.ranges || []).map((r,i) => `
      <div class="item-card">
        <div class="item-head"><span class="item-name">Rango ${i+1}</span><button class="tiny-btn" data-action="remove-range" data-index="${i}">Eliminar</button></div>
        <div class="field-grid">
          ${this._input(`power.gauge.ranges.${i}.from`,"Desde",r.from,{type:"number",step:1})}
          ${this._input(`power.gauge.ranges.${i}.to`,"Hasta",r.to,{type:"number",step:1})}
          ${this._color(`power.gauge.ranges.${i}.color`,"Color",r.color)}
        </div>
      </div>`).join("");

    return [
      this._section("Entidad y tarjeta", `<div class="field-grid">
        ${this._input("power.show","Mostrar",w.show,{type:"checkbox"})}
        ${this._entitySelect("power.entity","Entidad de potencia",w.entity,"power")}
        ${this._input("power.label","Título",w.label)}
        ${this._input("power.icon","Icono MDI",w.icon)}
        ${this._input("power.unit","Unidad",w.unit)}
        ${this._input("power.decimals","Decimales",w.decimals,{type:"number",min:0,max:6,step:1})}
        ${this._input("power.multiplier","Multiplicador",w.multiplier,{type:"number",step:"0.001"})}
        ${this._color("power.style.icon_color","Color icono",s.icon_color)}
        ${this._input("power.style.icon_size","Tamaño icono",s.icon_size,{type:"range",min:16,max:52,step:1})}
        ${this._color("power.style.label_color","Color título",s.label_color || cfg.design.label_color)}
        ${this._input("power.style.label_size","Tamaño título",s.label_size,{type:"range",min:10,max:26,step:1})}
        ${this._input("power.style.align","Alineación del encabezado del tacómetro",s.align,{type:"select",options:[["left","Izquierda"],["center","Centro"],["right","Derecha"]],full:true})}
        ${this._color("power.style.background","Fondo",s.background || cfg.design.card_background)}
        ${this._color("power.style.border_color","Borde",s.border_color || cfg.design.card_border_color)}
        ${this._input("power.style.border_radius","Radio",s.border_radius === "" ? cfg.design.card_radius : s.border_radius,{type:"range",min:0,max:40,step:1})}
        ${this._input("power.style.padding","Padding",s.padding,{type:"range",min:6,max:36,step:1})}
      </div>`),
      this._section("Geometría del tacómetro", `<div class="field-grid">
        ${this._input("power.gauge.min","Mínimo",g.min,{type:"number",step:1})}
        ${this._input("power.gauge.max","Máximo",g.max,{type:"number",step:1})}
        ${this._input("power.gauge.max_width","Ancho máximo",g.max_width,{type:"range",min:260,max:520,step:5})}
        ${this._input("power.gauge.svg_height","Altura",g.svg_height,{type:"range",min:260,max:430,step:5})}
        ${this._input("power.gauge.center_y","Centro vertical",g.center_y,{type:"range",min:100,max:180,step:1})}
        ${this._input("power.gauge.radius","Radio del arco",g.radius,{type:"range",min:75,max:125,step:1})}
        ${this._input("power.gauge.start_angle","Ángulo inicial",g.start_angle,{type:"number",step:1})}
        ${this._input("power.gauge.end_angle","Ángulo final",g.end_angle,{type:"number",step:1})}
        ${this._input("power.gauge.arc_thickness","Grosor del arco",g.arc_thickness,{type:"range",min:4,max:34,step:1})}
        ${this._input("power.gauge.needle_length","Largo aguja",g.needle_length,{type:"range",min:40,max:105,step:1})}
        ${this._input("power.gauge.needle_width","Grosor aguja",g.needle_width,{type:"range",min:1,max:10,step:1})}
        ${this._input("power.gauge.hub_size","Centro aguja",g.hub_size,{type:"range",min:3,max:16,step:1})}
        ${this._input("power.gauge.tick_count","Cantidad de marcas",g.tick_count,{type:"range",min:2,max:12,step:1})}
        ${this._input("power.gauge.tick_label_size","Tamaño números escala",g.tick_label_size,{type:"range",min:7,max:18,step:1})}
        ${this._input("power.gauge.value_y","Posición vertical del valor",g.value_y,{type:"range",min:220,max:315,step:1})}
        ${this._input("power.gauge.unit_y","Posición vertical de unidad",g.unit_y,{type:"range",min:240,max:325,step:1})}
        ${this._input("power.gauge.value_size","Tamaño del valor",g.value_size,{type:"range",min:22,max:60,step:1})}
        ${this._input("power.gauge.unit_size","Tamaño unidad",g.unit_size,{type:"range",min:9,max:24,step:1})}
      </div>`),
      this._section("Colores y comportamiento", `<div class="field-grid">
        ${this._color("power.gauge.track_color","Pista",g.track_color)}
        ${this._input("power.gauge.needle_color_mode","Color de aguja",g.needle_color_mode,{type:"select",options:[["auto","Automático por rango"],["fixed","Color fijo"]]})}
        ${this._color("power.gauge.needle_color","Aguja fija",g.needle_color)}
        ${this._color("power.gauge.hub_color","Centro",g.hub_color)}
        ${this._color("power.gauge.tick_color","Marcas",g.tick_color)}
        ${this._color("power.gauge.tick_label_color","Números escala",g.tick_label_color)}
        ${this._color("power.gauge.value_color","Valor",g.value_color)}
        ${this._color("power.gauge.unit_color","Unidad",g.unit_color)}
        ${this._input("power.gauge.show_ticks","Mostrar marcas",g.show_ticks,{type:"checkbox"})}
        ${this._input("power.gauge.show_numeric_value","Mostrar valor",g.show_numeric_value,{type:"checkbox"})}
      </div>`),
      this._actionEditor("power", w),
      this._section("Rangos", `${ranges}<button class="editor-btn" data-action="add-range">+ Agregar rango</button><div class="help">Los rangos definen el color del arco. Si la aguja está en automático, adopta el color del rango actual.</div>`),
    ].join("");
  }

  _editorNavigation(cfg) {
    const n = cfg.navigation;
    const buttons = (n.buttons || []).map((b,i) => `
      <div class="item-card">
        <div class="item-head">
          <div style="display:flex;align-items:center;gap:8px"><span class="icon-preview">${this._icon(b.icon,22,b.color || n.active_color)}</span><span class="item-name">Botón ${i+1}</span></div>
          <button class="tiny-btn" data-action="remove-nav" data-index="${i}">Eliminar</button>
        </div>
        <div class="field-grid">
          ${this._input(`navigation.buttons.${i}.show`,"Mostrar",b.show,{type:"checkbox"})}
          ${this._input(`navigation.buttons.${i}.label`,"Texto",b.label)}
          ${this._input(`navigation.buttons.${i}.icon`,"Icono MDI",b.icon)}
          ${this._input(`navigation.buttons.${i}.path`,"Ruta",b.path,{full:true})}
          ${this._color(`navigation.buttons.${i}.color`,"Color icono",b.color || n.active_color)}
        </div>
      </div>`).join("");

    return [
      this._section("Barra de navegación", `${!n.show ? `<div class="nav-disabled-note">La navegación está desactivada. Activa “Mostrar navegación” para que los botones aparezcan en el panel. Al activar o agregar un botón también se habilitará automáticamente.</div>` : `<div class="nav-enabled-note">Navegación activa</div>`}<div class="field-grid">
        ${this._input("navigation.show","Mostrar navegación",n.show,{type:"checkbox",full:true})}
        ${this._input("navigation.position","Posición",n.position,{type:"select",options:[["top","Arriba"],["bottom","Abajo"]]})}
        ${this._input("navigation.columns","Columnas",n.columns,{type:"range",min:1,max:6,step:1})}
        ${this._input("navigation.gap","Separación",n.gap,{type:"range",min:2,max:20,step:1})}
        ${this._input("navigation.button_height","Altura botones",n.button_height,{type:"range",min:42,max:90,step:1})}
        ${this._input("navigation.radius","Radio",n.radius,{type:"range",min:0,max:30,step:1})}
        ${this._input("navigation.icon_size","Tamaño icono",n.icon_size,{type:"range",min:14,max:40,step:1})}
        ${this._input("navigation.font_size","Tamaño texto",n.font_size,{type:"range",min:8,max:20,step:1})}
        ${this._input("navigation.show_labels","Mostrar texto",n.show_labels,{type:"checkbox"})}
        ${this._color("navigation.background","Fondo",n.background)}
        ${this._color("navigation.border_color","Borde",n.border_color)}
        ${this._color("navigation.text_color","Texto",n.text_color)}
        ${this._color("navigation.active_color","Activo",n.active_color)}
      </div><div class="help">La ruta puede ser un custom panel o una ruta nativa de Home Assistant, por ejemplo /smart-home o /lovelace/energia.</div>`),
      this._section("Botones", `${buttons}<button class="editor-btn" data-action="add-nav">+ Agregar botón</button>`),
    ].join("");
  }

  _editorAdvanced(cfg) {
    return this._section("Configuración completa JSON", `
      <div class="help">Aquí puedes editar cualquier propiedad de la configuración sin abrir configuration.yaml. Pulsa “Aplicar JSON” antes de Guardar.</div>
      <textarea id="advanced-json" class="json-area">${this._escape(JSON.stringify(cfg, null, 2))}</textarea>
      <div class="row-actions"><button class="editor-btn" data-action="apply-json">Aplicar JSON</button></div>`);
  }


  _widgetFromKey(key) {
    return this._config()?.[key] || null;
  }

  _performWidgetAction(key, actionName) {
    const widget = this._widgetFromKey(key);
    const actionCfg = widget?.[actionName] || { action: "none" };
    const action = actionCfg.action || "none";
    const entityId = actionCfg.entity || widget?.entity || "";

    if (action === "none") return;

    if (action === "more-info") {
      if (!entityId) return;
      this.dispatchEvent(new CustomEvent("hass-more-info", {
        detail: { entityId },
        bubbles: true,
        composed: true,
      }));
      return;
    }

    if (action === "navigate") {
      const path = actionCfg.navigation_path || actionCfg.path || "";
      if (path) this._navigate(path);
      return;
    }

    if (action === "url") {
      const url = actionCfg.url_path || actionCfg.url || "";
      if (!url) return;
      if (/^https?:\/\//i.test(url)) window.location.href = url;
      else this._navigate(url);
      return;
    }

    if (action === "toggle") {
      if (!entityId) return;
      this._hass.callService("homeassistant", "toggle", { entity_id: entityId }).catch((err) => {
        console.error("Smart Home Panel: error al alternar entidad", err);
        this._toast("No se pudo alternar la entidad", "error");
      });
    }
  }

  _onWidgetPointerDown(ev) {
    if (this._editorOpen || ev.button !== undefined && ev.button !== 0) return;
    const surface = ev.target.closest?.("[data-widget-key]");
    if (!surface) return;
    const key = surface.dataset.widgetKey;
    const widget = this._widgetFromKey(key);
    if (!widget) return;

    this._cancelWidgetPress();
    const holdEnabled = (widget.hold_action?.action || "none") !== "none";
    const gesture = {
      key,
      pointerId: ev.pointerId,
      startX: ev.clientX,
      startY: ev.clientY,
      moved: false,
      holdReady: false,
      timer: null,
    };
    if (holdEnabled) {
      gesture.timer = setTimeout(() => {
        if (this._pressGesture !== gesture || gesture.moved) return;
        gesture.holdReady = true;
      }, 500);
    }
    this._pressGesture = gesture;
  }

  _onWidgetPointerMove(ev) {
    const g = this._pressGesture;
    if (!g || g.pointerId !== ev.pointerId) return;
    const dx = ev.clientX - g.startX;
    const dy = ev.clientY - g.startY;
    if (Math.hypot(dx, dy) > 12) {
      g.moved = true;
      if (g.timer) clearTimeout(g.timer);
      g.timer = null;
    }
  }

  _onWidgetPointerUp(ev) {
    const g = this._pressGesture;
    if (!g || g.pointerId !== ev.pointerId) return;
    if (g.timer) clearTimeout(g.timer);
    if (!g.moved) {
      if (g.holdReady) this._performWidgetAction(g.key, "hold_action");
      else this._performWidgetAction(g.key, "tap_action");
    }
    this._pressGesture = null;
  }

  _cancelWidgetPress(ev = null) {
    const g = this._pressGesture;
    if (!g) return;
    if (ev && ev.pointerId !== undefined && g.pointerId !== ev.pointerId) return;
    if (g.timer) clearTimeout(g.timer);
    this._pressGesture = null;
  }

  _onWidgetKeyDown(ev) {
    if (this._editorOpen || (ev.key !== "Enter" && ev.key !== " ")) return;
    const surface = ev.target.closest?.("[data-widget-key]");
    if (!surface) return;
    ev.preventDefault();
    this._performWidgetAction(surface.dataset.widgetKey, "tap_action");
  }

  _onInput(ev) {
    if (ev.target?.id === "entity-search" && this._entityPickerState) {
      this._entityPickerState.search = ev.target.value || "";
      this._refreshEntityPickerResults();
      return;
    }
    const el = ev.target.closest?.("[data-setting]");
    if (!el || el.type !== "range" || !this._editConfig) return;
    const readout = el.parentElement?.querySelector?.(".range-readout");
    if (readout) readout.textContent = el.value;
  }

  _onChange(ev) {
    const el = ev.target.closest?.("[data-setting]");
    if (!el || !this._editConfig) return;
    let value;
    const type = el.dataset.valueType;
    if (type === "boolean") value = Boolean(el.checked);
    else if (type === "number") value = Number(el.value);
    else value = el.value;
    const settingPath = el.dataset.setting;
    this._setPath(this._editConfig, settingPath, value);

    // UX de navegación: si el usuario activa un botón individual, la barra
    // principal se habilita también. Evita configurar botones que luego no se ven
    // por tener navigation.show en false.
    if (/^navigation\.buttons\.\d+\.show$/.test(settingPath) && value === true) {
      this._editConfig.navigation.show = true;
    }

    if (el.type === "color") {
      const sibling = el.parentElement?.querySelector?.('input[type="text"][data-setting]');
      if (sibling) sibling.value = el.value;
    }

    // Actualiza inmediatamente el editor y la vista previa. En V2.0.1 el cambio
    // quedaba almacenado en memoria pero varios controles no daban feedback visual
    // hasta guardar, lo que podía parecer que no funcionaban.
    this._lastSignature = "";
    this._queueRender();
  }

  async _onClick(ev) {
    const nav = ev.target.closest?.("[data-nav-path]");
    if (nav) {
      this._navigate(nav.dataset.navPath);
      return;
    }

    const target = ev.target.closest?.("[data-action]");
    if (!target) return;
    const action = target.dataset.action;

    if (action === "open-entity-picker") {
      this._entityPickerState = {
        path: target.dataset.path,
        profile: target.dataset.profile || "all",
        search: "",
        showAll: false,
      };
      this._lastSignature = "";
      this._queueRender();
      requestAnimationFrame(() => this.shadowRoot.getElementById("entity-search")?.focus());
      return;
    }
    if (action === "close-entity-picker") {
      this._entityPickerState = null;
      this._lastSignature = "";
      this._queueRender();
      return;
    }
    if (action === "entity-filter") {
      if (!this._entityPickerState) return;
      this._entityPickerState.showAll = target.dataset.mode === "all";
      this._lastSignature = "";
      this._queueRender();
      return;
    }
    if (action === "select-entity") {
      if (!this._entityPickerState || !this._editConfig) return;
      this._setPath(this._editConfig, this._entityPickerState.path, target.dataset.entityId || "");
      this._entityPickerState = null;
      this._toast("Entidad seleccionada; pulsa Guardar para persistir");
      this._lastSignature = "";
      this._queueRender();
      return;
    }
    if (action === "use-manual-entity") {
      if (!this._entityPickerState || !this._editConfig) return;
      const input = this.shadowRoot.getElementById("entity-manual-id");
      const id = String(input?.value || "").trim();
      if (!id || !id.includes(".")) {
        this._toast("Escribe un entity_id válido, por ejemplo sensor.potencia_total", "error");
        return;
      }
      this._setPath(this._editConfig, this._entityPickerState.path, id);
      this._entityPickerState = null;
      this._toast("Entity ID aplicado; pulsa Guardar para persistir");
      this._lastSignature = "";
      this._queueRender();
      return;
    }

    if (action === "open-editor") {
      this._editConfig = deepClone(this._config());
      this._editorOpen = true;
      this._editorTab = "general";
      this._lastSignature = "";
      this._queueRender();
      return;
    }
    if (action === "close-editor") {
      this._editorOpen = false;
      this._editConfig = null;
      this._entityPickerState = null;
      this._lastSignature = "";
      this._queueRender();
      return;
    }
    if (action === "tab") {
      this._editorTab = target.dataset.tab;
      this._lastSignature = "";
      this._queueRender();
      return;
    }
    if (action === "save-config") {
      await this._saveConfig();
      return;
    }
    if (action === "reset-config") {
      if (!confirm("¿Restablecer toda la personalización a los valores predeterminados?")) return;
      try {
        await this._hass.callWS({ type: "smart_home_panel/config/reset" });
        this._storedConfig = {};
        this._editConfig = deepClone(DEFAULTS);
        this._toast("Configuración restablecida");
        this._lastSignature = "";
        this._queueRender();
      } catch (err) {
        this._toast(`No se pudo restablecer: ${err?.message || err}`, "error");
      }
      return;
    }
    if (action === "add-nav") {
      const arr = this._editConfig.navigation.buttons ||= [];
      this._editConfig.navigation.show = true;
      arr.push({ show: true, label: "Nuevo", icon: "mdi:circle-outline", path: "/", color: this._editConfig.navigation.active_color || "#35ddd5" });
      this._lastSignature = "";
      this._queueRender();
      return;
    }
    if (action === "remove-nav") {
      this._editConfig.navigation.buttons.splice(Number(target.dataset.index), 1);
      this._lastSignature = "";
      this._queueRender();
      return;
    }
    if (action === "add-range") {
      const arr = this._editConfig.power.gauge.ranges ||= [];
      const lastTo = arr.length ? Number(arr.at(-1).to) : Number(this._editConfig.power.gauge.min || 0);
      arr.push({ from: lastTo, to: Number(this._editConfig.power.gauge.max || 10000), color: "#35ddd5" });
      this._lastSignature = "";
      this._queueRender();
      return;
    }
    if (action === "remove-range") {
      this._editConfig.power.gauge.ranges.splice(Number(target.dataset.index), 1);
      this._lastSignature = "";
      this._queueRender();
      return;
    }
    if (action === "apply-json") {
      const area = this.shadowRoot.getElementById("advanced-json");
      try {
        const parsed = JSON.parse(area.value);
        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("La raíz debe ser un objeto JSON");
        this._editConfig = parsed;
        this._toast("JSON aplicado; pulsa Guardar para persistirlo");
        this._lastSignature = "";
        this._queueRender();
      } catch (err) {
        this._toast(`JSON inválido: ${err.message}`, "error");
      }
      return;
    }
    if (action === "export-config") {
      const blob = new Blob([JSON.stringify(this._editConfig || this._config(), null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "smart-home-panel-config.json";
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      return;
    }
    if (action === "import-config") {
      const input = this.shadowRoot.getElementById("import-file");
      input.onchange = async () => {
        const file = input.files?.[0];
        if (!file) return;
        try {
          const parsed = JSON.parse(await file.text());
          if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("La raíz debe ser un objeto JSON");
          this._editConfig = parsed;
          this._toast("Configuración importada; pulsa Guardar");
          this._lastSignature = "";
          this._queueRender();
        } catch (err) {
          this._toast(`No se pudo importar: ${err.message}`, "error");
        }
      };
      input.click();
      return;
    }
  }

  async _saveConfig() {
    try {
      await this._hass.callWS({ type: "smart_home_panel/config/save", config: this._editConfig });
      this._storedConfig = deepClone(this._editConfig);
      this._editorOpen = false;
      this._editConfig = null;
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
    if (/^https?:\/\//i.test(path)) {
      window.location.href = path;
      return;
    }
    try {
      history.pushState(null, "", path);
      window.dispatchEvent(new Event("location-changed"));
    } catch (_) {
      window.location.href = path;
    }
  }

  _toast(message, type = "ok") {
    this._toastMessage = message;
    this._toastType = type;
    this._queueRender();
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => {
      this._toastMessage = "";
      this._queueRender();
    }, 2800);
  }
}

if (!customElements.get("smart-home-panel")) {
  customElements.define("smart-home-panel", SmartHomePanel);
}
