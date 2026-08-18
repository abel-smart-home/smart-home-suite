/**
 * Smart Home Suite · Smart Energy Advanced ordering runtime v1.0.0
 *
 * Base frontend preserved:
 *   Smart Energy Advanced Panel V1.3.1
 *
 * Adds only:
 * - reorderable sections;
 * - reorderable widgets inside their own section;
 * - live preview through the existing edit working copy;
 * - effective module version label 1.4.0.
 *
 * Storage remains smart_energy_advanced_panel.config. No migration is required:
 * section and widget ordering is persisted by the existing arrays themselves.
 */

import "./smart-energy-advanced-panel.js?v=131-suite120-base";

const SMART_ENERGY_ORDERING_RUNTIME_VERSION = "1.0.0";
const SMART_ENERGY_EFFECTIVE_VERSION = "1.4.0";
const ORDERING_MARKER = Symbol.for(
  "smart-home-suite-smart-energy-ordering-v1.0.0"
);

function escapeValue(panel, value) {
  return panel?._escape ? panel._escape(value) : String(value ?? "");
}

function rowButton(action, direction, attrs, disabled, label) {
  return `<button
    class="tiny-btn"
    type="button"
    data-action="${action}"
    data-direction="${direction}"
    ${attrs}
    ${disabled ? "disabled" : ""}
    aria-label="${label}"
    title="${label}"
  >${direction < 0 ? "↑" : "↓"}</button>`;
}

function renderSectionOrderEditor(panel, cfg) {
  const sections = Array.isArray(cfg?.sections) ? cfg.sections : [];
  const rows = sections.map((section, index) => {
    const label = section?.title || section?.id || `Sección ${index + 1}`;
    const id = String(section?.id || "");
    const icon = section?.icon || "mdi:view-grid-outline";
    const color = section?.color || cfg?.design?.accent_color || "#35ddd5";
    const attrs = `data-section-id="${escapeValue(panel, id)}" data-section-index="${index}"`;

    return `
      <div class="item-card">
        <div class="item-head">
          <div style="display:flex;align-items:center;gap:8px;min-width:0">
            <span>${panel._icon(icon, 20, color)}</span>
            <span style="min-width:0">
              <span class="item-name">${escapeValue(panel, label)}</span>
              <span style="display:block;margin-top:2px;color:#71808a;font-size:10px;font-weight:500">
                ${section?.show === false ? "Oculta" : "Visible"} · ${escapeValue(panel, id || "sin-id")}
              </span>
            </span>
          </div>
          <div class="row-actions">
            ${rowButton("move-energy-section", -1, attrs, index === 0, "Subir sección")}
            ${rowButton("move-energy-section", 1, attrs, index === sections.length - 1, "Bajar sección")}
          </div>
        </div>
      </div>`;
  }).join("");

  return panel._editSection(
    "Orden de secciones",
    `<div class="help" style="margin-bottom:10px">
      Cambia la posición completa de las secciones. El gráfico nativo de fuentes de energía
      conserva su comportamiento actual y se mueve junto con <b>Tiempo real</b>.
      Guardar persiste el nuevo orden; Cancelar lo descarta.
    </div>
    <div style="display:grid;gap:8px">
      ${rows || '<div class="help">No hay secciones configuradas.</div>'}
    </div>`
  );
}

function widgetGroups(cfg) {
  const widgets = Array.isArray(cfg?.widgets) ? cfg.widgets : [];
  const sections = Array.isArray(cfg?.sections) ? cfg.sections : [];
  const known = new Set(sections.map((section) => String(section?.id || "")));
  const groups = sections.map((section) => ({
    id: String(section?.id || ""),
    label: section?.title || section?.id || "Sección",
    icon: section?.icon || "mdi:view-grid-outline",
    color: section?.color || cfg?.design?.accent_color || "#35ddd5",
  }));

  for (const widget of widgets) {
    const id = String(widget?.section || "");
    if (known.has(id)) continue;
    known.add(id);
    groups.push({
      id,
      label: id ? `Sección ${id}` : "Sin sección",
      icon: "mdi:alert-circle-outline",
      color: cfg?.design?.accent_color || "#35ddd5",
    });
  }
  return groups;
}

function renderWidgetOrderEditor(panel, cfg) {
  const widgets = Array.isArray(cfg?.widgets) ? cfg.widgets : [];
  const groups = widgetGroups(cfg);

  const blocks = groups.map((group) => {
    const entries = widgets
      .map((widget, index) => ({ widget, index }))
      .filter(({ widget }) => String(widget?.section || "") === group.id);

    if (!entries.length) return "";

    const rows = entries.map(({ widget, index }, localIndex) => {
      const label = widget?.label || widget?.id || `Widget ${index + 1}`;
      const id = String(widget?.id || "");
      const icon = widget?.icon || "mdi:gauge";
      const color = widget?.color || cfg?.design?.accent_color || "#35ddd5";
      const attrs = `data-widget-id="${escapeValue(panel, id)}" data-widget-index="${index}"`;

      return `
        <div class="item-card">
          <div class="item-head">
            <div style="display:flex;align-items:center;gap:8px;min-width:0">
              <span>${panel._icon(icon, 20, color)}</span>
              <span style="min-width:0">
                <span class="item-name">${escapeValue(panel, label)}</span>
                <span style="display:block;margin-top:2px;color:#71808a;font-size:10px;font-weight:500">
                  ${widget?.show === false ? "Oculto" : "Visible"} · ${escapeValue(panel, id || `índice ${index}`)}
                </span>
              </span>
            </div>
            <div class="row-actions">
              ${rowButton("move-energy-widget", -1, attrs, localIndex === 0, "Subir dato")}
              ${rowButton("move-energy-widget", 1, attrs, localIndex === entries.length - 1, "Bajar dato")}
            </div>
          </div>
        </div>`;
    }).join("");

    return `
      <div class="item-card">
        <div class="item-head">
          <div style="display:flex;align-items:center;gap:8px;min-width:0">
            <span>${panel._icon(group.icon, 20, group.color)}</span>
            <span class="item-name">${escapeValue(panel, group.label)}</span>
          </div>
          <span style="color:#71808a;font-size:10px">${entries.length} dato${entries.length === 1 ? "" : "s"}</span>
        </div>
        <div style="display:grid;gap:7px">${rows}</div>
      </div>`;
  }).filter(Boolean).join("");

  return panel._editSection(
    "Orden de widgets eléctricos",
    `<div class="help" style="margin-bottom:10px">
      Reordena cada dato dentro de su propia sección. Esto incluye los widgets actuales
      y cualquier widget nuevo que se agregue en el futuro. Cambiar la sección de un widget
      sigue funcionando como antes; después puedes ajustar su posición aquí.
    </div>
    <div style="display:grid;gap:10px">
      ${blocks || '<div class="help">No hay widgets configurados.</div>'}
    </div>`
  );
}

function findSectionIndex(panel, target) {
  const sections = panel?._editConfig?.sections;
  if (!Array.isArray(sections)) return -1;

  const id = String(target?.dataset?.sectionId || "");
  if (id) {
    const found = sections.findIndex((section) => String(section?.id || "") === id);
    if (found >= 0) return found;
  }

  const fallback = Number(target?.dataset?.sectionIndex);
  return Number.isInteger(fallback) && fallback >= 0 && fallback < sections.length
    ? fallback
    : -1;
}

function findWidgetIndex(panel, target) {
  const widgets = panel?._editConfig?.widgets;
  if (!Array.isArray(widgets)) return -1;

  const id = String(target?.dataset?.widgetId || "");
  if (id) {
    const found = widgets.findIndex((widget) => String(widget?.id || "") === id);
    if (found >= 0) return found;
  }

  const fallback = Number(target?.dataset?.widgetIndex);
  return Number.isInteger(fallback) && fallback >= 0 && fallback < widgets.length
    ? fallback
    : -1;
}

function moveSection(panel, target) {
  const sections = panel?._editConfig?.sections;
  if (!Array.isArray(sections)) return false;

  const index = findSectionIndex(panel, target);
  if (index < 0) return false;

  const direction = Number(target?.dataset?.direction) < 0 ? -1 : 1;
  const next = index + direction;
  if (next < 0 || next >= sections.length) return false;

  [sections[index], sections[next]] = [sections[next], sections[index]];
  return true;
}

function moveWidgetInsideSection(panel, target) {
  const widgets = panel?._editConfig?.widgets;
  if (!Array.isArray(widgets)) return false;

  const index = findWidgetIndex(panel, target);
  if (index < 0) return false;

  const sectionId = String(widgets[index]?.section || "");
  const peers = widgets
    .map((widget, globalIndex) => ({
      globalIndex,
      sectionId: String(widget?.section || ""),
    }))
    .filter((entry) => entry.sectionId === sectionId)
    .map((entry) => entry.globalIndex);

  const localIndex = peers.indexOf(index);
  if (localIndex < 0) return false;

  const direction = Number(target?.dataset?.direction) < 0 ? -1 : 1;
  const nextLocal = localIndex + direction;
  if (nextLocal < 0 || nextLocal >= peers.length) return false;

  const other = peers[nextLocal];
  [widgets[index], widgets[other]] = [widgets[other], widgets[index]];
  return true;
}

function installOrderingRuntime() {
  const PanelClass = customElements.get("smart-energy-advanced-panel");
  const proto = PanelClass?.prototype;

  if (!proto) {
    console.warn("[Smart Energy Ordering] panel base no disponible; extensión omitida");
    return false;
  }
  if (proto[ORDERING_MARKER]) return true;

  const originalGeneral = proto._editorGeneral;
  if (typeof originalGeneral === "function") {
    proto._editorGeneral = function energyOrderingGeneral(cfg) {
      try {
        return `${renderSectionOrderEditor(this, cfg)}${originalGeneral.call(this, cfg)}`;
      } catch (err) {
        console.warn("[Smart Energy Ordering] no se pudo renderizar orden de secciones", err);
        return originalGeneral.call(this, cfg);
      }
    };
  }

  const originalWidgets = proto._editorWidgets;
  if (typeof originalWidgets === "function") {
    proto._editorWidgets = function energyOrderingWidgets(cfg) {
      try {
        return `${renderWidgetOrderEditor(this, cfg)}${originalWidgets.call(this, cfg)}`;
      } catch (err) {
        console.warn("[Smart Energy Ordering] no se pudo renderizar orden de widgets", err);
        return originalWidgets.call(this, cfg);
      }
    };
  }

  const originalOnClick = proto._onClick;
  if (typeof originalOnClick === "function") {
    proto._onClick = async function energyOrderingOnClick(ev) {
      const target = ev?.target?.closest?.("[data-action]");
      const action = target?.dataset?.action;

      if (action === "move-energy-section") {
        if (moveSection(this, target)) {
          this._lastSignature = "";
          this._queueRender?.(true);
        }
        return;
      }

      if (action === "move-energy-widget") {
        if (moveWidgetInsideSection(this, target)) {
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
    proto._render = function energyOrderingRender(...args) {
      const result = originalRender.apply(this, args);
      try {
        const version = this.shadowRoot?.querySelector?.(".version");
        if (version) version.textContent = `v${SMART_ENERGY_EFFECTIVE_VERSION}`;
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
    `[Smart Energy Ordering] runtime v${SMART_ENERGY_ORDERING_RUNTIME_VERSION} · módulo v${SMART_ENERGY_EFFECTIVE_VERSION} activo`
  );
  return true;
}

if (!installOrderingRuntime() && typeof customElements?.whenDefined === "function") {
  customElements.whenDefined("smart-energy-advanced-panel").then(() => {
    installOrderingRuntime();
  });
}
