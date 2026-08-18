/**
 * Smart Home Suite · Smart Lighting layout runtime v1.1.0
 *
 * Base frontend preserved:
 *   Smart Lighting Panel V1.0.3
 *
 * Runtime features:
 * - ordering runtime v1.0.0: reorderable areas and devices;
 * - global actions runtime v1.0.0: optional Turn all off / Turn all on area;
 * - live preview through the existing editor working copy;
 * - effective module version label 1.2.0.
 *
 * Storage remains smart_lighting_panel.config (storage version 1).
 * No migration is required. Existing arrays keep their current schema and the
 * optional global_actions object is ignored by older builds if rolled back.
 */

import "./smart-lighting-panel.js?v=103-suite150-base";

const SMART_LIGHTING_LAYOUT_RUNTIME_VERSION = "1.1.0";
const SMART_LIGHTING_ORDERING_RUNTIME_VERSION = "1.0.0";
const SMART_LIGHTING_GLOBAL_ACTIONS_RUNTIME_VERSION = "1.0.0";
const SMART_LIGHTING_EFFECTIVE_VERSION = "1.2.0";
const LAYOUT_MARKER = Symbol.for(
  "smart-home-suite-smart-lighting-layout-v1.1.0"
);

const GLOBAL_ACTION_DEFAULTS = Object.freeze({
  show: false,
  title: "Acciones globales",
  icon: "mdi:lightbulb-group",
  icon_color: "#ffd66b",
  show_count: true,
  scope: "all",
  off_button: {
    show: true,
    label: "Apagar todo",
    icon: "mdi:lightbulb-group-off",
    color: "#ef6461",
  },
  on_button: {
    show: true,
    label: "Encender todo",
    icon: "mdi:lightbulb-group",
    color: "#ffd66b",
  },
});

function escapeValue(panel, value) {
  return panel?._escape ? panel._escape(value) : String(value ?? "");
}

function globalActionsConfig(cfg) {
  const source = cfg?.global_actions && typeof cfg.global_actions === "object"
    ? cfg.global_actions
    : {};
  const off = source.off_button && typeof source.off_button === "object"
    ? source.off_button
    : {};
  const on = source.on_button && typeof source.on_button === "object"
    ? source.on_button
    : {};

  return {
    ...GLOBAL_ACTION_DEFAULTS,
    ...source,
    scope: source.scope === "visible" ? "visible" : "all",
    off_button: { ...GLOBAL_ACTION_DEFAULTS.off_button, ...off },
    on_button: { ...GLOBAL_ACTION_DEFAULTS.on_button, ...on },
  };
}

function moveButton(action, direction, attrs, disabled, label) {
  return `<button
    class="tiny-btn lighting-order-button"
    type="button"
    data-action="${action}"
    data-direction="${direction}"
    ${attrs}
    ${disabled ? "disabled" : ""}
    aria-label="${label}"
    title="${label}"
  >${direction < 0 ? "↑" : "↓"}</button>`;
}

function renderAreaOrderEditor(panel, cfg) {
  const areas = Array.isArray(cfg?.areas) ? cfg.areas : [];
  const rows = areas.map((area, index) => {
    const id = String(area?.id || "");
    const label = area?.name || id || `Área ${index + 1}`;
    const icon = area?.icon || "mdi:home-outline";
    const color = area?.icon_color || cfg?.design?.accent_color || "#ffd66b";
    const count = Array.isArray(area?.devices) ? area.devices.length : 0;
    const attrs = `data-area-id="${escapeValue(panel, id)}" data-area-index="${index}"`;

    return `
      <div class="lighting-order-row">
        <div class="lighting-order-main">
          <span class="lighting-order-icon">${panel._icon(icon, 21, color)}</span>
          <span class="lighting-order-copy">
            <span class="lighting-order-name">${escapeValue(panel, label)}</span>
            <span class="lighting-order-meta">${area?.show === false ? "Oculta" : "Visible"} · ${count} dispositivo${count === 1 ? "" : "s"}</span>
          </span>
        </div>
        <div class="row-actions">
          ${moveButton("move-lighting-area", -1, attrs, index === 0, "Subir área")}
          ${moveButton("move-lighting-area", 1, attrs, index === areas.length - 1, "Bajar área")}
        </div>
      </div>`;
  }).join("");

  return panel._section(
    "Orden de áreas",
    `<div class="help">
      Cambia la posición completa de las áreas. El orden se refleja inmediatamente en la vista previa.
      Guardar lo persiste; Cancelar vuelve al último orden guardado. Las áreas nuevas aparecen aquí automáticamente.
    </div>
    <div class="lighting-order-list">
      ${rows || '<div class="help">No hay áreas configuradas.</div>'}
    </div>`
  );
}

function renderDeviceOrderEditor(panel, cfg) {
  const areas = Array.isArray(cfg?.areas) ? cfg.areas : [];

  const groups = areas.map((area, areaIndex) => {
    const devices = Array.isArray(area?.devices) ? area.devices : [];
    if (!devices.length) return "";

    const areaId = String(area?.id || "");
    const areaLabel = area?.name || areaId || `Área ${areaIndex + 1}`;
    const areaIcon = area?.icon || "mdi:home-outline";
    const areaColor = area?.icon_color || cfg?.design?.accent_color || "#ffd66b";

    const rows = devices.map((device, deviceIndex) => {
      const deviceId = String(device?.id || "");
      const label = device?.name || device?.entity || `Dispositivo ${deviceIndex + 1}`;
      const entity = String(device?.entity || "");
      const icon = device?.icon_on || device?.icon_off || "mdi:lightbulb-outline";
      const color = device?.color_on || cfg?.design?.accent_color || "#ffd66b";
      const attrs = [
        `data-area-id="${escapeValue(panel, areaId)}"`,
        `data-area-index="${areaIndex}"`,
        `data-device-id="${escapeValue(panel, deviceId)}"`,
        `data-device-index="${deviceIndex}"`,
      ].join(" ");

      return `
        <div class="lighting-order-row lighting-order-device-row">
          <div class="lighting-order-main">
            <span class="lighting-order-icon">${panel._icon(icon, 20, color)}</span>
            <span class="lighting-order-copy">
              <span class="lighting-order-name">${escapeValue(panel, label)}</span>
              <span class="lighting-order-meta">${device?.show === false ? "Oculto" : "Visible"}${entity ? ` · ${escapeValue(panel, entity)}` : " · sin entidad"}</span>
            </span>
          </div>
          <div class="row-actions">
            ${moveButton("move-lighting-device", -1, attrs, deviceIndex === 0, "Subir dispositivo")}
            ${moveButton("move-lighting-device", 1, attrs, deviceIndex === devices.length - 1, "Bajar dispositivo")}
          </div>
        </div>`;
    }).join("");

    return `
      <div class="lighting-order-group">
        <div class="lighting-order-group-head">
          <div class="lighting-order-main">
            <span class="lighting-order-icon">${panel._icon(areaIcon, 20, areaColor)}</span>
            <span class="lighting-order-name">${escapeValue(panel, areaLabel)}</span>
          </div>
          <span class="lighting-order-count">${devices.length}</span>
        </div>
        <div class="lighting-order-list">${rows}</div>
      </div>`;
  }).filter(Boolean).join("");

  return panel._section(
    "Orden de dispositivos",
    `<div class="help">
      Reordena luces e interruptores dentro de su área actual. No cambia la entidad, sus acciones ni su pertenencia al área.
      Los dispositivos agregados en el futuro aparecen automáticamente en estos controles.
    </div>
    <div class="lighting-order-groups">
      ${groups || '<div class="help">No hay dispositivos configurados.</div>'}
    </div>`
  );
}

function renderGlobalActionsEditor(panel, cfg) {
  const actions = globalActionsConfig(cfg);
  return panel._section(
    "Acciones globales",
    `${panel._input("global_actions.show", "Mostrar área de acciones", actions.show, { type: "checkbox" })}
     ${panel._input("global_actions.title", "Título del área", actions.title)}
     ${panel._iconInput("global_actions.icon", "Icono del área", actions.icon)}
     ${panel._input("global_actions.icon_color", "Color icono", actions.icon_color, { type: "color" })}
     ${panel._input("global_actions.show_count", "Mostrar cantidad disponible", actions.show_count !== false, { type: "checkbox" })}
     ${panel._input("global_actions.scope", "Alcance", actions.scope, { type: "select", options: [["all", "Todos los configurados"], ["visible", "Solo dispositivos visibles"]] })}
     <div class="help">
       Los botones actúan sobre entidades <b>light.*</b> y <b>switch.*</b> configuradas en este panel.
       Se eliminan duplicados y se omiten entidades inexistentes, <b>unavailable</b> o <b>unknown</b>.
     </div>
     <div class="lighting-global-editor-group">
       <div class="lighting-global-editor-title">Botón Apagar todo</div>
       <div class="device-editor-grid">
         ${panel._input("global_actions.off_button.show", "Mostrar botón", actions.off_button.show !== false, { type: "checkbox" })}
         ${panel._input("global_actions.off_button.label", "Texto", actions.off_button.label)}
         ${panel._iconInput("global_actions.off_button.icon", "Icono", actions.off_button.icon)}
         ${panel._input("global_actions.off_button.color", "Color", actions.off_button.color, { type: "color" })}
       </div>
     </div>
     <div class="lighting-global-editor-group">
       <div class="lighting-global-editor-title">Botón Encender todo</div>
       <div class="device-editor-grid">
         ${panel._input("global_actions.on_button.show", "Mostrar botón", actions.on_button.show !== false, { type: "checkbox" })}
         ${panel._input("global_actions.on_button.label", "Texto", actions.on_button.label)}
         ${panel._iconInput("global_actions.on_button.icon", "Icono", actions.on_button.icon)}
         ${panel._input("global_actions.on_button.color", "Color", actions.on_button.color, { type: "color" })}
       </div>
     </div>`
  );
}

function findAreaIndex(panel, target) {
  const areas = panel?._editConfig?.areas;
  if (!Array.isArray(areas)) return -1;

  const id = String(target?.dataset?.areaId || "");
  if (id) {
    const found = areas.findIndex((area) => String(area?.id || "") === id);
    if (found >= 0) return found;
  }

  const fallback = Number(target?.dataset?.areaIndex);
  return Number.isInteger(fallback) && fallback >= 0 && fallback < areas.length
    ? fallback
    : -1;
}

function findDeviceIndex(area, target) {
  const devices = area?.devices;
  if (!Array.isArray(devices)) return -1;

  const id = String(target?.dataset?.deviceId || "");
  if (id) {
    const found = devices.findIndex((device) => String(device?.id || "") === id);
    if (found >= 0) return found;
  }

  const fallback = Number(target?.dataset?.deviceIndex);
  return Number.isInteger(fallback) && fallback >= 0 && fallback < devices.length
    ? fallback
    : -1;
}

function moveArea(panel, target) {
  const areas = panel?._editConfig?.areas;
  if (!Array.isArray(areas)) return false;

  const index = findAreaIndex(panel, target);
  if (index < 0) return false;

  const direction = Number(target?.dataset?.direction) < 0 ? -1 : 1;
  const next = index + direction;
  if (next < 0 || next >= areas.length) return false;

  [areas[index], areas[next]] = [areas[next], areas[index]];
  return true;
}

function moveDevice(panel, target) {
  const areas = panel?._editConfig?.areas;
  if (!Array.isArray(areas)) return false;

  const areaIndex = findAreaIndex(panel, target);
  if (areaIndex < 0) return false;
  const area = areas[areaIndex];
  const devices = area?.devices;
  if (!Array.isArray(devices)) return false;

  const index = findDeviceIndex(area, target);
  if (index < 0) return false;

  const direction = Number(target?.dataset?.direction) < 0 ? -1 : 1;
  const next = index + direction;
  if (next < 0 || next >= devices.length) return false;

  [devices[index], devices[next]] = [devices[next], devices[index]];
  return true;
}

function collectGlobalEntities(panel, cfg) {
  const actions = globalActionsConfig(cfg);
  const onlyVisible = actions.scope === "visible";
  const entities = new Set();

  for (const area of Array.isArray(cfg?.areas) ? cfg.areas : []) {
    if (onlyVisible && area?.show === false) continue;
    for (const device of Array.isArray(area?.devices) ? area.devices : []) {
      if (onlyVisible && device?.show === false) continue;
      const entity = String(device?.entity || "").trim();
      if (!/^(light|switch)\./.test(entity)) continue;
      const stateObj = panel?._hass?.states?.[entity];
      if (!stateObj) continue;
      const state = String(stateObj.state || "").toLowerCase();
      if (["unavailable", "unknown", "none"].includes(state)) continue;
      entities.add(entity);
    }
  }

  return [...entities];
}

function globalButton(panel, cfg, button, action, disabled) {
  if (button?.show === false) return "";
  const color = button?.color || cfg?.design?.accent_color || "#ffd66b";
  const label = button?.label || (action === "lighting-global-turn-off" ? "Apagar todo" : "Encender todo");
  const icon = button?.icon || (action === "lighting-global-turn-off" ? "mdi:lightbulb-group-off" : "mdi:lightbulb-group");

  return `<button
    class="smart-global-action-button"
    type="button"
    data-action="${action}"
    style="--global-action-color:${escapeValue(panel, color)}"
    ${disabled ? "disabled" : ""}
    aria-label="${escapeValue(panel, label)}"
  >
    <span class="smart-global-action-icon">${panel._icon(icon, 30, color)}</span>
    <span class="smart-global-action-label">${escapeValue(panel, label)}</span>
  </button>`;
}

function renderGlobalActionsArea(panel, cfg) {
  const actions = globalActionsConfig(cfg);
  if (!actions.show) return "";

  const entities = collectGlobalEntities(panel, cfg);
  const count = entities.length;
  const buttons = [
    globalButton(panel, cfg, actions.off_button, "lighting-global-turn-off", count === 0),
    globalButton(panel, cfg, actions.on_button, "lighting-global-turn-on", count === 0),
  ].filter(Boolean).join("");
  if (!buttons) return "";

  const title = actions.title || "Acciones globales";
  const color = actions.icon_color || cfg?.design?.accent_color || "#ffd66b";
  const icon = actions.icon || "mdi:lightbulb-group";
  const countText = actions.show_count !== false
    ? `<span class="area-count" title="Entidades disponibles">${count}</span>`
    : "";

  return `<section class="area-section smart-global-actions-area">
    <div class="area-heading">
      <div class="area-heading-main">${panel._icon(icon, 24, color)}<span>${escapeValue(panel, title)}</span></div>
      ${countText}
    </div>
    <div class="smart-global-actions-grid">${buttons}</div>
  </section>`;
}

function mountGlobalActionsArea(panel, cfg) {
  const areas = panel?.shadowRoot?.querySelector?.(".areas");
  if (!areas) return;
  areas.querySelector?.(".smart-global-actions-area")?.remove?.();
  const html = renderGlobalActionsArea(panel, cfg);
  if (!html) return;
  const template = document.createElement("template");
  template.innerHTML = html.trim();
  if (template.content.firstElementChild) areas.append(template.content.firstElementChild);
}

async function executeGlobalAction(panel, turnOn) {
  if (panel?._lightingGlobalActionBusy) return;
  const cfg = panel?._config?.();
  const entities = collectGlobalEntities(panel, cfg);
  if (!entities.length) {
    panel?._toast?.("No hay luces o apagadores disponibles para esta acción", "error");
    return;
  }

  panel._lightingGlobalActionBusy = true;
  try {
    await panel._hass.callService(
      "homeassistant",
      turnOn ? "turn_on" : "turn_off",
      { entity_id: entities }
    );
    panel?._toast?.(
      `${turnOn ? "Encendido" : "Apagado"} solicitado para ${entities.length} dispositivo${entities.length === 1 ? "" : "s"}`
    );
  } catch (err) {
    panel?._toast?.(
      `No se pudo ${turnOn ? "encender" : "apagar"} todo: ${err?.message || err}`,
      "error"
    );
  } finally {
    panel._lightingGlobalActionBusy = false;
  }
}

function layoutStyles() {
  return `
    .lighting-order-list{grid-column:1/-1;display:grid;gap:7px;width:100%}
    .lighting-order-groups{grid-column:1/-1;display:grid;gap:10px;width:100%}
    .lighting-order-group{border:1px solid #26323a;border-radius:14px;background:#0d151a;overflow:hidden}
    .lighting-order-group-head{display:flex;align-items:center;justify-content:space-between;gap:9px;padding:10px 11px;border-bottom:1px solid #26323a}
    .lighting-order-group .lighting-order-list{padding:8px}
    .lighting-order-row{display:flex;align-items:center;justify-content:space-between;gap:10px;min-width:0;padding:9px 10px;border:1px solid #26323a;border-radius:12px;background:#10181e}
    .lighting-order-device-row{background:#0f171c}
    .lighting-order-main{display:flex;align-items:center;gap:9px;min-width:0}
    .lighting-order-icon{width:34px;height:34px;display:grid;place-items:center;border-radius:10px;background:rgba(255,255,255,.035);flex:none}
    .lighting-order-copy{display:flex;flex-direction:column;gap:2px;min-width:0}
    .lighting-order-name{font-size:12px;font-weight:700;color:#e8edf1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .lighting-order-meta{font-size:10px;font-weight:500;color:#71808a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .lighting-order-count{min-width:24px;height:24px;padding:0 7px;border-radius:999px;background:rgba(255,255,255,.055);display:grid;place-items:center;color:#8e9aa4;font-size:10px}
    .lighting-order-button{min-width:34px;font-size:15px;font-weight:750;line-height:1}
    .lighting-order-button[disabled]{opacity:.32;cursor:not-allowed}
    .lighting-global-editor-group{grid-column:1/-1;border:1px solid #26323a;border-radius:14px;background:#0d151a;overflow:hidden}
    .lighting-global-editor-title{padding:10px 11px;border-bottom:1px solid #26323a;color:#dce3e8;font-size:12px;font-weight:700}
    .smart-global-actions-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--global-action-gap,10px)}
    .smart-global-action-button{min-width:0;min-height:104px;border:1px solid color-mix(in srgb,var(--global-action-color) 36%,#26323a);border-radius:18px;padding:14px;background:color-mix(in srgb,var(--global-action-color) 8%,#11181e);color:#f5f7fa;display:flex;flex-direction:column;align-items:flex-start;justify-content:space-between;gap:14px;text-align:left;cursor:pointer;box-shadow:0 10px 30px rgba(0,0,0,.14);transition:transform .12s ease,background .18s ease,border-color .18s ease}
    .smart-global-action-button:hover{background:color-mix(in srgb,var(--global-action-color) 12%,#11181e);border-color:color-mix(in srgb,var(--global-action-color) 52%,#26323a)}
    .smart-global-action-button:active{transform:scale(.985)}
    .smart-global-action-button[disabled]{opacity:.42;cursor:not-allowed;transform:none}
    .smart-global-action-icon{width:48px;height:48px;border-radius:15px;display:grid;place-items:center;background:color-mix(in srgb,var(--global-action-color) 13%,transparent)}
    .smart-global-action-label{font-size:14px;font-weight:700;line-height:1.2;color:#f5f7fa}
    @media (max-width:360px){.smart-global-actions-grid{grid-template-columns:1fr}}
  `;
}

function installLightingLayoutRuntime() {
  const PanelClass = customElements.get("smart-lighting-panel");
  const proto = PanelClass?.prototype;

  if (!proto) {
    console.warn("[Smart Lighting Layout] panel base no disponible; extensión omitida");
    return false;
  }
  if (proto[LAYOUT_MARKER]) return true;

  const originalStyles = proto._styles;
  if (typeof originalStyles === "function") {
    proto._styles = function lightingLayoutStyles(cfg) {
      return `${originalStyles.call(this, cfg)}\n${layoutStyles()}`;
    };
  }

  const originalAreasEditor = proto._editorAreas;
  if (typeof originalAreasEditor === "function") {
    proto._editorAreas = function lightingLayoutAreasEditor(cfg) {
      try {
        return `${renderAreaOrderEditor(this, cfg)}${renderDeviceOrderEditor(this, cfg)}${renderGlobalActionsEditor(this, cfg)}${originalAreasEditor.call(this, cfg)}`;
      } catch (err) {
        console.warn("[Smart Lighting Layout] no se pudo renderizar la extensión del editor", err);
        return originalAreasEditor.call(this, cfg);
      }
    };
  }

  const originalOnClick = proto._onClick;
  if (typeof originalOnClick === "function") {
    proto._onClick = async function lightingLayoutOnClick(ev) {
      const target = ev?.target?.closest?.("[data-action]");
      const action = target?.dataset?.action;

      if (action === "move-lighting-area") {
        if (moveArea(this, target)) {
          this._lastSignature = "";
          this._queueRender?.(true);
        }
        return;
      }

      if (action === "move-lighting-device") {
        if (moveDevice(this, target)) {
          this._lastSignature = "";
          this._queueRender?.(true);
        }
        return;
      }

      if (action === "lighting-global-turn-off") {
        await executeGlobalAction(this, false);
        return;
      }

      if (action === "lighting-global-turn-on") {
        await executeGlobalAction(this, true);
        return;
      }

      return originalOnClick.call(this, ev);
    };
  }

  const originalRender = proto._render;
  if (typeof originalRender === "function") {
    proto._render = function lightingLayoutRender(...args) {
      const result = originalRender.apply(this, args);
      try {
        if (this._hass && this._panel && this._loaded && this.shadowRoot) {
          mountGlobalActionsArea(this, this._config());
        }
        const version = this.shadowRoot?.querySelector?.(".version");
        if (version) version.textContent = `v${SMART_LIGHTING_EFFECTIVE_VERSION}`;
      } catch (err) {
        console.warn("[Smart Lighting Layout] no se pudo montar Acciones globales", err);
      }
      return result;
    };
  }

  Object.defineProperty(proto, LAYOUT_MARKER, {
    value: true,
    configurable: false,
    enumerable: false,
  });

  console.info(
    `[Smart Lighting Layout] runtime v${SMART_LIGHTING_LAYOUT_RUNTIME_VERSION} · ordering v${SMART_LIGHTING_ORDERING_RUNTIME_VERSION} · global actions v${SMART_LIGHTING_GLOBAL_ACTIONS_RUNTIME_VERSION} · módulo v${SMART_LIGHTING_EFFECTIVE_VERSION} activo`
  );
  return true;
}

if (!installLightingLayoutRuntime() && typeof customElements?.whenDefined === "function") {
  customElements.whenDefined("smart-lighting-panel").then(() => {
    installLightingLayoutRuntime();
  });
}
