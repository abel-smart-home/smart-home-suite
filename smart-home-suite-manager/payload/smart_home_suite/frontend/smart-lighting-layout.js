/**
 * Smart Home Suite · Smart Lighting ordering runtime v1.0.0
 *
 * Base frontend preserved:
 *   Smart Lighting Panel V1.0.3
 *
 * Adds only:
 * - reorderable areas;
 * - reorderable devices inside their own area;
 * - live preview through the existing editor working copy;
 * - effective module version label 1.1.0.
 *
 * Storage remains smart_lighting_panel.config (storage version 1).
 * No migration is required: area/device ordering is persisted by the
 * existing areas[] and area.devices[] arrays themselves.
 */

import "./smart-lighting-panel.js?v=103-suite140-base";

const SMART_LIGHTING_ORDERING_RUNTIME_VERSION = "1.0.0";
const SMART_LIGHTING_EFFECTIVE_VERSION = "1.1.0";
const ORDERING_MARKER = Symbol.for(
  "smart-home-suite-smart-lighting-ordering-v1.0.0"
);

function escapeValue(panel, value) {
  return panel?._escape ? panel._escape(value) : String(value ?? "");
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

function orderingStyles() {
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
  `;
}

function installOrderingRuntime() {
  const PanelClass = customElements.get("smart-lighting-panel");
  const proto = PanelClass?.prototype;

  if (!proto) {
    console.warn("[Smart Lighting Ordering] panel base no disponible; extensión omitida");
    return false;
  }
  if (proto[ORDERING_MARKER]) return true;

  const originalStyles = proto._styles;
  if (typeof originalStyles === "function") {
    proto._styles = function lightingOrderingStyles(cfg) {
      return `${originalStyles.call(this, cfg)}\n${orderingStyles()}`;
    };
  }

  const originalAreasEditor = proto._editorAreas;
  if (typeof originalAreasEditor === "function") {
    proto._editorAreas = function lightingOrderingAreasEditor(cfg) {
      try {
        return `${renderAreaOrderEditor(this, cfg)}${renderDeviceOrderEditor(this, cfg)}${originalAreasEditor.call(this, cfg)}`;
      } catch (err) {
        console.warn("[Smart Lighting Ordering] no se pudo renderizar el editor de orden", err);
        return originalAreasEditor.call(this, cfg);
      }
    };
  }

  const originalOnClick = proto._onClick;
  if (typeof originalOnClick === "function") {
    proto._onClick = async function lightingOrderingOnClick(ev) {
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

      return originalOnClick.call(this, ev);
    };
  }

  const originalRender = proto._render;
  if (typeof originalRender === "function") {
    proto._render = function lightingOrderingRender(...args) {
      const result = originalRender.apply(this, args);
      try {
        const version = this.shadowRoot?.querySelector?.(".version");
        if (version) version.textContent = `v${SMART_LIGHTING_EFFECTIVE_VERSION}`;
      } catch (_) {
        // Version label is cosmetic; fail open.
      }
      return result;
    };
  }

  Object.defineProperty(proto, ORDERING_MARKER, {
    value: true,
    configurable: false,
    enumerable: false,
  });

  console.info(
    `[Smart Lighting Ordering] runtime v${SMART_LIGHTING_ORDERING_RUNTIME_VERSION} · módulo v${SMART_LIGHTING_EFFECTIVE_VERSION} activo`
  );
  return true;
}

if (!installOrderingRuntime() && typeof customElements?.whenDefined === "function") {
  customElements.whenDefined("smart-lighting-panel").then(() => {
    installOrderingRuntime();
  });
}
