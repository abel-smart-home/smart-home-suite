/**
 * Smart Home Suite · Smart Home Panel V3.1.0
 *
 * Real V3 custom element. It inherits the validated Smart Home V2 functional
 * base through smart-home-panel-runtime.js, but V3 sections/responsive/editor
 * behavior belongs to this class instead of patching the global V2 prototype.
 *
 * Compatibility:
 * - same smart_home_panel backend/WebSocket/.storage contract;
 * - same built-in widgets, gauge, navigation, actions and entity selectors;
 * - same extra value/bar/history widgets from Card Layout V1.0.0;
 * - reads layout_v3 schema 1 written by Suite 1.13.0;
 * - no automatic storage write/migration;
 * - Save synchronizes card_layout.order for rollback compatibility.
 */

import "./smart-home-panel-runtime.js?v=110-guard100-cards100-module140-suite1123";

const SMART_HOME_PANEL_V3_VERSION = "3.1.0";
const SMART_HOME_MODULE_VERSION = "1.6.0";
const SMART_HOME_LAYOUT_V3_SCHEMA_VERSION = 1;
const SMART_HOME_V3_DEFAULT_BREAKPOINT = 700;
const SMART_HOME_V3_DEFAULT_MAX_WIDTH = 1100;
const SMART_HOME_V3_WIDE_COLUMNS = 4;
const SMART_HOME_V3_LEGACY_AUTO_WIDTHS = new Set([520]);
const SMART_HOME_NATIVE_PREFERENCES_EVENT = "smart-home-native-preferences";
const MOBILE_MENU_VALUES = new Set(["admins", "all", "hidden"]);
const BUILTIN_REFS = Object.freeze(["monthly_cost", "season", "tariff", "power"]);
const BUILTIN_LABELS = Object.freeze({
  monthly_cost: "Costo mensual",
  season: "Temporada",
  tariff: "Rango de tarifa",
  power: "Consumo actual / Tacómetro",
});
const PROTECTED_SECTION_IDS = new Set(["summary", "energy", "extras"]);
const SIZE_VALUES = new Set(["auto", "small", "medium", "large", "full"]);

const LegacyPanel = customElements.get("smart-home-panel");
if (!LegacyPanel) {
  throw new Error("Smart Home Panel V3 requires the validated smart-home-panel runtime");
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function isObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function clampNumber(value, fallback, min, max) {
  const n = Number(value);
  return Math.min(max, Math.max(min, Number.isFinite(n) ? n : fallback));
}

function normalizeMobileMenuAccess(value, fallback = "admins") {
  const normalized = String(value || "").trim().toLowerCase();
  if (MOBILE_MENU_VALUES.has(normalized)) return normalized;
  const fb = String(fallback || "admins").trim().toLowerCase();
  return MOBILE_MENU_VALUES.has(fb) ? fb : "admins";
}

function extraIdFromRef(ref) {
  const value = String(ref || "");
  return value.startsWith("extra:") ? value.slice(6) : "";
}

function extraRef(id) {
  return `extra:${id}`;
}

function newId(prefix) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function extraCardDefaults(id = newId("extra")) {
  return {
    id,
    show: true,
    type: "value",
    entity: "",
    label: "Nueva tarjeta",
    icon: "mdi:gauge",
    prefix: "",
    unit: "auto",
    decimals: 1,
    multiplier: 1,
    offset: 0,
    state_map: {},
    tap_action: { action: "more-info", navigation_path: "", url_path: "" },
    hold_action: { action: "none", navigation_path: "", url_path: "" },
    style: {
      height: 110, width: "100%", background: "", border_color: "",
      border_width: "", border_radius: "", padding: "", align: "left",
      icon_color: "#35ddd5", icon_size: 28,
      icon_background: "rgba(53,221,213,.10)", icon_box_size: 50,
      label_color: "", label_size: 13, label_weight: 500,
      value_color: "", value_size: 29, value_weight: 620,
      unit_color: "", unit_size: 13, unit_weight: 500,
    },
    bar: {
      min: 0, max: 100, height: 12, track_color: "#1f2b33",
      fill_color: "#35ddd5", show_scale: true,
    },
    graph: {
      hours: 24, max_points: 60, height: 120, auto_scale: true,
      min: 0, max: 100, line_color: "#35ddd5", fill_color: "#35ddd5",
      fill_opacity: 0.14, line_width: 3, show_min_max: true,
    },
  };
}

function sectionDefaults(id, title, icon, widgets = []) {
  return {
    id,
    show: true,
    show_header: true,
    show_empty: false,
    title,
    subtitle: "",
    icon,
    icon_color: "#35ddd5",
    title_color: "",
    subtitle_color: "",
    title_size: 17,
    subtitle_size: 11,
    icon_size: 22,
    align: "left",
    section_surface: false,
    header_surface: false,
    background: "#0f171c",
    border_color: "#26323a",
    border_width: 1,
    radius: 16,
    padding: 10,
    widgets: [...widgets],
  };
}

function validWidgetRefs(cfg) {
  const refs = [...BUILTIN_REFS];
  for (const card of Array.isArray(cfg?.extra_cards) ? cfg.extra_cards : []) {
    const id = String(card?.id || "").trim();
    if (id) refs.push(extraRef(id));
  }
  return refs;
}

function defaultLayout(cfg) {
  const allRefs = validWidgetRefs(cfg);
  const requested = Array.isArray(cfg?.card_layout?.order)
    ? cfg.card_layout.order.map(String)
    : [];
  const ordered = [];
  const seen = new Set();

  for (const ref of [...requested, ...allRefs]) {
    if (!allRefs.includes(ref) || seen.has(ref)) continue;
    seen.add(ref);
    ordered.push(ref);
  }

  return {
    schema_version: SMART_HOME_LAYOUT_V3_SCHEMA_VERSION,
    enabled: true,
    adaptive_width: true,
    breakpoint: SMART_HOME_V3_DEFAULT_BREAKPOINT,
    wide_max_width: SMART_HOME_V3_DEFAULT_MAX_WIDTH,
    grid_gap: 12,
    section_gap: 18,
    sections: [
      sectionDefaults("summary", "Resumen", "mdi:home-outline",
        ordered.filter((ref) => ["monthly_cost", "season", "tariff"].includes(ref))),
      sectionDefaults("energy", "Consumo", "mdi:flash",
        ordered.filter((ref) => ref === "power")),
      sectionDefaults("extras", "Otros", "mdi:view-grid-plus-outline",
        ordered.filter((ref) => ref.startsWith("extra:"))),
    ],
    widget_layout: {},
  };
}

function genericSection(raw, index) {
  const id = String(raw?.id || "").trim() || newId("section");
  const base = sectionDefaults(id, `Sección ${index + 1}`, "mdi:view-grid-outline", []);
  return {
    ...base,
    ...(isObject(raw) ? raw : {}),
    id,
    show: raw?.show !== false,
    show_header: raw?.show_header !== false,
    show_empty: raw?.show_empty === true,
    section_surface: raw?.section_surface === true,
    header_surface: raw?.header_surface === true,
    widgets: Array.isArray(raw?.widgets) ? raw.widgets.map(String) : [],
  };
}

function preferredSectionId(ref) {
  if (ref === "power") return "energy";
  if (String(ref).startsWith("extra:")) return "extras";
  return "summary";
}

function normalizeV3Config(source) {
  const cfg = isObject(source) ? { ...source } : {};
  const validRefs = validWidgetRefs(cfg);
  const validSet = new Set(validRefs);
  const defaults = defaultLayout(cfg);
  const raw = isObject(cfg.layout_v3) ? clone(cfg.layout_v3) : defaults;

  const layout = {
    ...defaults,
    ...raw,
    schema_version: SMART_HOME_LAYOUT_V3_SCHEMA_VERSION,
    enabled: raw.enabled !== false,
    adaptive_width: raw.adaptive_width !== false,
    breakpoint: Math.round(clampNumber(raw.breakpoint, 700, 600, 900)),
    wide_max_width: Math.round(clampNumber(raw.wide_max_width, 1100, 760, 1400)),
    grid_gap: Math.round(clampNumber(raw.grid_gap, 12, 4, 30)),
    section_gap: Math.round(clampNumber(raw.section_gap, 18, 8, 44)),
    sections: [],
    widget_layout: {},
  };

  const rawSections = Array.isArray(raw.sections) && raw.sections.length
    ? raw.sections : defaults.sections;
  const sectionIds = new Set();
  const assigned = new Set();

  for (let index = 0; index < rawSections.length; index += 1) {
    const section = genericSection(rawSections[index], index);
    while (sectionIds.has(section.id)) section.id = newId("section");
    sectionIds.add(section.id);
    section.widgets = section.widgets.filter((ref) => {
      if (!validSet.has(ref) || assigned.has(ref)) return false;
      assigned.add(ref);
      return true;
    });
    layout.sections.push(section);
  }

  if (!layout.sections.length) {
    layout.sections = defaults.sections.map((section, index) => genericSection(section, index));
  }

  for (const ref of validRefs) {
    if (layout.sections.some((section) => section.widgets.includes(ref))) continue;
    const target = layout.sections.find((section) => section.id === preferredSectionId(ref))
      || layout.sections[0];
    target?.widgets.push(ref);
  }

  const rawWidgetLayout = isObject(raw.widget_layout) ? raw.widget_layout : {};
  for (const ref of validRefs) {
    const item = isObject(rawWidgetLayout[ref]) ? rawWidgetLayout[ref] : {};
    const size = SIZE_VALUES.has(String(item.size || "")) ? String(item.size) : "auto";
    layout.widget_layout[ref] = { ...item, size };
  }

  const flatOrder = layout.sections.flatMap((section) => section.widgets)
    .filter((ref) => validSet.has(ref));
  cfg.layout_v3 = layout;
  cfg.card_layout = {
    ...(isObject(cfg.card_layout) ? cfg.card_layout : {}),
    order: flatOrder,
  };
  return cfg;
}

function updateEditorWorkingCopy(panel) {
  if (!panel?._editConfig) return null;
  const normalized = normalizeV3Config(panel._editConfig);
  panel._editConfig.layout_v3 = clone(normalized.layout_v3);
  panel._editConfig.card_layout = {
    ...(isObject(panel._editConfig.card_layout) ? panel._editConfig.card_layout : {}),
    order: [...normalized.card_layout.order],
  };
  return normalized;
}

function findExtra(cfg, ref) {
  const id = extraIdFromRef(ref);
  if (!id) return null;
  return (cfg?.extra_cards || []).find((card) => String(card?.id || "") === id) || null;
}

function widgetInfo(cfg, ref) {
  if (String(ref).startsWith("extra:")) {
    const card = findExtra(cfg, ref);
    return {
      ref, widget: card, label: card?.label || "Widget adicional",
      icon: card?.icon || "mdi:gauge",
      type: card?.type === "graph" ? "Gráfica" : card?.type === "bar" ? "Barra" : "Valor",
    };
  }
  const widget = cfg?.[ref] || {};
  return {
    ref, widget, label: widget.label || BUILTIN_LABELS[ref] || ref,
    icon: widget.icon || (ref === "power" ? "mdi:flash" : "mdi:card-outline"),
    type: ref === "power" ? "Tacómetro" : "Tarjeta base",
  };
}

function widgetShowPath(cfg, ref) {
  if (!String(ref).startsWith("extra:")) return `${ref}.show`;
  const id = extraIdFromRef(ref);
  const index = (cfg?.extra_cards || []).findIndex(
    (card) => String(card?.id || "") === id);
  return index >= 0 ? `extra_cards.${index}.show` : "";
}

function semanticSize(cfg, ref) {
  const configured = String(cfg?.layout_v3?.widget_layout?.[ref]?.size || "auto");
  if (configured !== "auto" && SIZE_VALUES.has(configured)) return configured;
  if (ref === "power") return "full";
  if (ref === "monthly_cost") return "medium";
  if (ref === "season" || ref === "tariff") return "small";
  const extra = findExtra(cfg, ref);
  if (extra?.type === "graph") return "full";
  if (extra?.type === "bar") return "medium";
  return "medium";
}

function v3Styles(cfg) {
  const layout = cfg?.layout_v3 || defaultLayout(cfg || {});
  const d = cfg?.design || {};
  const configuredWidth = Number(d.panel_max_width);
  const legacy = SMART_HOME_V3_LEGACY_AUTO_WIDTHS.has(
    Number.isFinite(configuredWidth) ? Math.round(configuredWidth) : 520,
  );
  const breakpoint = Math.round(clampNumber(layout.breakpoint, 700, 600, 900));
  const maxWidth = Math.round(clampNumber(layout.wide_max_width, 1100, 760, 1400));
  const gridGap = Math.round(clampNumber(layout.grid_gap, 12, 4, 30));
  const sectionGap = Math.round(clampNumber(layout.section_gap, 18, 8, 44));
  const widthRule = layout.enabled && layout.adaptive_width && legacy
    ? `@media (min-width:${breakpoint}px){.page.smart-v3-active{max-width:min(${maxWidth}px,100%)}}`
    : "";

  return `
    ${widthRule}
    .page.smart-v3-active{
      container-type:inline-size;
      container-name:smart-home-v3-page;
      --smart-v3-grid-gap:${gridGap}px;
      --smart-v3-section-gap:${sectionGap}px;
    }
    .page.smart-v3-active .stack{
      display:grid;
      grid-template-columns:minmax(0,1fr);
      gap:var(--smart-v3-section-gap);
      align-items:start;
    }
    .smart-v3-section{
      min-width:0;
      display:grid;
      gap:var(--smart-v3-grid-gap);
      padding:0;
      border:var(--smart-v3-section-border-width) solid transparent;
      border-radius:var(--smart-v3-section-radius);
      background:transparent;
    }
    .smart-v3-section.surface{
      padding:var(--smart-v3-section-padding);
      border-color:var(--smart-v3-section-border);
      background:var(--smart-v3-section-bg);
    }
    .smart-v3-section-header{
      display:flex;
      align-items:center;
      gap:10px;
      min-width:0;
      padding:0;
      border:var(--smart-v3-section-border-width) solid transparent;
      border-radius:var(--smart-v3-section-radius);
      background:transparent;
    }
    .smart-v3-section-header.header-surface{
      padding:var(--smart-v3-section-padding);
      border-color:var(--smart-v3-section-border);
      background:var(--smart-v3-section-bg);
    }
    .smart-v3-section-header.align-left{justify-content:flex-start;text-align:left}
    .smart-v3-section-header.align-center{justify-content:center;text-align:center}
    .smart-v3-section-header.align-right{justify-content:flex-end;text-align:right}
    .smart-v3-section-icon{
      width:34px;height:34px;display:grid;place-items:center;flex:0 0 auto;
    }
    .smart-v3-section-text{min-width:0}
    .smart-v3-section-title{
      font-size:var(--smart-v3-section-title-size);
      font-weight:720;line-height:1.1;color:var(--smart-v3-section-title-color);
    }
    .smart-v3-section-subtitle{
      margin-top:4px;font-size:var(--smart-v3-section-subtitle-size);
      font-weight:500;line-height:1.25;color:var(--smart-v3-section-subtitle-color);
    }
    .smart-v3-section-grid{
      min-width:0;display:grid;grid-template-columns:minmax(0,1fr);
      gap:var(--smart-v3-grid-gap);align-items:start;
    }
    .smart-v3-section-grid > [data-smart-card-ref]{min-width:0;grid-column:1/-1}
    .smart-v3-empty{
      min-width:0;padding:10px 12px;border:1px dashed ${d.card_border_color || "#26323a"};
      border-radius:13px;color:${d.label_color || "#9aa6af"};font-size:11px;line-height:1.4;
    }
    .smart-v3-hidden{display:none !important}

    @supports (container-type:inline-size){
      @container smart-home-v3-page (min-width:${breakpoint}px){
        .smart-v3-section-grid{
          grid-template-columns:repeat(${SMART_HOME_V3_WIDE_COLUMNS},minmax(0,1fr));
        }
        .smart-v3-section-grid > [data-smart-card-ref][data-smart-v3-size="small"]{grid-column:span 1}
        .smart-v3-section-grid > [data-smart-card-ref][data-smart-v3-size="medium"]{grid-column:span 2}
        .smart-v3-section-grid > [data-smart-card-ref][data-smart-v3-size="large"]{grid-column:span 3}
        .smart-v3-section-grid > [data-smart-card-ref][data-smart-v3-size="full"]{grid-column:1/-1}
      }
    }
    @supports not (container-type:inline-size){
      @media (min-width:${breakpoint}px){
        .smart-v3-section-grid{
          grid-template-columns:repeat(${SMART_HOME_V3_WIDE_COLUMNS},minmax(0,1fr));
        }
        .smart-v3-section-grid > [data-smart-card-ref][data-smart-v3-size="small"]{grid-column:span 1}
        .smart-v3-section-grid > [data-smart-card-ref][data-smart-v3-size="medium"]{grid-column:span 2}
        .smart-v3-section-grid > [data-smart-card-ref][data-smart-v3-size="large"]{grid-column:span 3}
        .smart-v3-section-grid > [data-smart-card-ref][data-smart-v3-size="full"]{grid-column:1/-1}
      }
    }

    .smart-v3-editor-intro{
      padding:10px 12px;border:1px solid rgba(53,221,213,.20);
      border-radius:13px;background:rgba(53,221,213,.055);
      color:#91a1ab;font-size:11px;line-height:1.5;
    }
    .smart-v3-section-editor{gap:12px}
    .smart-v3-section-editor-head{
      display:flex;align-items:center;justify-content:space-between;gap:8px;
    }
    .smart-v3-section-editor-title{
      display:flex;align-items:center;gap:9px;min-width:0;font-size:13px;font-weight:700;
    }
    .smart-v3-section-editor-actions{
      display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end;
    }
    .smart-v3-widget-list{display:grid;gap:8px}
    .smart-v3-widget-row{
      border:1px solid #26323a;border-radius:12px;background:#0a1116;
      padding:9px;display:grid;gap:8px;
    }
    .smart-v3-widget-main{
      display:grid;grid-template-columns:34px minmax(0,1fr) auto;gap:9px;align-items:center;
    }
    .smart-v3-widget-icon{
      width:34px;height:34px;border-radius:10px;background:rgba(53,221,213,.07);
      display:grid;place-items:center;
    }
    .smart-v3-widget-label{
      font-size:12px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
    }
    .smart-v3-widget-type{
      margin-top:2px;color:#71808a;font-size:9px;text-transform:uppercase;letter-spacing:.06em;
    }
    .smart-v3-widget-controls{
      display:grid;grid-template-columns:minmax(105px,.8fr) minmax(130px,1fr) auto;
      gap:7px;align-items:end;
    }
    .smart-v3-mini-field{display:grid;gap:5px;min-width:0}
    .smart-v3-mini-field label{font-size:9px;color:#76848e;font-weight:650}
    .smart-v3-mini-select{
      width:100%;height:34px;border:1px solid #2a3740;border-radius:10px;
      background:#0d151a;color:#e7edf0;padding:0 8px;
    }
    .smart-v3-mini-toggle{
      display:flex;align-items:center;gap:6px;font-size:10px;color:#9da8af;white-space:nowrap;
    }
    .smart-v3-mini-toggle input{width:16px;height:16px}
    .smart-v3-widget-buttons{display:flex;gap:5px;justify-content:flex-end;flex-wrap:wrap}
    .smart-v3-add-row{display:flex;gap:7px;flex-wrap:wrap}

    .smart-v3-icon-picker-backdrop{
      position:fixed;inset:0;z-index:2147483000;background:rgba(0,0,0,.62);
      display:grid;place-items:center;padding:18px;
    }
    .smart-v3-icon-picker{
      width:min(620px,100%);max-height:min(80dvh,720px);overflow:auto;
      border:1px solid #293840;border-radius:18px;background:#0b1116;
      box-shadow:0 20px 70px rgba(0,0,0,.48);padding:14px;display:grid;gap:12px;
    }
    .smart-v3-icon-picker-head{
      display:flex;align-items:center;justify-content:space-between;gap:10px;
    }
    .smart-v3-icon-picker-title{font-size:17px;font-weight:700}
    .smart-v3-icon-picker-native{min-height:70px}
    .smart-v3-icon-picker-manual{
      display:grid;grid-template-columns:minmax(0,1fr) auto;gap:7px;
    }
    @media(max-width:620px){
      .smart-v3-widget-controls{grid-template-columns:1fr}
      .smart-v3-widget-buttons{justify-content:flex-start}
      .smart-v3-section-editor-actions{justify-content:flex-start}
      .smart-v3-section-editor-head{align-items:flex-start;flex-direction:column}
      .smart-v3-icon-picker-backdrop{padding:0;place-items:stretch}
      .smart-v3-icon-picker{width:100%;height:100%;max-height:none;border-radius:0;border:0}
    }
  `;
}

function configureSectionCss(el, section, cfg) {
  el.style.setProperty("--smart-v3-section-bg", section.background || "#0f171c");
  el.style.setProperty("--smart-v3-section-border",
    section.border_color || cfg.design?.card_border_color || "#26323a");
  el.style.setProperty("--smart-v3-section-border-width",
    `${clampNumber(section.border_width, 1, 0, 4)}px`);
  el.style.setProperty("--smart-v3-section-padding",
    `${clampNumber(section.padding, 10, 0, 28)}px`);
  el.style.setProperty("--smart-v3-section-radius",
    `${clampNumber(section.radius, 16, 0, 40)}px`);
  el.style.setProperty("--smart-v3-section-title-color",
    section.title_color || cfg.design?.value_color || "#f5f7fa");
  el.style.setProperty("--smart-v3-section-subtitle-color",
    section.subtitle_color || cfg.design?.label_color || "#9aa6af");
  el.style.setProperty("--smart-v3-section-title-size",
    `${clampNumber(section.title_size, 17, 11, 30)}px`);
  el.style.setProperty("--smart-v3-section-subtitle-size",
    `${clampNumber(section.subtitle_size, 11, 8, 20)}px`);
}

function buildSection(panel, section, cfg) {
  const sectionEl = document.createElement("section");
  sectionEl.className = `smart-v3-section ${section.section_surface ? "surface" : ""}`;
  sectionEl.dataset.smartV3Section = section.id;
  configureSectionCss(sectionEl, section, cfg);

  if (section.show_header !== false) {
    const header = document.createElement("header");
    const alignment = ["left", "center", "right"].includes(section.align)
      ? section.align : "left";
    header.className = `smart-v3-section-header align-${alignment} ${
      section.header_surface ? "header-surface" : ""
    }`;
    header.innerHTML = `
      ${section.icon ? `<div class="smart-v3-section-icon">${
        panel._icon(section.icon, clampNumber(section.icon_size, 22, 14, 40),
          section.icon_color || cfg.design?.accent_color || "#35ddd5")
      }</div>` : ""}
      <div class="smart-v3-section-text">
        <div class="smart-v3-section-title">${panel._escape(section.title || "")}</div>
        ${section.subtitle ? `<div class="smart-v3-section-subtitle">${
          panel._escape(section.subtitle)
        }</div>` : ""}
      </div>`;
    sectionEl.append(header);
  }

  const grid = document.createElement("div");
  grid.className = "smart-v3-section-grid";
  grid.dataset.smartV3Grid = section.id;
  sectionEl.append(grid);
  return { sectionEl, grid };
}

function applyV3Layout(panel, cfg) {
  const root = panel.shadowRoot;
  const page = root?.querySelector?.(".page");
  const stack = root?.querySelector?.(".stack");
  if (!page || !stack) return;

  const active = Boolean(cfg.layout_v3?.enabled);
  page.classList.toggle("smart-v3-active", active);

  const version = root.querySelector?.(".version");
  if (version) {
    version.textContent = active
      ? `v${SMART_HOME_PANEL_V3_VERSION} · módulo ${SMART_HOME_MODULE_VERSION}`
      : `v${SMART_HOME_PANEL_V3_VERSION} · layout V3 desactivado`;
  }
  if (!active) return;

  const cards = [...stack.children].filter(
    (node) => node.getAttribute?.("data-smart-card-ref"));
  const byRef = new Map(cards.map(
    (node) => [String(node.getAttribute("data-smart-card-ref")), node]));

  for (const card of cards) card.remove();

  for (const section of cfg.layout_v3.sections || []) {
    const refs = (section.widgets || []).filter((ref) => byRef.has(ref));

    if (section.show === false) {
      for (const ref of refs) {
        const card = byRef.get(ref);
        card.classList.add("smart-v3-hidden");
        card.dataset.smartV3Section = section.id;
        stack.append(card);
      }
      continue;
    }
    if (!refs.length && !section.show_empty) continue;

    const { sectionEl, grid } = buildSection(panel, section, cfg);
    for (const ref of refs) {
      const card = byRef.get(ref);
      card.classList.remove("smart-v3-hidden");
      card.dataset.smartV3Section = section.id;
      card.dataset.smartV3Size = semanticSize(cfg, ref);
      grid.append(card);
    }
    if (!refs.length && section.show_empty) {
      const empty = document.createElement("div");
      empty.className = "smart-v3-empty";
      empty.textContent =
        "Sección vacía · agrega o mueve widgets desde Personalización";
      grid.append(empty);
    }
    stack.append(sectionEl);
  }
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

function iconPickerButton(panel, path) {
  return `<button type="button" class="editor-btn"
    data-action="v3-open-icon-picker" data-path="${panel._escape(path)}"
    style="margin-top:8px;width:100%">Buscar icono</button>`;
}

function sectionOptions(panel, cfg, currentId) {
  return (cfg.layout_v3?.sections || []).map((section) =>
    `<option value="${panel._escape(section.id)}" ${
      section.id === currentId ? "selected" : ""
    }>${panel._escape(section.title || section.id)}</option>`).join("");
}

function widgetRow(panel, cfg, section, ref, index) {
  const info = widgetInfo(cfg, ref);
  const showPath = widgetShowPath(cfg, ref);
  const show = info.widget?.show !== false;
  const size = cfg.layout_v3?.widget_layout?.[ref]?.size || "auto";
  const extraId = extraIdFromRef(ref);

  return `
    <div class="smart-v3-widget-row">
      <div class="smart-v3-widget-main">
        <div class="smart-v3-widget-icon">${
          panel._icon(info.icon, 21,
            info.widget?.style?.icon_color || cfg.design?.accent_color || "#35ddd5")
        }</div>
        <div style="min-width:0">
          <div class="smart-v3-widget-label">${panel._escape(info.label)}</div>
          <div class="smart-v3-widget-type">${panel._escape(info.type)}</div>
        </div>
        ${showPath ? `<label class="smart-v3-mini-toggle">
          <input type="checkbox" data-setting="${panel._escape(showPath)}"
            data-value-type="boolean" ${show ? "checked" : ""}>Mostrar
        </label>` : ""}
      </div>
      <div class="smart-v3-widget-controls">
        <div class="smart-v3-mini-field">
          <label>Tamaño</label>
          <select class="smart-v3-mini-select"
            data-setting="layout_v3.widget_layout.${panel._escape(ref)}.size"
            data-value-type="string">
            ${[
              ["auto","Automático"],["small","Pequeño"],["medium","Mediano"],
              ["large","Grande"],["full","Ancho completo"],
            ].map(([v,l]) => `<option value="${v}" ${
              size === v ? "selected" : ""
            }>${l}</option>`).join("")}
          </select>
        </div>
        <div class="smart-v3-mini-field">
          <label>Sección</label>
          <select class="smart-v3-mini-select"
            data-v3-widget-section="${panel._escape(ref)}">
            ${sectionOptions(panel, cfg, section.id)}
          </select>
        </div>
        <div class="smart-v3-widget-buttons">
          <button class="tiny-btn" data-action="v3-move-widget"
            data-ref="${panel._escape(ref)}" data-direction="-1"
            ${index === 0 ? "disabled" : ""}>↑</button>
          <button class="tiny-btn" data-action="v3-move-widget"
            data-ref="${panel._escape(ref)}" data-direction="1"
            ${index === section.widgets.length - 1 ? "disabled" : ""}>↓</button>
          <button class="tiny-btn" data-action="v3-edit-widget"
            data-ref="${panel._escape(ref)}">Editar</button>
          ${extraId ? `<button class="tiny-btn" data-action="remove-extra-card"
            data-card-id="${panel._escape(extraId)}">Eliminar</button>` : ""}
        </div>
      </div>
    </div>`;
}

function renderSectionEditor(panel, cfg, section, index) {
  const p = `layout_v3.sections.${index}`;
  const widgets = (section.widgets || [])
    .map((ref, widgetIndex) => widgetRow(panel, cfg, section, ref, widgetIndex))
    .join("");
  const protectedSection = PROTECTED_SECTION_IDS.has(section.id);

  return `
    <div class="item-card smart-v3-section-editor">
      <div class="smart-v3-section-editor-head">
        <div class="smart-v3-section-editor-title">
          <span class="icon-preview">${
            panel._icon(section.icon || "mdi:view-grid-outline", 22,
              section.icon_color || cfg.design?.accent_color || "#35ddd5")
          }</span>
          <span>${panel._escape(section.title || `Sección ${index + 1}`)}</span>
        </div>
        <div class="smart-v3-section-editor-actions">
          <button class="tiny-btn" data-action="v3-move-section"
            data-section-id="${panel._escape(section.id)}" data-direction="-1"
            ${index === 0 ? "disabled" : ""}>↑</button>
          <button class="tiny-btn" data-action="v3-move-section"
            data-section-id="${panel._escape(section.id)}" data-direction="1"
            ${index === cfg.layout_v3.sections.length - 1 ? "disabled" : ""}>↓</button>
          <button class="tiny-btn" data-action="v3-duplicate-section"
            data-section-id="${panel._escape(section.id)}">Duplicar</button>
          ${protectedSection ? "" : `<button class="tiny-btn"
            data-action="v3-remove-section"
            data-section-id="${panel._escape(section.id)}">Eliminar</button>`}
        </div>
      </div>

      <div class="field-grid">
        ${panel._input(`${p}.show`, "Mostrar sección", section.show,
          { type: "checkbox" })}
        ${panel._input(`${p}.show_header`, "Mostrar encabezado", section.show_header,
          { type: "checkbox" })}
        ${panel._input(`${p}.show_empty`, "Mostrar si está vacía", section.show_empty,
          { type: "checkbox" })}
        ${panel._input(`${p}.section_surface`, "Fondo/borde de toda la sección",
          section.section_surface, { type: "checkbox" })}
        ${panel._input(`${p}.header_surface`, "Fondo/borde solo del encabezado",
          section.header_surface, { type: "checkbox" })}
        ${panel._input(`${p}.title`, "Título", section.title)}
        ${panel._input(`${p}.subtitle`, "Subtítulo", section.subtitle || "")}
        ${panel._input(`${p}.icon`, "Icono MDI", section.icon || "", { full: true })}
        ${panel._input(`${p}.align`, "Alineación", section.align, {
          type: "select",
          options: [["left","Izquierda"],["center","Centro"],["right","Derecha"]],
        })}
        ${panel._color(`${p}.icon_color`, "Color icono",
          section.icon_color || cfg.design?.accent_color)}
        ${panel._color(`${p}.title_color`, "Color título",
          section.title_color || cfg.design?.value_color)}
        ${panel._color(`${p}.subtitle_color`, "Color subtítulo",
          section.subtitle_color || cfg.design?.label_color)}
        ${panel._input(`${p}.icon_size`, "Tamaño icono", section.icon_size,
          { type: "range", min: 14, max: 40, step: 1 })}
        ${panel._input(`${p}.title_size`, "Tamaño título", section.title_size,
          { type: "range", min: 11, max: 30, step: 1 })}
        ${panel._input(`${p}.subtitle_size`, "Tamaño subtítulo", section.subtitle_size,
          { type: "range", min: 8, max: 20, step: 1 })}
        ${panel._color(`${p}.background`, "Fondo", section.background || "#0f171c")}
        ${panel._color(`${p}.border_color`, "Borde",
          section.border_color || cfg.design?.card_border_color)}
        ${panel._input(`${p}.border_width`, "Grosor borde", section.border_width,
          { type: "range", min: 0, max: 4, step: 1 })}
        ${panel._input(`${p}.radius`, "Radio", section.radius,
          { type: "range", min: 0, max: 40, step: 1 })}
        ${panel._input(`${p}.padding`, "Padding", section.padding,
          { type: "range", min: 0, max: 28, step: 1 })}
      </div>

      <div class="smart-v3-widget-list">
        ${widgets || '<div class="help">Esta sección todavía no tiene widgets.</div>'}
      </div>
      <div class="smart-v3-add-row">
        <button class="editor-btn" data-action="v3-add-widget"
          data-section-id="${panel._escape(section.id)}">+ Agregar widget aquí</button>
      </div>
    </div>`;
}

function renderV3Editor(panel, cfg) {
  const layout = cfg.layout_v3;
  const sections = (layout.sections || [])
    .map((section, index) => renderSectionEditor(panel, cfg, section, index))
    .join("");

  return [
    `<div class="smart-v3-editor-intro">
      <b>Smart Home Panel V3.1.0</b> es un elemento propio. Hereda las funciones
      validadas de V2/Card Layout, pero secciones, responsive y organización V3
      pertenecen directamente a la clase V3.
    </div>`,
    panel._section("Layout V3", `<div class="field-grid">
      ${panel._input("layout_v3.enabled", "Activar Layout V3", layout.enabled,
        { type: "checkbox", full: true })}
      ${panel._input("layout_v3.adaptive_width",
        "Ancho adaptativo para el valor heredado 520", layout.adaptive_width,
        { type: "checkbox", full: true })}
      ${panel._input("layout_v3.breakpoint", "Inicio tablet/PC (px reales)",
        layout.breakpoint, { type: "range", min: 600, max: 900, step: 10 })}
      ${panel._input("layout_v3.wide_max_width", "Ancho máximo tablet/PC",
        layout.wide_max_width, { type: "range", min: 760, max: 1400, step: 20 })}
      ${panel._input("layout_v3.grid_gap", "Separación entre widgets",
        layout.grid_gap, { type: "range", min: 4, max: 30, step: 1 })}
      ${panel._input("layout_v3.section_gap", "Separación entre secciones",
        layout.section_gap, { type: "range", min: 8, max: 44, step: 1 })}
    </div><div class="help">
      El esquema layout_v3 sigue siendo versión 1 y es compatible con Suite 1.13.0.
      Un panel_max_width personalizado distinto de 520 se respeta.
    </div>`),
    panel._section("Secciones y widgets",
      `<div class="smart-v3-widget-list">${sections}</div>
       <div class="smart-v3-add-row">
         <button class="editor-btn" data-action="v3-add-section">+ Agregar sección</button>
       </div>`),
  ].join("");
}

function injectV3Editor(panel, html, cfg) {
  let out = String(html || "");
  const tab = `<button class="editor-tab ${
    panel._editorTab === "layout_v3" ? "active" : ""
  }" data-action="tab" data-tab="layout_v3">Layout V3</button>`;
  const marker = '</div>\n          <div class="editor-body">';

  if (out.includes(marker) && !out.includes('data-tab="layout_v3"')) {
    out = out.replace(marker, `${tab}</div>\n          <div class="editor-body">`);
  }
  if (panel._editorTab === "layout_v3") {
    out = out.replace(/<div class="editor-body">\s*<\/div>/,
      `<div class="editor-body">${renderV3Editor(panel, cfg)}</div>`);
  }
  return out;
}

function moveWidget(panel, ref, direction) {
  if (!updateEditorWorkingCopy(panel)) return;
  const sections = panel._editConfig.layout_v3.sections;
  const sectionIndex = sections.findIndex((section) => section.widgets.includes(ref));
  if (sectionIndex < 0) return;
  const section = sections[sectionIndex];
  const index = section.widgets.indexOf(ref);

  if (direction < 0) {
    if (index > 0) {
      [section.widgets[index - 1], section.widgets[index]]
        = [section.widgets[index], section.widgets[index - 1]];
    } else if (sectionIndex > 0) {
      section.widgets.splice(index, 1);
      sections[sectionIndex - 1].widgets.push(ref);
    }
  } else if (index < section.widgets.length - 1) {
    [section.widgets[index], section.widgets[index + 1]]
      = [section.widgets[index + 1], section.widgets[index]];
  } else if (sectionIndex < sections.length - 1) {
    section.widgets.splice(index, 1);
    sections[sectionIndex + 1].widgets.unshift(ref);
  }
  updateEditorWorkingCopy(panel);
}

function moveWidgetToSection(panel, ref, targetId) {
  if (!updateEditorWorkingCopy(panel)) return;
  const sections = panel._editConfig.layout_v3.sections;
  for (const section of sections) {
    const index = section.widgets.indexOf(ref);
    if (index >= 0) {
      section.widgets.splice(index, 1);
      break;
    }
  }
  const target = sections.find((section) => section.id === targetId) || sections[0];
  if (target && !target.widgets.includes(ref)) target.widgets.push(ref);
  updateEditorWorkingCopy(panel);
}

function moveSection(panel, id, direction) {
  if (!updateEditorWorkingCopy(panel)) return;
  const sections = panel._editConfig.layout_v3.sections;
  const index = sections.findIndex((section) => section.id === id);
  const next = index + (direction < 0 ? -1 : 1);
  if (index >= 0 && next >= 0 && next < sections.length) {
    [sections[index], sections[next]] = [sections[next], sections[index]];
    updateEditorWorkingCopy(panel);
  }
}

function addSection(panel) {
  if (!updateEditorWorkingCopy(panel)) return;
  panel._editConfig.layout_v3.sections.push(
    sectionDefaults(newId("section"), "Nueva sección", "mdi:view-grid-outline", []));
  updateEditorWorkingCopy(panel);
}

function duplicateSection(panel, id) {
  if (!updateEditorWorkingCopy(panel)) return;
  const sections = panel._editConfig.layout_v3.sections;
  const source = sections.find((section) => section.id === id);
  if (!source) return;
  const copy = clone(source);
  copy.id = newId("section");
  copy.title = `${source.title || "Sección"} copia`;
  copy.widgets = [];
  sections.splice(sections.indexOf(source) + 1, 0, copy);
  updateEditorWorkingCopy(panel);
}

function removeSection(panel, id) {
  if (PROTECTED_SECTION_IDS.has(id) || !updateEditorWorkingCopy(panel)) return;
  const sections = panel._editConfig.layout_v3.sections;
  const index = sections.findIndex((section) => section.id === id);
  if (index < 0) return;
  const [removed] = sections.splice(index, 1);

  if (!sections.length) {
    sections.push(sectionDefaults("summary", "Resumen", "mdi:home-outline", []));
  }
  const target = sections[Math.max(0, index - 1)] || sections[0];
  for (const ref of removed.widgets || []) {
    if (!target.widgets.includes(ref)) target.widgets.push(ref);
  }
  updateEditorWorkingCopy(panel);
}

function addWidget(panel, sectionId) {
  if (!updateEditorWorkingCopy(panel)) return;
  const card = extraCardDefaults();
  panel._editConfig.extra_cards ||= [];
  panel._editConfig.extra_cards.push(card);
  const ref = extraRef(card.id);
  const section = panel._editConfig.layout_v3.sections.find(
    (item) => item.id === sectionId) || panel._editConfig.layout_v3.sections[0];
  section?.widgets.push(ref);
  panel._editConfig.layout_v3.widget_layout[ref] = { size: "auto" };
  updateEditorWorkingCopy(panel);
}

function nativeSettings(panel, cfg) {
  const defaults = panel.smartHomeNativeDefaults || {};
  const native = isObject(cfg?.native) ? cfg.native : {};
  return {
    hide_ha_header: typeof native.hide_ha_header === "boolean"
      ? native.hide_ha_header : defaults.hide_ha_header !== false,
    mobile_menu_access: normalizeMobileMenuAccess(
      native.mobile_menu_access, defaults.mobile_menu_access || "admins"),
  };
}

function emitNativePreferences(panel, cfg) {
  panel.dispatchEvent(new CustomEvent(SMART_HOME_NATIVE_PREFERENCES_EVENT, {
    detail: nativeSettings(panel, cfg),
    bubbles: true,
    composed: true,
  }));
}

function openIconPicker(panel, path) {
  const root = panel.shadowRoot;
  if (!root || !panel._editConfig) return;

  root.querySelector?.(".smart-v3-icon-picker-backdrop")?.remove();
  panel._smartV3IconPickerPath = path;
  const current = panel._getPath(panel._editConfig, path) || "";

  const backdrop = document.createElement("div");
  backdrop.className = "smart-v3-icon-picker-backdrop";
  backdrop.innerHTML = `
    <section class="smart-v3-icon-picker" role="dialog" aria-modal="true">
      <div class="smart-v3-icon-picker-head">
        <div>
          <div class="smart-v3-icon-picker-title">Seleccionar icono</div>
          <div class="help">Selector nativo de Home Assistant; el campo manual mdi: siempre queda disponible.</div>
        </div>
        <button class="tiny-btn" data-action="v3-close-icon-picker">✕</button>
      </div>
      <div class="smart-v3-icon-picker-native">
        <div class="help">Cargando selector nativo…</div>
      </div>
      <div class="smart-v3-icon-picker-manual">
        <input class="control" data-v3-icon-manual type="text"
          value="${panel._escape(current)}" placeholder="mdi:home-outline">
        <button class="editor-btn" data-action="v3-apply-icon-manual">Usar icono</button>
      </div>
    </section>`;
  root.append(backdrop);

  const apply = (raw) => {
    const value = String(raw || "").trim();
    if (!value || !panel._editConfig) return false;
    const normalized = value.includes(":")
      ? value
      : `mdi:${value.replace(/^mdi-/, "")}`;
    panel._setPath(panel._editConfig, path, normalized);
    panel._smartV3IconPickerPath = null;
    backdrop.remove();
    panel._lastSignature = "";
    panel._queueRender();
    return true;
  };

  let mounted = false;
  const mountNativePicker = () => {
    if (mounted || !backdrop.isConnected) return mounted;
    const mount = backdrop.querySelector(".smart-v3-icon-picker-native");
    if (!mount) return false;

    if (customElements.get("ha-selector")) {
      mount.textContent = "";
      const selector = document.createElement("ha-selector");
      selector.hass = panel._hass;
      selector.narrow = Boolean(panel._narrow);
      selector.selector = { icon: null };
      selector.value = current;
      selector.label = "Buscar iconos MDI";
      selector.addEventListener("value-changed", (ev) => apply(ev.detail?.value));
      mount.append(selector);
      mounted = true;
      return true;
    }

    if (customElements.get("ha-icon-picker")) {
      mount.textContent = "";
      const picker = document.createElement("ha-icon-picker");
      picker.value = current;
      picker.label = "Buscar iconos MDI";
      picker.addEventListener("value-changed", (ev) => apply(ev.detail?.value));
      mount.append(picker);
      mounted = true;
      return true;
    }

    return false;
  };

  if (!mountNativePicker()) {
    Promise.resolve(customElements.whenDefined?.("ha-selector"))
      .then(() => mountNativePicker())
      .catch(() => {});
    Promise.resolve(customElements.whenDefined?.("ha-icon-picker"))
      .then(() => mountNativePicker())
      .catch(() => {});

    window.setTimeout(() => {
      if (!backdrop.isConnected || mounted) return;
      const mount = backdrop.querySelector(".smart-v3-icon-picker-native");
      if (mount) {
        mount.innerHTML = `<div class="help">
          El selector visual nativo no está disponible en esta pantalla.
          Puedes usar el campo manual mdi: sin afectar el editor.
        </div>`;
      }
    }, 1800);
  }
}

class SmartHomePanelV3 extends LegacyPanel {
  constructor() {
    super();
    this._smartV3IconPickerPath = null;
  }

  _config() {
    return normalizeV3Config(super._config());
  }

  _styles(cfg) {
    return `${super._styles(cfg)}\n${v3Styles(cfg)}`;
  }

  _input(path, label, value, opts = {}) {
    const original = super._input(path, label, value, opts);
    const type = opts?.type || "text";
    if (type !== "text" || !isIconSettingPath(path)) return original;
    if (original.includes('data-action="v3-open-icon-picker"')) return original;
    return insertBeforeLastClosingDiv(original, iconPickerButton(this, path));
  }

  _editorGeneral(cfg) {
    const original = super._editorGeneral(cfg);
    const native = nativeSettings(this, cfg);
    return `${original}${this._section("Interfaz de Home Assistant", `
      <div class="field-grid">
        ${this._input(
          "native.hide_ha_header",
          "Ocultar barra superior de Home Assistant",
          native.hide_ha_header,
          { type: "checkbox", full: true },
        )}
        ${this._input(
          "native.mobile_menu_access",
          "Acceso al menú lateral en móvil",
          native.mobile_menu_access,
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
      </div>
      <div class="help">
        Solo afecta /smart-home. En escritorio la barra lateral nativa conserva
        su comportamiento. Para recuperación temporal usa ?show_ha_header=1.
      </div>
    `)}`;
  }

  _editor(cfg) {
    return injectV3Editor(this, super._editor(cfg), cfg);
  }

  async _saveConfig(...args) {
    updateEditorWorkingCopy(this);
    return super._saveConfig(...args);
  }

  _onChange(ev) {
    const sectionSelect = ev.target?.closest?.("[data-v3-widget-section]");
    if (sectionSelect && this._editConfig) {
      moveWidgetToSection(
        this,
        String(sectionSelect.dataset.v3WidgetSection || ""),
        String(sectionSelect.value || ""),
      );
      this._lastSignature = "";
      this._queueRender();
      return;
    }

    super._onChange(ev);
    if (this._editConfig) updateEditorWorkingCopy(this);
  }

  async _onClick(ev) {
    const target = ev.target?.closest?.("[data-action]");
    const action = target?.dataset?.action;

    if (action === "v3-move-section") {
      moveSection(this, String(target.dataset.sectionId || ""),
        Number(target.dataset.direction));
      this._lastSignature = "";
      this._queueRender();
      return;
    }
    if (action === "v3-add-section") {
      addSection(this);
      this._lastSignature = "";
      this._queueRender();
      return;
    }
    if (action === "v3-duplicate-section") {
      duplicateSection(this, String(target.dataset.sectionId || ""));
      this._lastSignature = "";
      this._queueRender();
      return;
    }
    if (action === "v3-remove-section") {
      const id = String(target.dataset.sectionId || "");
      if (!confirm("¿Eliminar esta sección? Sus widgets se moverán a otra sección.")) {
        return;
      }
      removeSection(this, id);
      this._lastSignature = "";
      this._queueRender();
      return;
    }
    if (action === "v3-move-widget") {
      moveWidget(this, String(target.dataset.ref || ""),
        Number(target.dataset.direction));
      this._lastSignature = "";
      this._queueRender();
      return;
    }
    if (action === "v3-add-widget") {
      addWidget(this, String(target.dataset.sectionId || ""));
      this._lastSignature = "";
      this._queueRender();
      return;
    }
    if (action === "v3-edit-widget") {
      const ref = String(target.dataset.ref || "");
      this._editorTab = ref === "power" ? "gauge" : "cards";
      this._lastSignature = "";
      this._queueRender();
      return;
    }
    if (action === "v3-open-icon-picker") {
      openIconPicker(this, String(target.dataset.path || ""));
      return;
    }
    if (action === "v3-close-icon-picker") {
      this.shadowRoot?.querySelector?.(".smart-v3-icon-picker-backdrop")?.remove();
      this._smartV3IconPickerPath = null;
      return;
    }
    if (action === "v3-apply-icon-manual") {
      const input = this.shadowRoot?.querySelector?.("[data-v3-icon-manual]");
      const value = String(input?.value || "").trim();
      const path = this._smartV3IconPickerPath;
      if (path && value && this._editConfig) {
        const normalized = value.includes(":")
          ? value
          : `mdi:${value.replace(/^mdi-/, "")}`;
        this._setPath(this._editConfig, path, normalized);
        this._smartV3IconPickerPath = null;
        this.shadowRoot?.querySelector?.(".smart-v3-icon-picker-backdrop")?.remove();
        this._lastSignature = "";
        this._queueRender();
      }
      return;
    }

    if (
      action === "move-smart-card"
      && this._editConfig
      && this._config().layout_v3?.enabled
    ) {
      moveWidget(
        this,
        String(target.dataset.cardRef || ""),
        Number(target.dataset.direction),
      );
      this._lastSignature = "";
      this._queueRender();
      return;
    }

    await super._onClick(ev);

    if (
      this._editConfig
      && ["add-extra-card", "remove-extra-card", "reset-config"].includes(action)
    ) {
      updateEditorWorkingCopy(this);
      this._lastSignature = "";
      this._queueRender();
    }
  }

  _render(...args) {
    const result = super._render(...args);

    if (this._hass && this._panel && this._loaded && this.shadowRoot) {
      try {
        const cfg = this._config();
        applyV3Layout(this, cfg);
        queueMicrotask(() => {
          try {
            emitNativePreferences(this, cfg);
          } catch (_) {
            // Header/menu preference signaling is fail-open.
          }
        });
      } catch (err) {
        console.warn(
          "[Smart Home Panel V3] layout error; base output preserved",
          err,
        );
      }
    }

    return result;
  }
}

if (!customElements.get("smart-home-panel-v3")) {
  customElements.define("smart-home-panel-v3", SmartHomePanelV3);
}

console.info(
  `[Smart Home Panel V3] v${SMART_HOME_PANEL_V3_VERSION} · módulo ${SMART_HOME_MODULE_VERSION} cargado`,
);
