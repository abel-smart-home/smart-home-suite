/**
 * Smart Support Panel V1.1.2
 * Custom support center for Home Assistant.
 *
 * Suite conventions:
 * - mobile-first, compact width
 * - persistent visual editor (admin only)
 * - native entity/icon picker when available, manual fallback always available
 * - stable right drawer on desktop / full width on mobile
 * - Save/Cancel working copy
 * - import/export/reset
 * - dynamic navigation and dynamic support actions
 * - tap/hold gestures with scroll cancellation
 * - no external JavaScript dependencies
 */

const PANEL_VERSION = "1.1.2";
const BACKEND_DOMAIN = "smart_support_panel";
const HOLD_MS = 550;
const MOVE_CANCEL_PX = 12;

const DEFAULTS = {
  locale: "es-MX",
  header: {
    show: true,
    title: "Soporte",
    subtitle: "Centro de asistencia",
    icon: "mdi:headset",
    icon_color: "#35ddd5",
    title_color: "#f5f7fa",
    subtitle_color: "#89949f",
    title_size: 27,
    subtitle_size: 14,
    icon_size: 32,
    align: "left"
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
    muted_color: "#77838d",
    accent_color: "#35ddd5",
    danger_color: "#ef6461",
    success_color: "#66d17a",
    warning_color: "#f6b73c"
  },
  remote_support: {
    enabled: true,
    user_id: "",
    min_hours: 2,
    default_hours: 4,
    max_hours: 24,
    extension_hours: 2,
    close_on_restart: true
  },
  status: {
    show: true,
    entity: "binary_sensor.soporte_remoto_activo",
    title: "Soporte remoto",
    active_label: "Soporte remoto activo",
    inactive_label: "Soporte remoto desactivado",
    unknown_label: "Soporte remoto no configurado",
    active_icon: "mdi:remote-desktop",
    inactive_icon: "mdi:remote-desktop-off",
    unknown_icon: "mdi:shield-alert-outline",
    active_color: "#66d17a",
    inactive_color: "#89949f",
    unknown_color: "#f6b73c",
    show_remaining: true,
    show_expiry: true,
    show_progress: true,
    timer_title: "Tiempo restante",
    countdown_size: 38,
    tap_action: "more_info"
  },
  actions: {
    show: true,
    title: "¿Cómo podemos ayudarte?",
    subtitle: "El acceso técnico solo se habilita cuando tú lo autorizas",
    columns_mobile: 2,
    columns_desktop: 2,
    gap: 10,
    button_height: 98,
    radius: 18,
    buttons: [
      {
        id: "start_support",
        show: true,
        visibility: "admin",
        show_when: "inactive",
        label: "Permitir soporte",
        secondary: "Autorizar acceso temporal",
        icon: "mdi:play-circle-outline",
        type: "support_start",
        tap_behavior: "execute",
        hold_behavior: "none",
        confirmation: false,
        confirmation_text: "",
        disable_when: "never",
        wide: true,
        icon_color: "#66d17a",
        background: "",
        border_color: ""
      },
      {
        id: "stop_support",
        show: true,
        visibility: "admin",
        show_when: "active",
        label: "Finalizar soporte",
        secondary: "Cerrar acceso inmediatamente",
        icon: "mdi:stop-circle-outline",
        type: "support_stop",
        tap_behavior: "execute",
        hold_behavior: "none",
        confirmation: false,
        confirmation_text: "",
        disable_when: "never",
        wide: false,
        icon_color: "#ef6461",
        background: "",
        border_color: ""
      },
      {
        id: "extend_support",
        show: true,
        visibility: "admin",
        show_when: "active",
        label: "Extender soporte",
        secondary: "+2 horas",
        icon: "mdi:timer-plus-outline",
        type: "support_extend",
        hours: 0,
        tap_behavior: "execute",
        hold_behavior: "none",
        confirmation: false,
        confirmation_text: "",
        disable_when: "never",
        wide: false,
        icon_color: "#35ddd5",
        background: "",
        border_color: ""
      },
      {
        id: "whatsapp",
        show: true,
        visibility: "all",
        show_when: "always",
        label: "Contactar por WhatsApp",
        secondary: "Hablar con soporte",
        icon: "mdi:whatsapp",
        type: "whatsapp",
        whatsapp_number: "",
        whatsapp_message: "Hola, necesito soporte con mi sistema de Home Assistant.",
        tap_behavior: "execute",
        hold_behavior: "none",
        confirmation: false,
        confirmation_text: "",
        disable_when: "never",
        wide: true,
        icon_color: "#25D366",
        background: "",
        border_color: ""
      },
      {
        id: "system_info",
        show: false,
        visibility: "admin",
        show_when: "always",
        label: "Información del sistema",
        secondary: "Datos seguros para soporte",
        icon: "mdi:information-outline",
        type: "system_info",
        tap_behavior: "execute",
        hold_behavior: "none",
        confirmation: false,
        confirmation_text: "",
        disable_when: "never",
        wide: true,
        icon_color: "#35ddd5",
        background: "",
        border_color: ""
      }
    ]
  },
  identity: {
    show: true,
    image_entity: "",
    image_url: "",
    image_size: 86,
    business_name: "Nombre del negocio",
    business_color: "#f5f7fa",
    business_size: 16,
    attribution: "Powered by Home Assistant",
    attribution_color: "#77838d",
    attribution_size: 11,
    installation_id: "",
    fallback_icon: "mdi:home-assistant"
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
    active_color: "#35ddd5",
    icon_size: 24,
    font_size: 11,
    show_labels: true,
    buttons: [
      { id: "home", show: true, label: "Inicio", icon: "mdi:home", path: "/smart-home", color: "#35ddd5" },
      { id: "lighting", show: false, label: "Luces", icon: "mdi:lightbulb-group", path: "/lighting", color: "#35ddd5" },
      { id: "energy", show: false, label: "Energía", icon: "mdi:flash", path: "/smart-energy-advanced", color: "#35ddd5" },
      { id: "support", show: true, label: "Soporte", icon: "mdi:headset", path: "/support", color: "#35ddd5" }
    ]
  }
};

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

class SmartSupportPanel extends HTMLElement {
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
    this._toastTimer = null;
    this._gesture = null;
    this._dialog = null;
    this._supportState = null;
    this._supportBusy = false;
    this._verificationResult = null;
    this._statusTimer = null;
    this._statusRefreshTimer = null;
    this._expiryRefreshPending = false;

    this.shadowRoot.addEventListener("click", (ev) => this._onClick(ev));
    this.shadowRoot.addEventListener("change", (ev) => this._onChange(ev));
    this.shadowRoot.addEventListener("input", (ev) => this._onInput(ev));
    this.shadowRoot.addEventListener("pointerdown", (ev) => this._onPointerDown(ev));
    this.shadowRoot.addEventListener("pointermove", (ev) => this._onPointerMove(ev));
    this.shadowRoot.addEventListener("pointerup", (ev) => this._onPointerUp(ev));
    this.shadowRoot.addEventListener("pointercancel", () => this._cancelGesture());
  }

  set hass(value) {
    // Home Assistant may replace `hass` very frequently when any entity changes.
    // Only rebuild this panel when a value that is actually rendered changed.
    const previousSignature = this._loaded ? this._hassVisualSignature(this._hass) : null;
    this._hass = value;
    if (!this._loaded && !this._loading) this._loadConfig();
    // Preserve editor scroll/focus and, on the normal panel, preserve hover/focus
    // when unrelated entities elsewhere in Home Assistant update.
    if (!this._editorOpen && !this._dialog) {
      const nextSignature = this._loaded ? this._hassVisualSignature(this._hass) : null;
      if (!this._loaded || previousSignature !== nextSignature) this._queueRender();
    }
  }
  get hass() { return this._hass; }

  set panel(value) { this._panel = value; this._queueRender(); }
  get panel() { return this._panel; }

  set narrow(value) { this._narrow = Boolean(value); this._queueRender(); }
  get narrow() { return this._narrow; }

  connectedCallback() {
    if (this._hass && !this._loaded && !this._loading) this._loadConfig();
    this._startRuntimeTimers();
    this._queueRender();
  }

  disconnectedCallback() {
    if (this._statusTimer) clearInterval(this._statusTimer);
    if (this._statusRefreshTimer) clearInterval(this._statusRefreshTimer);
    this._statusTimer = null;
    this._statusRefreshTimer = null;
  }

  _startRuntimeTimers() {
    if (!this._statusTimer) {
      this._statusTimer = setInterval(() => {
        if (this._supportState?.active && !this._editorOpen && !this._dialog) this._updateRuntimeTimerDom();
      }, 1000);
    }
    if (!this._statusRefreshTimer) {
      this._statusRefreshTimer = setInterval(() => {
        if (this.isConnected && this._hass && !this._editorOpen) this._refreshSupportStatus(false);
      }, 15000);
    }
  }

  async _loadConfig() {
    if (!this._hass || this._loading || this._loaded) return;
    this._loading = true;
    try {
      const result = await this._hass.callWS({ type: `${BACKEND_DOMAIN}/config/get` });
      this._storedConfig = this._migrateConfig(result?.config || {});
      this._backendOk = true;
      await this._refreshSupportStatus(false);
    } catch (err) {
      console.error("Smart Support Panel: no se pudo cargar configuración", err);
      this._storedConfig = {};
      this._backendOk = false;
    } finally {
      this._loaded = true;
      this._loading = false;
      try {
        const params = new URLSearchParams(window.location.search);
        if (this._hass?.user?.is_admin && (params.get("settings") === "1" || params.get("configure") === "1")) {
          this._openEditor();
        }
      } catch (_) {}
      this._queueRender();
    }
  }

  async _refreshSupportStatus(showError = false) {
    if (!this._hass) return null;
    try {
      const previousKey = this._supportRenderKey(this._supportState);
      const result = await this._hass.callWS({ type: `${BACKEND_DOMAIN}/support/status` });
      this._supportState = result || null;
      this._verificationResult = result?.verification || this._verificationResult;
      this._backendOk = true;
      const nextKey = this._supportRenderKey(this._supportState);
      if (!this._editorOpen && !this._dialog) {
        if (previousKey !== nextKey) this._queueRender();
        else this._updateRuntimeTimerDom();
      }
      return result;
    } catch (err) {
      console.error("Smart Support Panel: no se pudo obtener el estado de soporte", err);
      this._backendOk = false;
      if (showError) this._toast("No se pudo consultar el estado del soporte", "error");
      return null;
    }
  }

  _hassVisualSignature(hass) {
    if (!hass) return "";
    const cfg = this._config();
    const statusEntity = cfg.status?.entity || "";
    const imageEntity = cfg.identity?.image_entity || "";
    const statusState = statusEntity ? hass.states?.[statusEntity] : null;
    const imageState = imageEntity ? hass.states?.[imageEntity] : null;
    return JSON.stringify([
      Boolean(hass.user?.is_admin),
      statusEntity,
      statusState?.state ?? null,
      imageEntity,
      imageState?.attributes?.entity_picture ?? null
    ]);
  }

  _supportRenderKey(state) {
    if (!state) return "";
    const verification = state.verification || {};
    return JSON.stringify({
      active: Boolean(state.active),
      account_active: Boolean(state.account_active),
      tracked_active: Boolean(state.tracked_active),
      started_at: state.started_at || null,
      expires_at: state.expires_at || null,
      duration_hours: state.duration_hours ?? null,
      last_error: state.last_error || null,
      verification: {
        ready: Boolean(verification.ready),
        message: verification.message || "",
        user_active: verification.user_active ?? null,
        user_found: Boolean(verification.user_found),
        user_admin_group: Boolean(verification.user_admin_group),
        user_owner: Boolean(verification.user_owner),
        user_name: verification.user_name || null,
        spook_available: Boolean(verification.spook_available)
      }
    });
  }

  _updateRuntimeTimerDom() {
    if (!this.shadowRoot || this._editorOpen || this._dialog) return;
    const timerCard = this.shadowRoot.querySelector("[data-runtime-timer]");
    if (!timerCard) return;

    const remaining = this._remainingSeconds();
    const countdown = timerCard.querySelector("[data-runtime-countdown]");
    if (countdown) countdown.textContent = this._formatCountdown(remaining);

    const progress = timerCard.querySelector("[data-runtime-progress]");
    if (progress) {
      const durationSeconds = Math.max(1, this._num(this._supportState?.duration_hours, 0) * 3600);
      const percent = Math.min(100, Math.max(0, (remaining / durationSeconds) * 100));
      progress.style.width = `${percent.toFixed(2)}%`;
      const wrapper = progress.parentElement;
      if (wrapper) wrapper.setAttribute("aria-valuenow", percent.toFixed(1));
    }

    // The backend owns expiry. When the local clock reaches zero, ask it for
    // authoritative state once instead of rebuilding the panel every second.
    if (remaining <= 0 && !this._expiryRefreshPending) {
      this._expiryRefreshPending = true;
      Promise.resolve(this._refreshSupportStatus(false)).finally(() => {
        this._expiryRefreshPending = false;
      });
    }
  }

  _remainingSeconds() {
    const expires = this._supportState?.expires_at;
    if (!this._supportState?.active || !expires) return 0;
    const diff = Math.floor((new Date(expires).getTime() - Date.now()) / 1000);
    return Number.isFinite(diff) ? Math.max(0, diff) : Math.max(0, this._num(this._supportState?.remaining_seconds, 0));
  }

  _formatCountdown(seconds) {
    seconds = Math.max(0, Math.floor(this._num(seconds, 0)));
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const sec = seconds % 60;
    return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`;
  }

  _formatExpiry(value) {
    if (!value) return "";
    try {
      return new Intl.DateTimeFormat(this._config().locale || "es-MX", { dateStyle:"short", timeStyle:"short" }).format(new Date(value));
    } catch (_) { return String(value); }
  }

  _migrateConfig(raw) {
    const cfg = deepMerge(DEFAULTS, raw || {});
    if (raw?.status?.show_progress === undefined && raw?.status?.show_remaining === false && raw?.status?.show_expiry === false) cfg.status.show_progress = false;
    const buttons = Array.isArray(cfg.actions?.buttons) ? cfg.actions.buttons : [];
    const start = buttons.find(b => b.id === "start_support");
    if (start && start.type === "entity" && !start.entity) {
      start.type = "support_start"; start.visibility = "admin"; start.show_when = "inactive"; start.wide = true; start.confirmation = false; start.hold_behavior = "none";
    }
    const stop = buttons.find(b => b.id === "stop_support");
    if (stop && stop.type === "entity" && !stop.entity) {
      stop.type = "support_stop"; stop.visibility = "admin"; stop.show_when = "active"; stop.confirmation = false; stop.hold_behavior = "none";
    }
    if (!buttons.some(b => b.id === "extend_support")) {
      const ext = deepClone(DEFAULTS.actions.buttons.find(b => b.id === "extend_support"));
      const whatsappIndex = buttons.findIndex(b => b.id === "whatsapp");
      if (whatsappIndex >= 0) buttons.splice(whatsappIndex, 0, ext); else buttons.push(ext);
    }
    cfg.actions.buttons = buttons;
    const remote = cfg.remote_support || (cfg.remote_support = {});
    remote.min_hours = Math.min(168, Math.max(2, this._num(remote.min_hours, 2)));
    remote.max_hours = Math.min(168, Math.max(remote.min_hours, this._num(remote.max_hours, 24)));
    remote.default_hours = Math.min(remote.max_hours, Math.max(remote.min_hours, this._num(remote.default_hours, 4)));
    remote.extension_hours = Math.min(remote.max_hours, Math.max(2, this._num(remote.extension_hours, 2)));
    return cfg;
  }

  _config() {
    return deepMerge(DEFAULTS, (this._editorOpen && this._editConfig) ? this._editConfig : this._storedConfig);
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
    return typeof value === "number" ? `${value}px` : String(value);
  }

  _num(value, fallback = 0) {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  }

  _bool(value) {
    return value === true || value === "true" || value === 1 || value === "1" || value === "on";
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

  _icon(icon, size = 26, color = "currentColor") {
    if (!icon) return "";
    return `<ha-icon icon="${this._escape(icon)}" style="--mdc-icon-size:${this._cssSize(size, "26px")};color:${this._escape(color)}"></ha-icon>`;
  }

  _statusInfo(cfg) {
    const st = this._supportState;
    const s = cfg.status;
    const stateObj = this._hass?.states?.[s.entity] || null;
    if (st) {
      const active = Boolean(st.active);
      const ready = Boolean(st.verification?.ready);
      if (!active && !ready) {
        return { kind:"unknown", active:null, label:s.unknown_label, icon:s.unknown_icon, color:s.unknown_color, stateObj };
      }
      return {
        kind: active ? "active" : "inactive",
        active,
        label: active ? s.active_label : s.inactive_label,
        icon: active ? s.active_icon : s.inactive_icon,
        color: active ? s.active_color : s.inactive_color,
        stateObj
      };
    }
    if (!stateObj || ["unknown","unavailable"].includes(String(stateObj.state).toLowerCase())) {
      return { kind:"unknown", active:null, label:s.unknown_label, icon:s.unknown_icon, color:s.unknown_color, stateObj };
    }
    const active = String(stateObj.state).toLowerCase() === "on";
    return { kind:active?"active":"inactive", active, label:active?s.active_label:s.inactive_label, icon:active?s.active_icon:s.inactive_icon, color:active?s.active_color:s.inactive_color, stateObj };
  }

  _durationText(stateObj) {
    if (!stateObj?.last_changed) return "";
    const then = new Date(stateObj.last_changed).getTime();
    const now = Date.now();
    if (!Number.isFinite(then) || then > now) return "";
    const mins = Math.floor((now - then) / 60000);
    if (mins < 1) return "desde hace menos de 1 min";
    if (mins < 60) return `desde hace ${mins} min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `desde hace ${hours} h ${mins % 60 ? `${mins % 60} min` : ""}`.trim();
    const days = Math.floor(hours / 24);
    return `desde hace ${days} d`;
  }

  _visibleForUser(item, status = null) {
    if (!item?.show) return false;
    const visibility = item.visibility || "all";
    if (visibility === "hidden") return false;
    if (visibility === "admin" && !this._hass?.user?.is_admin) return false;
    const showWhen = item.show_when || "always";
    if (status) {
      if (showWhen === "active" && status.active !== true) return false;
      if (showWhen === "inactive" && status.active === true) return false;
    }
    return true;
  }

  _actionDisabled(button, status) {
    if (this._supportBusy && ["support_start","support_stop","support_extend"].includes(button.type)) return true;
    if (button.type === "entity" && !button.entity) return true;
    if (button.type === "whatsapp" && !String(button.whatsapp_number || "").replace(/\D/g, "")) return true;
    if (button.type === "url" && !button.url) return true;
    if (button.type === "navigate" && !button.path) return true;
    if (["support_start","support_extend"].includes(button.type) && !this._supportState?.verification?.ready) return true;
    if (button.type === "support_extend" && !this._supportState?.tracked_active) return true;
    if (button.type === "support_stop" && !this._supportState?.account_active && status.active !== true) return true;
    if (button.disable_when === "active" && status.active === true) return true;
    if (button.disable_when === "inactive" && status.active === false) return true;
    return false;
  }

  _renderHeader(cfg) {
    const h = cfg.header;
    if (!h.show) return "";
    return `<header class="panel-header align-${this._escape(h.align || "left")}">
      <div class="header-icon">${this._icon(h.icon, h.icon_size, h.icon_color)}</div>
      <div class="header-copy">
        <div class="header-title" style="color:${this._escape(h.title_color)};font-size:${this._cssSize(h.title_size)}">${this._escape(h.title)}</div>
        ${h.subtitle ? `<div class="header-subtitle" style="color:${this._escape(h.subtitle_color)};font-size:${this._cssSize(h.subtitle_size)}">${this._escape(h.subtitle)}</div>` : ""}
      </div>
    </header>`;
  }

  _renderStatus(cfg) {
    if (!cfg.status.show) return "";
    const info = this._statusInfo(cfg);
    const details = [];
    if (info.active === true && this._supportState?.account_active && !this._supportState?.tracked_active) details.push("Cuenta activa sin temporizador. Finaliza el soporte o inicia una autorización controlada.");
    if (info.active !== true && this._supportState?.verification?.message && !this._supportState?.verification?.ready) details.push(this._supportState.verification.message);
    return `<section class="status-card ${info.kind}" data-status-card="1" style="--status-color:${this._escape(info.color)}">
      <div class="status-icon">${this._icon(info.icon, 30, info.color)}</div>
      <div class="status-copy">
        <div class="status-title">${this._escape(cfg.status.title)}</div>
        <div class="status-value"><span class="status-dot"></span>${this._escape(info.label)}</div>
        ${details.map(v=>`<div class="status-duration">${this._escape(v)}</div>`).join("")}
      </div>
    </section>`;
  }

  _renderSupportTimer(cfg) {
    const info = this._statusInfo(cfg);
    const remaining = this._remainingSeconds();
    const expiry = this._supportState?.expires_at;
    if (info.active !== true || !this._supportState?.tracked_active || remaining <= 0) return "";
    if (!cfg.status.show_remaining && !cfg.status.show_expiry && !cfg.status.show_progress) return "";

    const durationSeconds = Math.max(1, this._num(this._supportState?.duration_hours, 0) * 3600);
    const progress = Math.min(100, Math.max(0, (remaining / durationSeconds) * 100));
    const countdownSize = Math.min(60, Math.max(28, this._num(cfg.status.countdown_size, 38)));

    return `<section class="support-timer-card" data-runtime-timer="1" style="--timer-color:${this._escape(cfg.status.active_color || cfg.design.success_color)}">
      <div class="support-timer-head">
        <div class="support-timer-title">${this._icon("mdi:timer-outline",22,cfg.status.active_color || cfg.design.success_color)}<span>${this._escape(cfg.status.timer_title || "Tiempo restante")}</span></div>
        <div class="support-timer-live"><span></span>EN CURSO</div>
      </div>
      ${cfg.status.show_remaining ? `<div class="support-countdown" data-runtime-countdown="1" style="font-size:${countdownSize}px">${this._escape(this._formatCountdown(remaining))}</div>` : ""}
      ${cfg.status.show_expiry && expiry ? `<div class="support-expiry"><span>Finaliza</span><strong>${this._escape(this._formatExpiry(expiry))}</strong></div>` : ""}
      ${cfg.status.show_progress ? `<div class="support-progress" role="progressbar" aria-label="Tiempo restante" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${progress.toFixed(1)}"><span data-runtime-progress="1" style="width:${progress.toFixed(2)}%"></span></div>` : ""}
    </section>`;
  }

  _renderActions(cfg) {
    if (!cfg.actions.show) return "";
    const status = this._statusInfo(cfg);
    const buttons = (cfg.actions.buttons || []).map((b, index) => {
      if (!this._visibleForUser(b, status)) return "";
      const disabled = this._actionDisabled(b, status);
      const bg = b.background || cfg.design.card_background;
      const border = b.border_color || cfg.design.card_border_color;
      let secondary = b.secondary || "";
      if (b.type === "support_extend" && (!b.hours || Number(b.hours) <= 0)) secondary = `+${this._num(cfg.remote_support.extension_hours,2)} horas`;
      return `<button class="support-action ${b.wide ? "wide" : ""} ${disabled ? "disabled" : ""}"
        data-action-index="${index}" ${disabled ? "aria-disabled=\"true\"" : ""}
        style="--action-bg:${this._escape(bg)};--action-border:${this._escape(border)};--action-icon:${this._escape(b.icon_color || cfg.design.accent_color)}">
        <span class="action-icon">${this._icon(b.icon, 31, b.icon_color || cfg.design.accent_color)}</span>
        <span class="action-label">${this._escape(b.label)}</span>
        ${secondary ? `<span class="action-secondary">${this._escape(secondary)}</span>` : ""}
      </button>`;
    }).join("");
    return `<section class="actions-section">
      ${(cfg.actions.title || cfg.actions.subtitle) ? `<div class="section-heading">
        ${cfg.actions.title ? `<div class="section-title">${this._escape(cfg.actions.title)}</div>` : ""}
        ${cfg.actions.subtitle ? `<div class="section-subtitle">${this._escape(cfg.actions.subtitle)}</div>` : ""}
      </div>` : ""}
      <div class="actions-grid" style="--cols-mobile:${Math.max(1, this._num(cfg.actions.columns_mobile, 2))};--cols-desktop:${Math.max(1, this._num(cfg.actions.columns_desktop, 2))};--action-gap:${this._cssSize(cfg.actions.gap, "10px")};--action-height:${this._cssSize(cfg.actions.button_height, "98px")};--action-radius:${this._cssSize(cfg.actions.radius, "18px")}">${buttons}</div>
    </section>`;
  }

  _identityImage(cfg) {
    const i = cfg.identity;
    let src = "";
    if (i.image_entity) {
      const st = this._hass?.states?.[i.image_entity];
      src = st?.attributes?.entity_picture || "";
    }
    if (!src) src = i.image_url || "";
    if (src) return `<img class="business-logo" src="${this._escape(src)}" alt="${this._escape(i.business_name || "Logo")}" style="width:${this._cssSize(i.image_size)};height:${this._cssSize(i.image_size)}">`;
    return `<div class="business-logo fallback" style="width:${this._cssSize(i.image_size)};height:${this._cssSize(i.image_size)}">${this._icon(i.fallback_icon, Math.max(34, this._num(i.image_size, 86) * .52), cfg.design.accent_color)}</div>`;
  }

  _renderIdentity(cfg) {
    const i = cfg.identity;
    if (!i.show) return "";
    return `<footer class="identity-card">
      ${this._identityImage(cfg)}
      ${i.business_name ? `<div class="business-name" style="color:${this._escape(i.business_color)};font-size:${this._cssSize(i.business_size)}">${this._escape(i.business_name)}</div>` : ""}
      ${i.attribution ? `<div class="business-attribution" style="color:${this._escape(i.attribution_color)};font-size:${this._cssSize(i.attribution_size)}">${this._escape(i.attribution)}</div>` : ""}
    </footer>`;
  }

  _renderNavigation(cfg) {
    const n = cfg.navigation;
    if (!n.show) return "";
    const path = window.location.pathname;
    const buttons = (n.buttons || []).filter(b => b.show).map((b, index) => {
      const active = b.path && (path === b.path || path.startsWith(`${b.path}/`));
      return `<button class="nav-button ${active ? "active" : ""}" data-nav-index="${index}" style="--nav-color:${this._escape(b.color || n.active_color)}">
        ${this._icon(b.icon, n.icon_size, active ? (b.color || n.active_color) : n.text_color)}
        ${n.show_labels ? `<span>${this._escape(b.label)}</span>` : ""}
      </button>`;
    }).join("");
    return `<nav class="panel-nav" style="--nav-cols:${Math.max(1, this._num(n.columns,4))};--nav-gap:${this._cssSize(n.gap,"8px")};--nav-height:${this._cssSize(n.button_height,"58px")};--nav-radius:${this._cssSize(n.radius,"16px")};--nav-bg:${this._escape(n.background)};--nav-border:${this._escape(n.border_color)};--nav-text:${this._escape(n.text_color)};--nav-font:${this._cssSize(n.font_size,"11px")}">${buttons}</nav>`;
  }

  _styles(cfg) {
    const d = cfg.design;
    return `<style>
      :host{display:block;min-height:100%;font-family:${d.font_family};color:${d.value_color};background:${d.background}}
      *{box-sizing:border-box} button,input,select,textarea{font:inherit}
      button{color:inherit}
      .page{min-height:100vh;background:linear-gradient(180deg,${d.background_secondary} 0%,${d.background} 28%,${d.background} 100%);padding:calc(${this._cssSize(d.panel_padding,"12px")} + env(safe-area-inset-top)) max(${this._cssSize(d.panel_padding,"12px")},env(safe-area-inset-right)) calc(${this._cssSize(d.panel_padding,"12px")} + env(safe-area-inset-bottom)) max(${this._cssSize(d.panel_padding,"12px")},env(safe-area-inset-left))}
      .panel{width:min(100%,${this._cssSize(d.panel_max_width,"520px")});margin:0 auto;display:flex;flex-direction:column;gap:${this._cssSize(d.gap,"12px")}}
      .panel-header{position:relative;display:flex;align-items:center;gap:13px;padding:8px 5px 5px;min-height:65px}.panel-header.align-center{justify-content:center;text-align:center}.panel-header.align-right{justify-content:flex-end;text-align:right}.header-icon{display:flex;align-items:center}.header-title{font-weight:700;letter-spacing:-.3px}.header-subtitle{margin-top:3px;font-weight:500}.header-copy{min-width:0}
      .settings-btn{position:fixed;right:max(14px,env(safe-area-inset-right));top:max(14px,env(safe-area-inset-top));z-index:12;width:42px;height:42px;border-radius:50%;border:1px solid ${d.card_border_color};background:rgba(17,24,30,.92);display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:${d.card_shadow};backdrop-filter:blur(8px)}
      .backend-warning{padding:10px 12px;border:1px solid rgba(246,183,60,.45);background:rgba(246,183,60,.09);color:#f6c55d;border-radius:14px;font-size:12px;line-height:1.4}
      .status-card{display:flex;align-items:center;gap:14px;padding:${this._cssSize(d.card_padding,"17px")};border:1px solid ${d.card_border_color};border-radius:${this._cssSize(d.card_radius,"20px")};background:${d.card_background};box-shadow:${d.card_shadow};cursor:pointer;min-height:92px}.status-card:hover{border-color:color-mix(in srgb,var(--status-color),${d.card_border_color} 55%)}.status-icon{width:52px;height:52px;border-radius:16px;display:flex;align-items:center;justify-content:center;background:color-mix(in srgb,var(--status-color) 12%,transparent);flex:0 0 auto}.status-copy{min-width:0}.status-title{font-size:12px;color:${d.label_color};font-weight:600;margin-bottom:5px}.status-value{font-size:18px;font-weight:680;display:flex;align-items:center;gap:8px}.status-dot{width:8px;height:8px;border-radius:50%;background:var(--status-color);box-shadow:0 0 0 4px color-mix(in srgb,var(--status-color) 12%,transparent)}.status-duration{font-size:11px;color:${d.muted_color};margin-top:5px}.missing-entity{font-size:10px;color:${d.danger_color};margin-top:4px;word-break:break-all}.support-timer-card{padding:16px 17px 15px;border:1px solid color-mix(in srgb,var(--timer-color),${d.card_border_color} 72%);border-radius:${this._cssSize(d.card_radius,"20px")};background:${d.card_background};box-shadow:${d.card_shadow}}.support-timer-head{display:flex;align-items:center;justify-content:space-between;gap:10px}.support-timer-title{display:flex;align-items:center;gap:8px;color:${d.label_color};font-size:13px;font-weight:650}.support-timer-live{display:flex;align-items:center;gap:6px;font-size:9px;font-weight:750;letter-spacing:.7px;color:var(--timer-color)}.support-timer-live span{width:7px;height:7px;border-radius:50%;background:var(--timer-color);box-shadow:0 0 0 4px color-mix(in srgb,var(--timer-color) 12%,transparent)}.support-countdown{font-variant-numeric:tabular-nums;letter-spacing:1.5px;font-weight:760;line-height:1.05;margin:14px 0 11px;color:${d.value_color}}.support-expiry{display:flex;align-items:center;justify-content:space-between;gap:12px;padding-top:10px;border-top:1px solid ${d.card_border_color};font-size:12px}.support-expiry span{color:${d.muted_color}}.support-expiry strong{color:${d.value_color};font-weight:650;text-align:right}.support-progress{height:5px;border-radius:999px;overflow:hidden;background:color-mix(in srgb,${d.card_border_color} 78%,transparent);margin-top:12px}.support-progress span{display:block;height:100%;border-radius:inherit;background:var(--timer-color);transition:width .8s linear}
      .actions-section{display:flex;flex-direction:column;gap:9px}.section-heading{padding:0 4px}.section-title{font-size:15px;font-weight:680}.section-subtitle{font-size:12px;color:${d.muted_color};margin-top:2px}.actions-grid{display:grid;grid-template-columns:repeat(var(--cols-mobile),minmax(0,1fr));gap:var(--action-gap)}.support-action{min-height:var(--action-height);border-radius:var(--action-radius);border:1px solid var(--action-border);background:var(--action-bg);padding:14px 12px;display:flex;flex-direction:column;align-items:flex-start;justify-content:center;gap:5px;text-align:left;cursor:pointer;box-shadow:${d.card_shadow};transition:transform .12s ease,border-color .12s ease,opacity .12s ease;touch-action:pan-y}.support-action:hover:not(.disabled){border-color:color-mix(in srgb,var(--action-icon),var(--action-border) 60%)}.support-action:active:not(.disabled){transform:scale(.985)}.support-action.wide{grid-column:1/-1;min-height:80px;display:grid;grid-template-columns:auto 1fr;grid-template-rows:auto auto;column-gap:12px;align-items:center}.support-action.wide .action-icon{grid-row:1/3}.support-action.disabled{opacity:.42;cursor:not-allowed}.action-icon{display:flex;align-items:center;justify-content:center;width:42px;height:42px;border-radius:13px;background:color-mix(in srgb,var(--action-icon) 11%,transparent);margin-bottom:3px}.action-label{font-size:14px;font-weight:680;line-height:1.2}.action-secondary{font-size:11px;color:${d.muted_color};line-height:1.25}
      .identity-card{display:flex;flex-direction:column;align-items:center;text-align:center;padding:18px 12px 10px;gap:7px}.business-logo{object-fit:contain;border-radius:18px}.business-logo.fallback{display:flex;align-items:center;justify-content:center;border:1px solid ${d.card_border_color};background:${d.card_background}}.business-name{font-weight:670}.business-attribution{font-weight:500;letter-spacing:.15px}
      .panel-nav{display:grid;grid-template-columns:repeat(var(--nav-cols),minmax(0,1fr));gap:var(--nav-gap)}.nav-button{height:var(--nav-height);border-radius:var(--nav-radius);border:1px solid var(--nav-border);background:var(--nav-bg);color:var(--nav-text);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;cursor:pointer;font-size:var(--nav-font);min-width:0}.nav-button span{max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.nav-button.active{border-color:color-mix(in srgb,var(--nav-color),var(--nav-border) 45%)}
      .version{text-align:center;color:${d.muted_color};font-size:9px;padding:2px 0 4px}
      .toast{position:fixed;left:50%;bottom:max(18px,calc(env(safe-area-inset-bottom) + 12px));transform:translateX(-50%);z-index:1000;background:#182129;color:#f5f7fa;border:1px solid #2b3943;border-radius:12px;padding:10px 14px;box-shadow:0 12px 34px rgba(0,0,0,.35);font-size:13px;max-width:min(90vw,420px);text-align:center}.toast.error{border-color:rgba(239,100,97,.55);color:#ffb0ae}.toast.ok{border-color:rgba(102,209,122,.45)}
      .drawer-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.46);z-index:200}.drawer{position:fixed;right:0;top:0;bottom:0;width:min(520px,100vw);background:#0c1217;border-left:1px solid #26323a;z-index:201;display:grid;grid-template-rows:auto auto minmax(0,1fr) auto;box-shadow:-18px 0 55px rgba(0,0,0,.36)}.drawer-head{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:16px 16px 12px;border-bottom:1px solid #1f2a31}.drawer-title{font-size:20px;font-weight:720}.drawer-close{border:0;background:transparent;width:40px;height:40px;border-radius:12px;cursor:pointer;display:flex;align-items:center;justify-content:center}.tabs{display:flex;gap:5px;overflow-x:auto;padding:10px 12px;border-bottom:1px solid #1f2a31;scrollbar-width:thin}.tab{border:1px solid #26323a;background:#11181e;color:#9ba7b0;border-radius:12px;padding:8px 10px;white-space:nowrap;cursor:pointer;font-size:12px}.tab.active{color:#eefdfc;border-color:rgba(53,221,213,.55);background:rgba(53,221,213,.10)}.drawer-body{overflow:auto;padding:14px 14px 24px;overscroll-behavior:contain}.drawer-foot{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:12px 14px calc(12px + env(safe-area-inset-bottom));border-top:1px solid #1f2a31;background:#0c1217}.foot-left,.foot-right{display:flex;gap:7px;flex-wrap:wrap}.editor-btn{border:1px solid #2b3943;background:#11181e;color:#d9e0e5;border-radius:11px;padding:9px 11px;cursor:pointer;font-size:12px}.editor-btn.primary{background:#35ddd5;color:#061113;border-color:#35ddd5;font-weight:700}.editor-btn.danger{color:#ff9d9b;border-color:rgba(239,100,97,.42)}
      .editor-section{display:flex;flex-direction:column;gap:12px}.editor-card{border:1px solid #26323a;border-radius:16px;background:#10171c;padding:13px}.editor-card-title{font-size:14px;font-weight:700;margin-bottom:11px}.editor-card-subtitle{font-size:11px;color:#7f8b94;margin:-6px 0 11px}.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.field{display:flex;flex-direction:column;gap:5px;min-width:0}.field.full{grid-column:1/-1}.field label{font-size:11px;color:#9aa6af;font-weight:600}.field input,.field select,.field textarea{width:100%;border:1px solid #2b3943;background:#0a1014;color:#f5f7fa;border-radius:10px;padding:9px 10px;outline:none;font-size:12px}.field input:focus,.field select:focus,.field textarea:focus{border-color:#35ddd5}.field textarea{min-height:90px;resize:vertical}.inline-field{display:grid;grid-template-columns:1fr auto;gap:7px}.tiny-btn{border:1px solid #2b3943;background:#151e24;color:#d9e0e5;border-radius:10px;padding:8px 9px;cursor:pointer;font-size:11px;white-space:nowrap}.switch-row{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:4px 0}.switch-row span{font-size:12px}.switch-row input{width:18px;height:18px}.helper{font-size:10px;color:#73808a;line-height:1.35}.verification{margin-top:10px;padding:10px 11px;border-radius:11px;font-size:11px;line-height:1.45}.verification.ok{border:1px solid rgba(102,209,122,.38);background:rgba(102,209,122,.08);color:#9be6aa}.verification.bad{border:1px solid rgba(246,183,60,.42);background:rgba(246,183,60,.08);color:#f6c55d}.list-item{border:1px solid #26323a;border-radius:14px;padding:12px;background:#0d1419;margin-bottom:10px}.list-item-head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:10px}.list-item-title{font-size:13px;font-weight:700;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.list-controls{display:flex;gap:5px}.icon-mini{width:31px;height:31px;border:1px solid #2b3943;background:#151e24;border-radius:9px;display:flex;align-items:center;justify-content:center;cursor:pointer}.add-btn{width:100%;border:1px dashed #3b4b56;background:rgba(53,221,213,.04);color:#9edbd7;border-radius:13px;padding:11px;cursor:pointer}.json-area{min-height:360px!important;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:11px!important;line-height:1.45}
      .dialog-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.60);z-index:400;display:flex;align-items:center;justify-content:center;padding:18px}.dialog{width:min(520px,100%);max-height:min(80vh,720px);overflow:auto;border:1px solid #31404a;background:#0d1419;border-radius:18px;box-shadow:0 22px 70px rgba(0,0,0,.5);padding:16px}.dialog-title{font-size:17px;font-weight:720;margin-bottom:12px}.dialog-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:14px}.native-picker-host{min-height:52px;border:1px solid #26323a;border-radius:12px;padding:10px;background:#0a1014}.confirm-copy{color:#c8d0d6;font-size:13px;line-height:1.5}.system-grid{display:grid;grid-template-columns:auto 1fr;gap:7px 12px;font-size:12px}.system-grid .k{color:#84919a}.system-grid .v{color:#f5f7fa;word-break:break-word}.diagnostic-box{margin-top:12px;border:1px solid #26323a;background:#080d11;border-radius:12px;padding:10px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:10px;white-space:pre-wrap;color:#aab5bc}
      @media(min-width:680px){.actions-grid{grid-template-columns:repeat(var(--cols-desktop),minmax(0,1fr))}.page{padding-top:18px}.drawer-backdrop{background:rgba(0,0,0,.22)}}
      @media(max-width:560px){.drawer{width:100vw}.drawer-backdrop{display:none}.form-grid{grid-template-columns:1fr}.field.full{grid-column:auto}.settings-btn{position:absolute}.page{position:relative}.drawer-head{padding-top:calc(14px + env(safe-area-inset-top))}}
    </style>`;
  }

  _render() {
    if (!this.shadowRoot) return;
    const cfg = this._config();
    const navTop = cfg.navigation.show && cfg.navigation.position === "top" ? this._renderNavigation(cfg) : "";
    const navBottom = cfg.navigation.show && cfg.navigation.position !== "top" ? this._renderNavigation(cfg) : "";
    const admin = Boolean(this._hass?.user?.is_admin);
    this.shadowRoot.innerHTML = `${this._styles(cfg)}
      <div class="page">
        ${admin ? `<button class="settings-btn" data-command="open-editor" aria-label="Personalización">${this._icon("mdi:cog",22,cfg.design.label_color)}</button>` : ""}
        <main class="panel">
          ${this._renderHeader(cfg)}
          ${!this._backendOk ? `<div class="backend-warning">El backend ${BACKEND_DOMAIN} no está disponible. El panel funciona con valores predeterminados, pero no podrá guardar cambios.</div>` : ""}
          ${navTop}
          ${this._renderStatus(cfg)}
          ${this._renderSupportTimer(cfg)}
          ${this._renderActions(cfg)}
          ${this._renderIdentity(cfg)}
          ${navBottom}
          <div class="version">Support Panel v${PANEL_VERSION}</div>
        </main>
      </div>
      ${this._editorOpen ? this._renderEditor(cfg) : ""}
      ${this._dialog ? this._renderDialog(cfg) : ""}`;
    if (this._dialog?.native) requestAnimationFrame(() => this._mountNativePicker());
  }

  _field(path, label, type = "text", extra = {}) {
    const cfg = this._editConfig || this._config();
    const value = this._getPath(cfg, path);
    const full = extra.full ? "full" : "";
    if (type === "checkbox") {
      return `<div class="field ${full}"><div class="switch-row"><span>${this._escape(label)}</span><input type="checkbox" data-path="${this._escape(path)}" data-type="bool" ${value ? "checked" : ""}></div>${extra.help ? `<div class="helper">${this._escape(extra.help)}</div>` : ""}</div>`;
    }
    if (type === "select") {
      const options = (extra.options || []).map(([v,l]) => `<option value="${this._escape(v)}" ${String(value) === String(v) ? "selected" : ""}>${this._escape(l)}</option>`).join("");
      return `<div class="field ${full}"><label>${this._escape(label)}</label><select data-path="${this._escape(path)}" data-type="string">${options}</select>${extra.help ? `<div class="helper">${this._escape(extra.help)}</div>` : ""}</div>`;
    }
    if (type === "textarea") {
      return `<div class="field ${full}"><label>${this._escape(label)}</label><textarea data-path="${this._escape(path)}" data-type="string" ${extra.json ? 'data-json-editor="1"' : ""}>${this._escape(value ?? "")}</textarea>${extra.help ? `<div class="helper">${this._escape(extra.help)}</div>` : ""}</div>`;
    }
    const inputType = ["number","color","url","tel"].includes(type) ? type : "text";
    const step = extra.step ? `step="${this._escape(extra.step)}"` : "";
    const min = extra.min !== undefined ? `min="${this._escape(extra.min)}"` : "";
    const max = extra.max !== undefined ? `max="${this._escape(extra.max)}"` : "";
    return `<div class="field ${full}"><label>${this._escape(label)}</label><input type="${inputType}" value="${this._escape(value ?? "")}" data-path="${this._escape(path)}" data-type="${inputType === "number" ? "number" : "string"}" ${step} ${min} ${max}>${extra.help ? `<div class="helper">${this._escape(extra.help)}</div>` : ""}</div>`;
  }

  _iconField(path, label, full = false) {
    const cfg = this._editConfig || this._config();
    const value = this._getPath(cfg, path) || "";
    return `<div class="field ${full ? "full" : ""}"><label>${this._escape(label)}</label><div class="inline-field"><input type="text" value="${this._escape(value)}" data-path="${this._escape(path)}" data-type="string" placeholder="mdi:icon"><button class="tiny-btn" data-command="pick-icon" data-picker-path="${this._escape(path)}">Buscar icono</button></div><div class="helper">Puedes escribir mdi:... manualmente. El selector nativo es opcional.</div></div>`;
  }

  _entityField(path, label, domain = "", full = false) {
    const cfg = this._editConfig || this._config();
    const value = this._getPath(cfg, path) || "";
    return `<div class="field ${full ? "full" : ""}"><label>${this._escape(label)}</label><div class="inline-field"><input type="text" value="${this._escape(value)}" data-path="${this._escape(path)}" data-type="string" placeholder="${domain ? `${domain}.` : "domain.entity"}"><button class="tiny-btn" data-command="pick-entity" data-picker-path="${this._escape(path)}" data-picker-domain="${this._escape(domain)}">Seleccionar</button></div><div class="helper">La entrada manual siempre permanece disponible.</div></div>`;
  }

  _editorGeneral() {
    return `<div class="editor-section">
      <div class="editor-card"><div class="editor-card-title">Encabezado</div><div class="form-grid">
        ${this._field("header.show","Mostrar encabezado","checkbox",{full:true})}
        ${this._field("header.title","Título")}${this._field("header.subtitle","Subtítulo")}
        ${this._iconField("header.icon","Icono",true)}
        ${this._field("header.align","Alineación","select",{options:[["left","Izquierda"],["center","Centro"],["right","Derecha"]]})}
        ${this._field("header.title_size","Tamaño título","number",{min:12,max:60})}
        ${this._field("header.subtitle_size","Tamaño subtítulo","number",{min:9,max:30})}
        ${this._field("header.icon_size","Tamaño icono","number",{min:14,max:72})}
        ${this._field("header.icon_color","Color icono","color")}
        ${this._field("header.title_color","Color título","color")}
        ${this._field("header.subtitle_color","Color subtítulo","color")}
      </div></div>
      <div class="editor-card"><div class="editor-card-title">Diseño general</div><div class="form-grid">
        ${this._field("design.panel_max_width","Ancho máximo","number",{min:320,max:1200})}
        ${this._field("design.panel_padding","Margen exterior","number",{min:0,max:50})}
        ${this._field("design.gap","Separación","number",{min:0,max:40})}
        ${this._field("design.card_radius","Radio tarjetas","number",{min:0,max:50})}
        ${this._field("design.background","Fondo","color")}
        ${this._field("design.background_secondary","Fondo superior","color")}
        ${this._field("design.card_background","Fondo tarjetas","color")}
        ${this._field("design.card_border_color","Borde tarjetas","color")}
        ${this._field("design.accent_color","Acento","color")}
        ${this._field("design.value_color","Texto principal","color")}
        ${this._field("design.label_color","Texto secundario","color")}
      </div></div>
    </div>`;
  }

  _editorStatus() {
    const verify = this._verificationResult || this._supportState?.verification;
    const verifyHtml = verify ? `<div class="verification ${verify.ready ? "ok" : "bad"}"><b>${verify.ready ? "✓" : "⚠"} ${this._escape(verify.message || "")}</b>${verify.user_name ? `<div>Usuario: ${this._escape(verify.user_name)} · ${verify.user_active ? "activo" : "desactivado"}</div>` : ""}${verify.spook_available ? "" : `<div>Se requiere Spook con gestión de usuarios.</div>`}</div>` : "";
    return `<div class="editor-section">
      <div class="editor-card"><div class="editor-card-title">Soporte remoto integrado</div><div class="editor-card-subtitle">La lógica vive en el backend de Smart Support Panel. No necesitas input_button, timer, scripts ni automatizaciones auxiliares.</div><div class="form-grid">
        ${this._field("remote_support.enabled","Habilitar soporte remoto","checkbox",{full:true})}
        ${this._field("remote_support.user_id","ID del usuario de soporte","text",{full:true,help:"Obtén el ID en Ajustes → Personas → usuario → pestaña Usuario. Debe ser una cuenta independiente de administrador, nunca el propietario."})}
        ${this._field("remote_support.min_hours","Duración mínima (h)","number",{min:2,max:168})}
        ${this._field("remote_support.default_hours","Duración predeterminada (h)","number",{min:2,max:168})}
        ${this._field("remote_support.max_hours","Duración máxima (h)","number",{min:2,max:168})}
        ${this._field("remote_support.extension_hours","Extensión rápida (h)","number",{min:2,max:168})}
        ${this._field("remote_support.close_on_restart","Cerrar soporte al reiniciar Home Assistant","checkbox",{full:true,help:"Recomendado: activado. Un reinicio obliga a autorizar de nuevo el acceso."})}
      </div><div style="margin-top:12px"><button class="editor-btn" data-command="verify-support">Verificar configuración</button></div>${verifyHtml}
      <div class="helper" style="margin-top:10px">Acciones requeridas de Spook: <b>homeassistant.enable_user</b> y <b>homeassistant.disable_user</b>. Entidades creadas automáticamente: <b>binary_sensor.soporte_remoto_activo</b>, <b>sensor.soporte_remoto_expira</b> y <b>sensor.soporte_remoto_tiempo_restante</b>.</div>
      </div>
      <div class="editor-card"><div class="editor-card-title">Presentación del estado</div><div class="form-grid">
        ${this._field("status.show","Mostrar estado","checkbox",{full:true})}
        ${this._entityField("status.entity","Entidad para Más información","binary_sensor",true)}
        ${this._field("status.title","Título","text",{full:true})}
        ${this._field("status.active_label","Texto activo")}${this._field("status.inactive_label","Texto inactivo")}
        ${this._field("status.unknown_label","Texto no configurado","text",{full:true})}
        ${this._iconField("status.active_icon","Icono activo")}${this._iconField("status.inactive_icon","Icono inactivo")}
        ${this._iconField("status.unknown_icon","Icono no configurado",true)}
        ${this._field("status.active_color","Color activo","color")}${this._field("status.inactive_color","Color inactivo","color")}
        ${this._field("status.unknown_color","Color no configurado","color")}
        ${this._field("status.show_remaining","Mostrar contador grande","checkbox")}
        ${this._field("status.show_expiry","Mostrar hora de finalización","checkbox")}
        ${this._field("status.show_progress","Mostrar barra de tiempo","checkbox")}
        ${this._field("status.countdown_size","Tamaño del contador (px)","number",{min:28,max:60})}
        ${this._field("status.timer_title","Título del cuadro de tiempo","text",{full:true})}
        ${this._field("status.tap_action","Al tocar estado","select",{options:[["more_info","Más información"],["none","No hacer nada"]],full:true})}
      </div></div>
    </div>`;
  }

  _buttonEditor(button, index) {
    const p = `actions.buttons.${index}`;
    return `<div class="list-item">
      <div class="list-item-head"><div class="list-item-title">${this._escape(button.label || `Acción ${index+1}`)}</div><div class="list-controls">
        <button class="icon-mini" data-command="move-action-up" data-index="${index}" title="Subir">${this._icon("mdi:chevron-up",18,"#aeb7be")}</button>
        <button class="icon-mini" data-command="move-action-down" data-index="${index}" title="Bajar">${this._icon("mdi:chevron-down",18,"#aeb7be")}</button>
        <button class="icon-mini" data-command="delete-action" data-index="${index}" title="Eliminar">${this._icon("mdi:delete-outline",18,"#ef8c89")}</button>
      </div></div>
      <div class="form-grid">
        ${this._field(`${p}.show`,"Mostrar","checkbox")}
        ${this._field(`${p}.visibility`,"Visibilidad","select",{options:[["all","Todos"],["admin","Solo administradores"],["hidden","Oculto"]]})}
        ${this._field(`${p}.show_when`,"Mostrar según soporte","select",{options:[["always","Siempre"],["active","Solo activo"],["inactive","Solo inactivo"]]})}
        ${this._field(`${p}.label`,"Texto")}${this._field(`${p}.secondary`,"Texto secundario")}
        ${this._iconField(`${p}.icon`,"Icono",true)}
        ${this._field(`${p}.type`,"Tipo","select",{options:[["support_start","Permitir soporte"],["support_stop","Finalizar soporte"],["support_extend","Extender soporte"],["entity","Entidad"],["whatsapp","WhatsApp"],["url","URL externa"],["navigate","Navegación interna"],["system_info","Información del sistema"]],full:true})}
        ${button.type === "support_extend" ? this._field(`${p}.hours`,"Horas a extender (0 = valor global)","number",{min:0,max:168,full:true}) : ""}
        ${button.type === "entity" ? `${this._entityField(`${p}.entity`,"Entidad","",true)}${this._field(`${p}.entity_action`,"Acción de entidad","select",{options:[["press","Presionar button.*"],["turn_on","Encender"],["turn_off","Apagar"],["toggle","Alternar"],["more_info","Más información"],["none","Ninguna"]],full:true})}` : ""}
        ${button.type === "whatsapp" ? `${this._field(`${p}.whatsapp_number`,"Número WhatsApp","tel",{full:true,help:"Formato internacional. Ejemplo México: 52686..."})}${this._field(`${p}.whatsapp_message`,"Mensaje inicial","textarea",{full:true})}` : ""}
        ${button.type === "url" ? `${this._field(`${p}.url`,"URL","url",{full:true})}${this._field(`${p}.url_target`,"Abrir","select",{options:[["new","Nueva ventana/app"],["same","Misma ventana"]],full:true})}` : ""}
        ${button.type === "navigate" ? this._field(`${p}.path`,"Ruta de Home Assistant","text",{full:true,help:"Ejemplo: /smart-home o /lighting"}) : ""}
        ${this._field(`${p}.tap_behavior`,"Toque","select",{options:[["execute","Ejecutar"],["more_info","Más información"],["none","No hacer nada"]]})}
        ${this._field(`${p}.hold_behavior`,"Mantener","select",{options:[["execute","Ejecutar"],["more_info","Más información"],["none","No hacer nada"]]})}
        ${this._field(`${p}.confirmation`,"Pedir confirmación","checkbox")}
        ${this._field(`${p}.disable_when`,"Desactivar según estado","select",{options:[["never","Nunca"],["active","Cuando soporte esté activo"],["inactive","Cuando soporte esté inactivo"]]})}
        ${button.confirmation ? this._field(`${p}.confirmation_text`,"Texto de confirmación","text",{full:true}) : ""}
        ${this._field(`${p}.wide`,"Ocupar fila completa","checkbox")}
        ${this._field(`${p}.icon_color`,"Color icono","color")}
        ${this._field(`${p}.background`,"Fondo opcional")}${this._field(`${p}.border_color`,"Borde opcional")}
      </div>
    </div>`;
  }

  _editorActions(cfg) {
    const buttons = cfg.actions.buttons || [];
    return `<div class="editor-section">
      <div class="editor-card"><div class="editor-card-title">Presentación de acciones</div><div class="form-grid">
        ${this._field("actions.show","Mostrar acciones","checkbox",{full:true})}
        ${this._field("actions.title","Título")}${this._field("actions.subtitle","Subtítulo")}
        ${this._field("actions.columns_mobile","Columnas móvil","number",{min:1,max:4})}${this._field("actions.columns_desktop","Columnas escritorio","number",{min:1,max:6})}
        ${this._field("actions.button_height","Altura botones","number",{min:58,max:180})}${this._field("actions.radius","Radio","number",{min:0,max:50})}
        ${this._field("actions.gap","Separación","number",{min:0,max:40})}
      </div></div>
      <div class="editor-card"><div class="editor-card-title">Botones</div><div class="editor-card-subtitle">Puedes agregar, eliminar y reordenar acciones. Los tipos Permitir/Finalizar/Extender usan el backend integrado; las demás acciones siguen siendo totalmente configurables.</div>
        ${buttons.map((b,i)=>this._buttonEditor(b,i)).join("")}
        <button class="add-btn" data-command="add-action">+ Agregar acción</button>
      </div>
    </div>`;
  }

  _editorIdentity() {
    return `<div class="editor-section"><div class="editor-card"><div class="editor-card-title">Identidad del proveedor</div><div class="form-grid">
      ${this._field("identity.show","Mostrar identidad","checkbox",{full:true})}
      ${this._entityField("identity.image_entity","Entidad image.*","image",true)}
      ${this._field("identity.image_url","URL de imagen alternativa","url",{full:true,help:"Se usa si no hay entity_picture disponible."})}
      ${this._field("identity.image_size","Tamaño logo","number",{min:32,max:220})}
      ${this._iconField("identity.fallback_icon","Icono alternativo")}
      ${this._field("identity.business_name","Nombre del negocio","text",{full:true})}
      ${this._field("identity.business_size","Tamaño nombre","number",{min:9,max:40})}${this._field("identity.business_color","Color nombre","color")}
      ${this._field("identity.attribution","Texto inferior","text",{full:true})}
      ${this._field("identity.attribution_size","Tamaño texto inferior","number",{min:8,max:24})}${this._field("identity.attribution_color","Color texto inferior","color")}
      ${this._field("identity.installation_id","ID de instalación","text",{full:true,help:"Opcional. Aparece solo en Información del sistema; no es un secreto."})}
    </div></div></div>`;
  }

  _navEditor(button,index) {
    const p = `navigation.buttons.${index}`;
    return `<div class="list-item"><div class="list-item-head"><div class="list-item-title">${this._escape(button.label || `Navegación ${index+1}`)}</div><div class="list-controls">
      <button class="icon-mini" data-command="move-nav-up" data-index="${index}">${this._icon("mdi:chevron-up",18,"#aeb7be")}</button>
      <button class="icon-mini" data-command="move-nav-down" data-index="${index}">${this._icon("mdi:chevron-down",18,"#aeb7be")}</button>
      <button class="icon-mini" data-command="delete-nav" data-index="${index}">${this._icon("mdi:delete-outline",18,"#ef8c89")}</button>
    </div></div><div class="form-grid">
      ${this._field(`${p}.show`,"Mostrar","checkbox")}
      ${this._field(`${p}.label`,"Texto")}
      ${this._iconField(`${p}.icon`,"Icono",true)}
      ${this._field(`${p}.path`,"Ruta","text",{full:true})}
      ${this._field(`${p}.color`,"Color","color")}
    </div></div>`;
  }

  _editorNavigation(cfg) {
    return `<div class="editor-section"><div class="editor-card"><div class="editor-card-title">Barra de navegación</div><div class="form-grid">
      ${this._field("navigation.show","Mostrar navegación","checkbox",{full:true})}
      ${this._field("navigation.position","Posición","select",{options:[["top","Arriba"],["bottom","Abajo"]]})}
      ${this._field("navigation.columns","Columnas","number",{min:1,max:8})}
      ${this._field("navigation.button_height","Altura","number",{min:40,max:100})}${this._field("navigation.radius","Radio","number",{min:0,max:40})}
      ${this._field("navigation.gap","Separación","number",{min:0,max:30})}${this._field("navigation.icon_size","Tamaño icono","number",{min:12,max:50})}
      ${this._field("navigation.font_size","Tamaño texto","number",{min:8,max:22})}${this._field("navigation.show_labels","Mostrar etiquetas","checkbox")}
      ${this._field("navigation.background","Fondo","color")}${this._field("navigation.border_color","Borde","color")}
      ${this._field("navigation.text_color","Texto","color")}${this._field("navigation.active_color","Activo","color")}
    </div></div><div class="editor-card"><div class="editor-card-title">Destinos</div>
      ${(cfg.navigation.buttons||[]).map((b,i)=>this._navEditor(b,i)).join("")}
      <button class="add-btn" data-command="add-nav">+ Agregar destino</button>
    </div></div>`;
  }

  _editorAdvanced(cfg) {
    return `<div class="editor-section"><div class="editor-card"><div class="editor-card-title">Configuración JSON</div><div class="editor-card-subtitle">Uso avanzado. Aplicar JSON modifica solamente la copia de trabajo; debes pulsar Guardar para persistir.</div><div class="field full"><textarea class="json-area" data-json-editor="1">${this._escape(JSON.stringify(cfg,null,2))}</textarea></div><div style="margin-top:9px"><button class="editor-btn" data-command="apply-json">Aplicar JSON</button></div></div>
      <div class="editor-card"><div class="editor-card-title">Recuperación</div><div class="helper">Si accidentalmente ocultas elementos importantes, un administrador puede abrir este editor directamente con <b>/support?settings=1</b> o <b>/support?configure=1</b>.</div></div>
    </div>`;
  }

  _renderEditor(cfg) {
    const tabs = [["general","General"],["status","Soporte remoto"],["actions","Acciones"],["identity","Identidad"],["navigation","Navegación"],["advanced","Avanzado"]];
    const content = this._editorTab === "general" ? this._editorGeneral()
      : this._editorTab === "status" ? this._editorStatus()
      : this._editorTab === "actions" ? this._editorActions(cfg)
      : this._editorTab === "identity" ? this._editorIdentity()
      : this._editorTab === "navigation" ? this._editorNavigation(cfg)
      : this._editorAdvanced(cfg);
    return `<div class="drawer-backdrop" data-command="close-editor"></div><aside class="drawer">
      <div class="drawer-head"><div><div class="drawer-title">Personalización</div><div class="helper">Support Panel v${PANEL_VERSION}</div></div><button class="drawer-close" data-command="close-editor">${this._icon("mdi:close",23,"#cfd7dc")}</button></div>
      <div class="tabs">${tabs.map(([id,label])=>`<button class="tab ${this._editorTab===id?"active":""}" data-command="tab" data-tab="${id}">${label}</button>`).join("")}</div>
      <div class="drawer-body">${content}</div>
      <div class="drawer-foot"><div class="foot-left"><button class="editor-btn" data-command="export">Exportar</button><button class="editor-btn" data-command="import">Importar</button><button class="editor-btn danger" data-command="reset">Restablecer</button></div><div class="foot-right"><button class="editor-btn" data-command="cancel-editor">Cancelar</button><button class="editor-btn primary" data-command="save-editor">Guardar</button></div></div>
    </aside>`;
  }

  _renderDialog(cfg) {
    const d = this._dialog;
    if (!d) return "";
    if (d.kind === "confirm") {
      return `<div class="dialog-backdrop"><div class="dialog"><div class="dialog-title">Confirmar acción</div><div class="confirm-copy">${this._escape(d.text)}</div><div class="dialog-actions"><button class="editor-btn" data-command="dialog-cancel">Cancelar</button><button class="editor-btn primary" data-command="dialog-confirm">Continuar</button></div></div></div>`;
    }
    if (d.kind === "start_support") {
      const r = cfg.remote_support;
      const min = Math.max(2, this._num(r.min_hours,2));
      const max = Math.max(min, this._num(r.max_hours,24));
      const def = Math.min(max, Math.max(min, this._num(r.default_hours,4)));
      const presets = [...new Set([min, def, 8, 12, max].filter(v => v >= min && v <= max))].sort((a,b)=>a-b);
      return `<div class="dialog-backdrop"><div class="dialog"><div class="dialog-title">Permitir soporte remoto</div>
        <div class="confirm-copy">La cuenta técnica se habilitará únicamente durante el tiempo seleccionado y se desactivará automáticamente al terminar. Puedes finalizar el acceso antes en cualquier momento.</div>
        <div class="field" style="margin-top:14px"><label>Duración</label><input data-start-hours="1" type="number" min="${min}" max="${max}" step="1" value="${def}"><div class="helper">Permitido: ${min} a ${max} horas.</div></div>
        <div class="dialog-actions" style="justify-content:flex-start;flex-wrap:wrap">${presets.map(v=>`<button class="editor-btn" data-command="start-preset" data-hours="${v}">${v} h</button>`).join("")}</div>
        <div class="dialog-actions"><button class="editor-btn" data-command="dialog-cancel">Cancelar</button><button class="editor-btn primary" data-command="start-confirm">Permitir acceso</button></div>
      </div></div>`;
    }
    if (d.kind === "picker") {
      return `<div class="dialog-backdrop"><div class="dialog"><div class="dialog-title">${d.pickerType === "icon" ? "Seleccionar icono" : "Seleccionar entidad"}</div><div class="native-picker-host" data-native-picker-host="1"></div><div class="helper" style="margin-top:9px">Si el selector nativo no aparece en tu versión de Home Assistant, cancela y escribe el valor manualmente en el campo.</div><div class="dialog-actions"><button class="editor-btn" data-command="dialog-cancel">Cancelar</button></div></div></div>`;
    }
    if (d.kind === "system") {
      const diag = this._diagnostics(cfg);
      return `<div class="dialog-backdrop"><div class="dialog"><div class="dialog-title">Información del sistema</div><div class="system-grid">
        <div class="k">Support Panel</div><div class="v">${PANEL_VERSION}</div>
        <div class="k">Home Assistant</div><div class="v">${this._escape(diag.home_assistant)}</div>
        <div class="k">Instalación</div><div class="v">${this._escape(diag.installation_id || "No configurado")}</div>
        <div class="k">Soporte remoto</div><div class="v">${this._escape(diag.support_status)}</div>
        <div class="k">Tiempo restante</div><div class="v">${this._escape(diag.remaining || "—")}</div>
        <div class="k">Spook</div><div class="v">${diag.spook_available ? "Disponible" : "No disponible"}</div>
        <div class="k">Backend</div><div class="v">${this._backendOk ? "Disponible" : "No disponible"}</div>
      </div><div class="diagnostic-box">${this._escape(JSON.stringify(diag,null,2))}</div><div class="dialog-actions"><button class="editor-btn" data-command="copy-diagnostics">Copiar diagnóstico</button><button class="editor-btn primary" data-command="dialog-cancel">Cerrar</button></div></div></div>`;
    }
    return "";
  }

  _diagnostics(cfg) {
    const st = this._statusInfo(cfg);
    return {
      panel: "Smart Support Panel",
      panel_version: PANEL_VERSION,
      home_assistant: this._hass?.config?.version || "No disponible",
      installation_id: cfg.identity.installation_id || "",
      support_status: st.label || "No disponible",
      support_active: st.active,
      remaining: this._supportState?.active ? this._formatCountdown(this._remainingSeconds()) : null,
      expires_at: this._supportState?.expires_at || null,
      spook_available: Boolean(this._supportState?.verification?.spook_available),
      support_ready: Boolean(this._supportState?.verification?.ready),
      support_user_configured: Boolean(this._supportState?.config?.user_id_configured),
      backend_available: this._backendOk,
      user_is_admin: Boolean(this._hass?.user?.is_admin)
    };
  }

  _openEditor() {
    if (!this._hass?.user?.is_admin) return;
    this._editConfig = deepClone(deepMerge(DEFAULTS, this._storedConfig || {}));
    this._editorOpen = true;
    this._editorTab = "general";
    this._queueRender();
  }

  _closeEditor(discard = true) {
    this._editorOpen = false;
    if (discard) this._editConfig = null;
    this._dialog = null;
    this._queueRender();
  }

  async _saveEditor() {
    if (!this._hass?.user?.is_admin || !this._editConfig) return;
    try {
      const saved = await this._hass.callWS({ type: `${BACKEND_DOMAIN}/config/save`, config: this._editConfig });
      this._storedConfig = this._migrateConfig(deepClone(this._editConfig));
      this._verificationResult = saved?.verification || null;
      this._backendOk = true;
      this._editorOpen = false;
      this._editConfig = null;
      this._dialog = null;
      this._toast("Configuración guardada");
      await this._refreshSupportStatus(false);
      this._queueRender();
    } catch (err) {
      console.error(err);
      this._toast("No se pudo guardar la configuración", "error");
    }
  }

  async _resetConfig() {
    if (!this._hass?.user?.is_admin) return;
    if (!window.confirm("¿Restablecer toda la personalización de Support Panel?")) return;
    try {
      await this._hass.callWS({ type: `${BACKEND_DOMAIN}/config/reset` });
      this._storedConfig = this._migrateConfig({});
      this._editConfig = deepClone(DEFAULTS);
      this._backendOk = true;
      this._toast("Configuración restablecida");
      this._rerenderEditorPreserve();
    } catch (err) {
      this._toast("No se pudo restablecer", "error");
    }
  }

  _toast(message, type = "ok") {
    const old = this.shadowRoot.querySelector(".toast");
    if (old) old.remove();
    const el = document.createElement("div");
    el.className = `toast ${type}`;
    el.textContent = message;
    this.shadowRoot.appendChild(el);
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => el.remove(), 2600);
  }

  _rerenderEditorPreserve() {
    if (!this._editorOpen) { this._queueRender(); return; }
    const body = this.shadowRoot.querySelector(".drawer-body");
    const scroll = body?.scrollTop || 0;
    const active = this.shadowRoot.activeElement;
    const focusPath = active?.dataset?.path || null;
    let selStart = null, selEnd = null;
    if (active && "selectionStart" in active) { try { selStart = active.selectionStart; selEnd = active.selectionEnd; } catch (_) {} }
    this._render();
    requestAnimationFrame(() => {
      const newBody = this.shadowRoot.querySelector(".drawer-body");
      if (newBody) newBody.scrollTop = scroll;
      if (focusPath) {
        const target = [...this.shadowRoot.querySelectorAll("[data-path]")].find(el => el.dataset.path === focusPath);
        if (target) {
          target.focus();
          if (selStart !== null && "setSelectionRange" in target) { try { target.setSelectionRange(selStart, selEnd); } catch (_) {} }
        }
      }
    });
  }

  _onInput(ev) {
    const el = ev.target;
    if (!this._editorOpen || !this._editConfig || !el?.dataset?.path) return;
    const path = el.dataset.path;
    let value = el.type === "checkbox" ? el.checked : el.value;
    if (el.dataset.type === "number") value = this._num(value, 0);
    if (el.dataset.type === "bool") value = Boolean(el.checked);
    this._setPath(this._editConfig, path, value);
    // Do not rerender on every keystroke; keeps typing stable.
    if (el.type === "color" || el.type === "checkbox" || el.tagName === "SELECT") this._rerenderEditorPreserve();
  }

  _onChange(ev) {
    const el = ev.target;
    if (!this._editorOpen || !this._editConfig || !el?.dataset?.path) return;
    let value = el.type === "checkbox" ? el.checked : el.value;
    if (el.dataset.type === "number") value = this._num(value, 0);
    if (el.dataset.type === "bool") value = Boolean(el.checked);
    this._setPath(this._editConfig, el.dataset.path, value);
    this._rerenderEditorPreserve();
  }

  _onClick(ev) {
    const commandEl = ev.target.closest?.("[data-command]");
    if (commandEl) {
      ev.preventDefault();
      this._handleCommand(commandEl);
      return;
    }
    const nav = ev.target.closest?.("[data-nav-index]");
    if (nav) {
      ev.preventDefault();
      const cfg = this._config();
      const b = cfg.navigation.buttons?.[Number(nav.dataset.navIndex)];
      if (b?.path) this._navigate(b.path);
      return;
    }
    const statusCard = ev.target.closest?.("[data-status-card]");
    if (statusCard) {
      const cfg = this._config();
      if (cfg.status.tap_action === "more_info" && cfg.status.entity) this._moreInfo(cfg.status.entity);
    }
  }

  _onPointerDown(ev) {
    const btn = ev.target.closest?.("[data-action-index]");
    if (!btn || btn.classList.contains("disabled") || ev.button > 0) return;
    const index = Number(btn.dataset.actionIndex);
    const cfg = this._config();
    const action = cfg.actions.buttons?.[index];
    if (!action) return;
    this._cancelGesture();
    this._gesture = { index, x: ev.clientX, y: ev.clientY, moved: false, held: false, timer: null };
    this._gesture.timer = setTimeout(() => {
      if (!this._gesture || this._gesture.moved) return;
      this._gesture.held = true;
      this._performButtonBehavior(action, action.hold_behavior || "none");
    }, HOLD_MS);
  }

  _onPointerMove(ev) {
    if (!this._gesture) return;
    const dx = Math.abs(ev.clientX - this._gesture.x);
    const dy = Math.abs(ev.clientY - this._gesture.y);
    if (dx > MOVE_CANCEL_PX || dy > MOVE_CANCEL_PX) {
      this._gesture.moved = true;
      clearTimeout(this._gesture.timer);
    }
  }

  _onPointerUp() {
    if (!this._gesture) return;
    const g = this._gesture;
    clearTimeout(g.timer);
    this._gesture = null;
    if (g.moved || g.held) return;
    const action = this._config().actions.buttons?.[g.index];
    if (action) this._performButtonBehavior(action, action.tap_behavior || "execute");
  }

  _cancelGesture() {
    if (this._gesture?.timer) clearTimeout(this._gesture.timer);
    this._gesture = null;
  }

  _performButtonBehavior(button, behavior) {
    if (behavior === "none") return;
    if (behavior === "more_info") {
      if (button.entity) this._moreInfo(button.entity);
      return;
    }
    if (button.type === "support_start") {
      this._dialog = { kind:"start_support" };
      this._queueRender();
      return;
    }
    if (button.confirmation) {
      this._dialog = { kind: "confirm", text: button.confirmation_text || `¿Ejecutar ${button.label}?`, button: deepClone(button) };
      this._queueRender();
      return;
    }
    this._executeButton(button);
  }

  async _executeButton(button) {
    try {
      if (button.type === "support_start") { this._dialog = { kind:"start_support" }; this._queueRender(); }
      else if (button.type === "support_stop") await this._stopSupport();
      else if (button.type === "support_extend") await this._extendSupport(button.hours);
      else if (button.type === "entity") await this._executeEntity(button);
      else if (button.type === "whatsapp") this._openWhatsApp(button);
      else if (button.type === "url") this._openUrl(button.url, button.url_target);
      else if (button.type === "navigate") this._navigate(button.path);
      else if (button.type === "system_info") { this._dialog = { kind: "system" }; this._queueRender(); }
    } catch (err) {
      console.error("Smart Support Panel action error", err);
      this._toast(this._errorText(err, "No se pudo ejecutar la acción"), "error");
    }
  }

  async _executeEntity(button) {
    const entity = button.entity;
    if (!entity) return;
    const action = button.entity_action || "press";
    if (action === "none") return;
    if (action === "more_info") { this._moreInfo(entity); return; }
    const domain = entity.split(".")[0];
    if (action === "press") {
      if (domain === "button" || domain === "input_button") await this._hass.callService(domain, "press", { entity_id: entity });
      else if (domain === "script") await this._hass.callService("script", "turn_on", { entity_id: entity });
      else await this._hass.callService("homeassistant", "toggle", { entity_id: entity });
    } else if (action === "turn_on") await this._hass.callService("homeassistant", "turn_on", { entity_id: entity });
    else if (action === "turn_off") await this._hass.callService("homeassistant", "turn_off", { entity_id: entity });
    else if (action === "toggle") await this._hass.callService("homeassistant", "toggle", { entity_id: entity });
  }

  _errorText(err, fallback) {
    return err?.message || err?.error?.message || err?.code || fallback;
  }

  async _startSupport(hours) {
    if (this._supportBusy) return;
    this._supportBusy = true;
    this._queueRender();
    try {
      const result = await this._hass.callWS({ type:`${BACKEND_DOMAIN}/support/start`, hours:Number(hours) });
      this._supportState = result;
      this._verificationResult = result?.verification || this._verificationResult;
      this._dialog = null;
      this._toast("Soporte remoto habilitado");
    } catch (err) {
      console.error(err);
      this._toast(this._errorText(err,"No se pudo habilitar el soporte"),"error");
    } finally {
      this._supportBusy = false;
      await this._refreshSupportStatus(false);
      this._queueRender();
    }
  }

  async _stopSupport() {
    if (this._supportBusy) return;
    this._supportBusy = true;
    this._queueRender();
    try {
      const result = await this._hass.callWS({ type:`${BACKEND_DOMAIN}/support/stop` });
      this._supportState = result;
      this._toast("Soporte remoto finalizado");
    } catch (err) {
      console.error(err);
      this._toast(this._errorText(err,"No se pudo finalizar el soporte"),"error");
    } finally {
      this._supportBusy = false;
      await this._refreshSupportStatus(false);
      this._queueRender();
    }
  }

  async _extendSupport(hours = 0) {
    if (this._supportBusy) return;
    const cfg = this._config();
    const amount = Number(hours) > 0 ? Number(hours) : this._num(cfg.remote_support.extension_hours,2);
    this._supportBusy = true;
    this._queueRender();
    try {
      const result = await this._hass.callWS({ type:`${BACKEND_DOMAIN}/support/extend`, hours:amount });
      this._supportState = result;
      this._toast(`Soporte extendido +${amount} h`);
    } catch (err) {
      console.error(err);
      this._toast(this._errorText(err,"No se pudo extender el soporte"),"error");
    } finally {
      this._supportBusy = false;
      await this._refreshSupportStatus(false);
      this._queueRender();
    }
  }

  async _verifySupport() {
    if (!this._hass?.user?.is_admin) return;
    const cfg = this._editConfig || this._config();
    try {
      this._verificationResult = await this._hass.callWS({
        type:`${BACKEND_DOMAIN}/support/verify`,
        user_id:String(cfg.remote_support?.user_id || "").trim(),
        enabled:Boolean(cfg.remote_support?.enabled)
      });
      this._toast(this._verificationResult?.ready ? "Configuración de soporte correcta" : "Revisa la configuración", this._verificationResult?.ready ? "ok" : "error");
    } catch (err) {
      this._verificationResult = { ready:false, message:this._errorText(err,"No se pudo verificar") };
      this._toast(this._verificationResult.message,"error");
    }
    if (this._editorOpen) this._rerenderEditorPreserve(); else this._queueRender();
  }

  _moreInfo(entityId) {
    if (!entityId) return;
    this.dispatchEvent(new CustomEvent("hass-more-info", { detail: { entityId }, bubbles: true, composed: true }));
  }

  _openWhatsApp(button) {
    const number = String(button.whatsapp_number || "").replace(/\D/g, "");
    if (!number) return;
    const message = String(button.whatsapp_message || "");
    const url = `https://wa.me/${number}${message ? `?text=${encodeURIComponent(message)}` : ""}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  _openUrl(url, target = "new") {
    if (!url) return;
    if (target === "same") window.location.href = url;
    else window.open(url, "_blank", "noopener,noreferrer");
  }

  _navigate(path) {
    if (!path) return;
    if (/^https?:\/\//i.test(path)) { this._openUrl(path, "same"); return; }
    history.pushState(null, "", path);
    window.dispatchEvent(new Event("location-changed"));
  }

  _handleCommand(el) {
    const cmd = el.dataset.command;
    if (cmd === "open-editor") this._openEditor();
    else if (["close-editor","cancel-editor"].includes(cmd)) this._closeEditor(true);
    else if (cmd === "save-editor") this._saveEditor();
    else if (cmd === "tab") { this._editorTab = el.dataset.tab || "general"; this._queueRender(); }
    else if (cmd === "reset") this._resetConfig();
    else if (cmd === "export") this._exportConfig();
    else if (cmd === "import") this._importConfig();
    else if (cmd === "apply-json") this._applyJson();
    else if (cmd === "add-action") this._addAction();
    else if (cmd === "delete-action") this._deleteFromList("actions.buttons", Number(el.dataset.index));
    else if (cmd === "move-action-up") this._moveInList("actions.buttons", Number(el.dataset.index), -1);
    else if (cmd === "move-action-down") this._moveInList("actions.buttons", Number(el.dataset.index), 1);
    else if (cmd === "add-nav") this._addNav();
    else if (cmd === "delete-nav") this._deleteFromList("navigation.buttons", Number(el.dataset.index));
    else if (cmd === "move-nav-up") this._moveInList("navigation.buttons", Number(el.dataset.index), -1);
    else if (cmd === "move-nav-down") this._moveInList("navigation.buttons", Number(el.dataset.index), 1);
    else if (cmd === "pick-icon") this._openPicker("icon", el.dataset.pickerPath, "");
    else if (cmd === "pick-entity") this._openPicker("entity", el.dataset.pickerPath, el.dataset.pickerDomain || "");
    else if (cmd === "verify-support") this._verifySupport();
    else if (cmd === "start-preset") { const input = this.shadowRoot.querySelector("[data-start-hours]"); if (input) input.value = el.dataset.hours || input.value; }
    else if (cmd === "start-confirm") { const input = this.shadowRoot.querySelector("[data-start-hours]"); const cfg = this._config().remote_support; const min = this._num(cfg.min_hours,2); const max = this._num(cfg.max_hours,24); const hours = Math.min(max, Math.max(min, this._num(input?.value,cfg.default_hours))); this._startSupport(hours); }
    else if (cmd === "dialog-cancel") { this._dialog = null; this._queueRender(); }
    else if (cmd === "dialog-confirm") { const b = this._dialog?.button; this._dialog = null; this._queueRender(); if (b) this._executeButton(b); }
    else if (cmd === "copy-diagnostics") this._copyDiagnostics();
  }

  _addAction() {
    const list = this._editConfig.actions.buttons || (this._editConfig.actions.buttons = []);
    list.push({
      id: `action_${Date.now()}`, show: true, visibility: "all", show_when: "always", label: "Nueva acción", secondary: "", icon: "mdi:gesture-tap-button",
      type: "entity", entity: "", entity_action: "press", tap_behavior: "execute", hold_behavior: "more_info", confirmation: false,
      confirmation_text: "", disable_when: "never", wide: false, icon_color: this._editConfig.design.accent_color, background: "", border_color: ""
    });
    this._rerenderEditorPreserve();
  }

  _addNav() {
    const list = this._editConfig.navigation.buttons || (this._editConfig.navigation.buttons = []);
    list.push({ id:`nav_${Date.now()}`, show:true, label:"Nuevo", icon:"mdi:circle-outline", path:"/", color:this._editConfig.design.accent_color });
    this._editConfig.navigation.show = true;
    this._rerenderEditorPreserve();
  }

  _deleteFromList(path,index) {
    const list = this._getPath(this._editConfig,path);
    if (!Array.isArray(list) || index < 0 || index >= list.length) return;
    list.splice(index,1);
    this._rerenderEditorPreserve();
  }

  _moveInList(path,index,delta) {
    const list = this._getPath(this._editConfig,path);
    if (!Array.isArray(list)) return;
    const to = index + delta;
    if (index < 0 || to < 0 || index >= list.length || to >= list.length) return;
    [list[index],list[to]] = [list[to],list[index]];
    this._rerenderEditorPreserve();
  }

  _openPicker(pickerType,path,domain) {
    this._dialog = { kind:"picker", native:true, pickerType, path, domain };
    this._queueRender();
  }

  _mountNativePicker() {
    const host = this.shadowRoot.querySelector("[data-native-picker-host]");
    if (!host || !this._dialog || this._dialog.kind !== "picker") return;
    const d = this._dialog;
    try {
      const selector = document.createElement("ha-selector");
      selector.hass = this._hass;
      selector.selector = d.pickerType === "icon" ? { icon: {} } : { entity: d.domain ? { domain: d.domain } : {} };
      selector.value = this._getPath(this._editConfig, d.path) || "";
      selector.addEventListener("value-changed", (ev) => {
        const value = ev.detail?.value;
        if (value !== undefined && value !== null && String(value)) {
          this._setPath(this._editConfig, d.path, value);
          this._dialog = null;
          this._rerenderEditorPreserve();
        }
      });
      host.replaceChildren(selector);
    } catch (err) {
      console.debug("ha-selector no disponible", err);
      if (d.pickerType === "icon" && customElements.get("ha-icon-picker")) {
        try {
          const picker = document.createElement("ha-icon-picker");
          picker.hass = this._hass;
          picker.value = this._getPath(this._editConfig, d.path) || "";
          picker.addEventListener("value-changed", (ev) => {
            const value = ev.detail?.value;
            if (value) { this._setPath(this._editConfig, d.path, value); this._dialog = null; this._rerenderEditorPreserve(); }
          });
          host.replaceChildren(picker);
        } catch (_) {}
      }
    }
  }

  _exportConfig() {
    if (!this._editConfig) return;
    const blob = new Blob([JSON.stringify(this._editConfig,null,2)], { type:"application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "smart-support-panel-config.json";
    a.click();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
  }

  _importConfig() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json,application/json";
    input.addEventListener("change", async () => {
      const file = input.files?.[0];
      if (!file) return;
      try {
        const data = JSON.parse(await file.text());
        if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error("Formato inválido");
        this._editConfig = this._migrateConfig(data);
        this._toast("Configuración importada; pulsa Guardar");
        this._rerenderEditorPreserve();
      } catch (err) { this._toast("JSON de configuración inválido", "error"); }
    });
    input.click();
  }

  _applyJson() {
    const area = this.shadowRoot.querySelector("[data-json-editor]");
    if (!area) return;
    try {
      const data = JSON.parse(area.value);
      if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error("Formato inválido");
      this._editConfig = this._migrateConfig(data);
      this._toast("JSON aplicado; pulsa Guardar");
      this._rerenderEditorPreserve();
    } catch (err) { this._toast("JSON inválido", "error"); }
  }

  async _copyDiagnostics() {
    const text = JSON.stringify(this._diagnostics(this._config()), null, 2);
    try {
      await navigator.clipboard.writeText(text);
      this._toast("Diagnóstico copiado");
    } catch (_) {
      const ta = document.createElement("textarea"); ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); ta.remove(); this._toast("Diagnóstico copiado");
    }
  }
}

if (!customElements.get("smart-support-panel")) customElements.define("smart-support-panel", SmartSupportPanel);
