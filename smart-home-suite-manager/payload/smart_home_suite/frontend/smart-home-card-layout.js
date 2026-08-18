/**
 * Smart Home Suite configurable card layout runtime v1.0.0
 *
 * Extends the validated Smart Home Panel V2.0.5 at runtime without replacing it.
 * Adds:
 * - stable ordering for the four existing cards;
 * - optional extra entity cards;
 * - value, progress-bar and history-graph presentations for extra cards;
 * - the same entity picker, MDI picker, tap/hold actions and visual controls;
 * - backward-compatible configuration stored by the existing backend.
 */

const SMART_HOME_CARD_LAYOUT_RUNTIME_VERSION = "1.0.0";
const CARD_LAYOUT_MARKER = Symbol.for("smart-home-suite-card-layout-v1.0.0");
const BUILTIN_CARD_REFS = Object.freeze(["monthly_cost", "season", "tariff", "power"]);
const BUILTIN_CARD_LABELS = Object.freeze({
  monthly_cost: "Costo mensual",
  season: "Temporada",
  tariff: "Rango de tarifa",
  power: "Consumo actual / Tacómetro",
});
const EXTRA_CARD_TYPES = new Set(["value", "bar", "graph"]);
const HISTORY_CACHE_TTL_MS = 5 * 60 * 1000;
const HISTORY_RETRY_MS = 30 * 1000;

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function mergeDefaults(base, custom) {
  if (Array.isArray(base)) return Array.isArray(custom) ? clone(custom) : clone(base);
  if (base && typeof base === "object") {
    const out = { ...base };
    if (custom && typeof custom === "object" && !Array.isArray(custom)) {
      for (const [key, value] of Object.entries(custom)) {
        out[key] = mergeDefaults(base[key], value);
      }
    }
    return out;
  }
  return custom !== undefined ? custom : base;
}

function newExtraCardId() {
  const random = Math.random().toString(36).slice(2, 8);
  return `extra_${Date.now().toString(36)}_${random}`;
}

function extraRef(id) {
  return `extra:${id}`;
}

function extraIdFromRef(ref) {
  return String(ref || "").startsWith("extra:") ? String(ref).slice(6) : "";
}

function extraCardDefaults(id = newExtraCardId()) {
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
      height: 110,
      width: "100%",
      background: "",
      border_color: "",
      border_width: "",
      border_radius: "",
      padding: "",
      align: "left",
      icon_color: "#35ddd5",
      icon_size: 28,
      icon_background: "rgba(53,221,213,.10)",
      icon_box_size: 50,
      label_color: "",
      label_size: 13,
      label_weight: 500,
      value_color: "",
      value_size: 29,
      value_weight: 620,
      unit_color: "",
      unit_size: 13,
      unit_weight: 500,
    },
    bar: {
      min: 0,
      max: 100,
      height: 12,
      track_color: "#1f2b33",
      fill_color: "#35ddd5",
      show_scale: true,
    },
    graph: {
      hours: 24,
      max_points: 60,
      height: 120,
      auto_scale: true,
      min: 0,
      max: 100,
      line_color: "#35ddd5",
      fill_color: "#35ddd5",
      fill_opacity: 0.14,
      line_width: 3,
      show_min_max: true,
    },
  };
}

function normalizeExtraCard(card, usedIds) {
  let id = String(card?.id || "").trim();
  if (!id || usedIds.has(id)) id = newExtraCardId();
  usedIds.add(id);
  const merged = mergeDefaults(extraCardDefaults(id), card || {});
  merged.id = id;
  merged.type = EXTRA_CARD_TYPES.has(String(merged.type)) ? String(merged.type) : "value";
  return merged;
}

function normalizeCardsConfig(cfg) {
  const normalized = cfg && typeof cfg === "object" ? cfg : {};
  const usedIds = new Set();
  normalized.extra_cards = Array.isArray(normalized.extra_cards)
    ? normalized.extra_cards.map((card) => normalizeExtraCard(card, usedIds))
    : [];

  if (!normalized.card_layout || typeof normalized.card_layout !== "object" || Array.isArray(normalized.card_layout)) {
    normalized.card_layout = {};
  } else {
    // The base V2.0.5 deepMerge preserves unknown keys by reference. Clone the
    // extension object before normalizing so reading config never mutates the
    // in-memory stored source unless the user explicitly saves.
    normalized.card_layout = { ...normalized.card_layout };
  }

  const validRefs = [
    ...BUILTIN_CARD_REFS,
    ...normalized.extra_cards.map((card) => extraRef(card.id)),
  ];
  const validSet = new Set(validRefs);
  const seen = new Set();
  const requested = Array.isArray(normalized.card_layout.order)
    ? normalized.card_layout.order.map((item) => String(item))
    : [];
  const order = [];

  for (const ref of requested) {
    if (!validSet.has(ref) || seen.has(ref)) continue;
    seen.add(ref);
    order.push(ref);
  }
  for (const ref of validRefs) {
    if (seen.has(ref)) continue;
    seen.add(ref);
    order.push(ref);
  }

  normalized.card_layout.order = order;
  return normalized;
}

function findExtraCard(cfg, ref) {
  const id = extraIdFromRef(ref);
  if (!id) return null;
  return (cfg?.extra_cards || []).find((card) => card?.id === id) || null;
}

function escapeAttribute(panel, value) {
  return panel?._escape ? panel._escape(value) : String(value ?? "");
}

function addCardRefAttribute(panel, html, ref, extra = false) {
  const source = String(html || "");
  if (!source.includes("<section")) return source;
  const marker = `data-smart-card-ref="${escapeAttribute(panel, ref)}"${extra ? ' data-smart-extra-card="1"' : ""}`;
  return source.replace("<section ", `<section ${marker} `);
}

function rgbaFromHex(hex, opacity) {
  const value = String(hex || "").trim();
  const match = /^#([0-9a-f]{6})$/i.exec(value);
  if (!match) return value || "rgba(53,221,213,.14)";
  const n = Number.parseInt(match[1], 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  const a = Math.min(1, Math.max(0, Number(opacity) || 0));
  return `rgba(${r},${g},${b},${a})`;
}

function cardTypeLabel(type) {
  if (type === "bar") return "Barra";
  if (type === "graph") return "Gráfica";
  return "Valor";
}

function renderBarCard(panel, widget, cfg, ref) {
  if (!widget?.show) return "";
  const data = panel._entityData(widget, cfg);
  const numeric = data.missing ? null : panel._numeric(data.raw, widget);
  const value = panel._displayValue(data, widget, cfg);
  const unit = panel._unit(data, widget);
  const s = widget.style || {};
  const bar = widget.bar || {};
  const min = panel._num(bar.min, 0);
  const max = Math.max(min + Number.EPSILON, panel._num(bar.max, 100));
  const ratio = numeric === null ? 0 : panel._clamp((numeric - min) / (max - min), 0, 1);
  const percent = Math.round(ratio * 100);
  const interactive = panel._hasWidgetAction(widget);

  return `
    <section data-smart-card-ref="${escapeAttribute(panel, ref)}" data-smart-extra-card="1" class="entity-card smart-extra-card smart-extra-bar ${data.missing ? "missing" : ""} ${interactive ? "interactive-surface" : ""}" style="${escapeAttribute(panel, panel._cardVars(widget, cfg))}" ${interactive ? `data-widget-key="${escapeAttribute(panel, ref)}" role="button" tabindex="0"` : ""}>
      <div class="entity-icon">${panel._icon(widget.icon, s.icon_size, s.icon_color || cfg.design.accent_color)}</div>
      <div class="entity-content smart-extra-content">
        <div class="entity-label">${escapeAttribute(panel, widget.label || "")}</div>
        <div class="entity-value-line">
          ${widget.prefix ? `<span class="entity-prefix">${escapeAttribute(panel, widget.prefix)}</span>` : ""}
          <span class="entity-value">${escapeAttribute(panel, value)}</span>
          ${unit ? `<span class="entity-unit">${escapeAttribute(panel, unit)}</span>` : ""}
        </div>
        <div class="smart-progress-track" style="--smart-progress-height:${panel._cssSize(bar.height, "12px")};--smart-progress-track:${escapeAttribute(panel, bar.track_color || "#1f2b33")};--smart-progress-fill:${escapeAttribute(panel, bar.fill_color || cfg.design.accent_color)}">
          <div class="smart-progress-fill" style="width:${percent}%"></div>
        </div>
        ${bar.show_scale ? `<div class="smart-progress-scale"><span>${escapeAttribute(panel, panel._formatNumber(min, widget.decimals, cfg.locale))}</span><span>${percent}%</span><span>${escapeAttribute(panel, panel._formatNumber(max, widget.decimals, cfg.locale))}</span></div>` : ""}
        ${data.missing && widget.entity ? `<div class="entity-id">${escapeAttribute(panel, widget.entity)}</div>` : ""}
      </div>
    </section>`;
}

function downsample(points, maxPoints) {
  const max = Math.max(8, Math.min(240, Math.round(Number(maxPoints) || 60)));
  if (points.length <= max) return points;
  if (max <= 2) return [points[0], points.at(-1)];
  const out = [points[0]];
  const step = (points.length - 1) / (max - 1);
  for (let i = 1; i < max - 1; i += 1) {
    out.push(points[Math.round(i * step)]);
  }
  out.push(points.at(-1));
  return out;
}

function historyStateTimestampMs(row, fallbackMs) {
  const seconds = Number(row?.lu ?? row?.lc);
  return Number.isFinite(seconds) ? seconds * 1000 : fallbackMs;
}

function historyCache(panel) {
  if (!(panel._smartCardHistory instanceof Map)) panel._smartCardHistory = new Map();
  return panel._smartCardHistory;
}

function historyEntry(panel, widget) {
  const hours = Math.max(1, Math.min(720, Number(widget?.graph?.hours) || 24));
  const key = `${widget?.entity || ""}|${hours}|${Number(widget?.multiplier) || 1}|${Number(widget?.offset) || 0}`;
  const cache = historyCache(panel);
  let entry = cache.get(widget.id);
  if (!entry || entry.key !== key) {
    entry = { key, points: [], fetchedAt: 0, failedAt: 0, loading: false, error: "" };
    cache.set(widget.id, entry);
  }
  return { entry, hours };
}

async function requestHistory(panel, widget) {
  if (!widget?.id || !widget?.entity || widget.type !== "graph" || !widget.show || !panel?._hass?.callWS) return;
  const { entry, hours } = historyEntry(panel, widget);
  const now = Date.now();
  if (entry.loading) return;
  if (entry.fetchedAt && now - entry.fetchedAt < HISTORY_CACHE_TTL_MS) return;
  if (entry.failedAt && now - entry.failedAt < HISTORY_RETRY_MS) return;

  entry.loading = true;
  entry.error = "";
  try {
    const end = new Date(now);
    const start = new Date(now - hours * 60 * 60 * 1000);
    const result = await panel._hass.callWS({
      type: "history/history_during_period",
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      entity_ids: [widget.entity],
      minimal_response: true,
      no_attributes: true,
    });
    const rows = Array.isArray(result?.[widget.entity]) ? result[widget.entity] : [];
    const points = [];
    for (const row of rows) {
      const raw = Number.parseFloat(String(row?.s ?? "").replace(",", "."));
      if (!Number.isFinite(raw)) continue;
      const value = raw * (Number.isFinite(Number(widget.multiplier)) ? Number(widget.multiplier) : 1)
        + (Number.isFinite(Number(widget.offset)) ? Number(widget.offset) : 0);
      points.push({ t: historyStateTimestampMs(row, start.getTime()), v: value });
    }

    const current = panel._hass.states?.[widget.entity];
    const currentRaw = Number.parseFloat(String(current?.state ?? "").replace(",", "."));
    if (Number.isFinite(currentRaw)) {
      const value = currentRaw * (Number.isFinite(Number(widget.multiplier)) ? Number(widget.multiplier) : 1)
        + (Number.isFinite(Number(widget.offset)) ? Number(widget.offset) : 0);
      const last = points.at(-1);
      if (!last || now - last.t > 1000) points.push({ t: now, v: value });
    }

    entry.points = downsample(points, widget.graph?.max_points);
    entry.fetchedAt = now;
    entry.failedAt = 0;
    entry.error = "";
  } catch (err) {
    entry.failedAt = now;
    entry.error = err?.message || String(err || "No se pudo cargar el historial");
  } finally {
    entry.loading = false;
    panel._smartCardHistoryRevision = (panel._smartCardHistoryRevision || 0) + 1;
    if (!panel._editorOpen) {
      panel._lastSignature = "";
      panel._queueRender?.();
    }
  }
}


function graphPointsWithCurrent(panel, widget, cachedPoints) {
  const points = Array.isArray(cachedPoints) ? cachedPoints.map((point) => ({ ...point })) : [];
  const current = panel?._hass?.states?.[widget?.entity];
  const raw = Number.parseFloat(String(current?.state ?? "").replace(",", "."));
  if (!Number.isFinite(raw)) return points;
  const multiplier = Number.isFinite(Number(widget?.multiplier)) ? Number(widget.multiplier) : 1;
  const offset = Number.isFinite(Number(widget?.offset)) ? Number(widget.offset) : 0;
  const value = raw * multiplier + offset;
  const now = Date.now();
  const last = points.at(-1);
  if (!last || now - last.t > 1000 || Math.abs(last.v - value) > Number.EPSILON) {
    points.push({ t: now, v: value });
  }
  return downsample(points, widget?.graph?.max_points);
}

function graphGeometry(panel, widget, points) {
  const width = 320;
  const height = Math.max(60, Math.min(220, panel._num(widget?.graph?.height, 120)));
  if (points.length < 2) return { width, height, path: "", fillPath: "", min: null, max: null };

  const values = points.map((point) => point.v).filter(Number.isFinite);
  if (!values.length) return { width, height, path: "", fillPath: "", min: null, max: null };

  let min = widget?.graph?.auto_scale !== false ? Math.min(...values) : panel._num(widget?.graph?.min, 0);
  let max = widget?.graph?.auto_scale !== false ? Math.max(...values) : panel._num(widget?.graph?.max, 100);
  if (!Number.isFinite(min)) min = 0;
  if (!Number.isFinite(max)) max = min + 1;
  if (max <= min) {
    const pad = Math.max(1, Math.abs(min) * 0.05);
    min -= pad;
    max += pad;
  }

  const firstT = points[0].t;
  const lastT = points.at(-1).t;
  const spanT = Math.max(1, lastT - firstT);
  const top = 8;
  const bottom = height - 8;
  const range = max - min;
  const coords = points.map((point) => {
    const x = ((point.t - firstT) / spanT) * width;
    const y = bottom - ((point.v - min) / range) * (bottom - top);
    return [panel._clamp(x, 0, width), panel._clamp(y, top, bottom)];
  });
  const path = coords.map(([x, y], index) => `${index ? "L" : "M"}${x.toFixed(2)} ${y.toFixed(2)}`).join(" ");
  const fillPath = `${path} L${coords.at(-1)[0].toFixed(2)} ${bottom.toFixed(2)} L${coords[0][0].toFixed(2)} ${bottom.toFixed(2)} Z`;
  return { width, height, path, fillPath, min, max };
}

function renderGraphCard(panel, widget, cfg, ref) {
  if (!widget?.show) return "";
  const data = panel._entityData(widget, cfg);
  const value = panel._displayValue(data, widget, cfg);
  const unit = panel._unit(data, widget);
  const s = widget.style || {};
  const graph = widget.graph || {};
  const { entry } = historyEntry(panel, widget);
  const points = graphPointsWithCurrent(panel, widget, entry.points || []);
  const geo = graphGeometry(panel, widget, points);
  const interactive = panel._hasWidgetAction(widget);
  const status = entry.loading
    ? "Cargando historial…"
    : entry.error
      ? "Historial no disponible"
      : points.length < 2
        ? "Sin historial suficiente"
        : "";

  requestHistory(panel, widget);

  return `
    <section data-smart-card-ref="${escapeAttribute(panel, ref)}" data-smart-extra-card="1" class="smart-extra-graph-card ${data.missing ? "missing" : ""} ${interactive ? "interactive-surface" : ""}" style="${escapeAttribute(panel, panel._cardVars(widget, cfg))}" ${interactive ? `data-widget-key="${escapeAttribute(panel, ref)}" role="button" tabindex="0"` : ""}>
      <div class="smart-extra-graph-head">
        <div class="entity-icon">${panel._icon(widget.icon, s.icon_size, s.icon_color || cfg.design.accent_color)}</div>
        <div class="smart-extra-graph-title">
          <div class="entity-label">${escapeAttribute(panel, widget.label || "")}</div>
          <div class="entity-value-line">
            ${widget.prefix ? `<span class="entity-prefix">${escapeAttribute(panel, widget.prefix)}</span>` : ""}
            <span class="entity-value">${escapeAttribute(panel, value)}</span>
            ${unit ? `<span class="entity-unit">${escapeAttribute(panel, unit)}</span>` : ""}
          </div>
        </div>
      </div>
      <div class="smart-sparkline-wrap" style="height:${panel._cssSize(geo.height, "120px")}">
        ${geo.path ? `<svg class="smart-sparkline" viewBox="0 0 ${geo.width} ${geo.height}" preserveAspectRatio="none" role="img" aria-label="Historial de ${escapeAttribute(panel, widget.label || widget.entity || "entidad")}">
          <path d="${geo.fillPath}" fill="${escapeAttribute(panel, rgbaFromHex(graph.fill_color || graph.line_color || cfg.design.accent_color, graph.fill_opacity))}" stroke="none"></path>
          <path d="${geo.path}" fill="none" stroke="${escapeAttribute(panel, graph.line_color || cfg.design.accent_color)}" stroke-width="${panel._num(graph.line_width, 3)}" vector-effect="non-scaling-stroke" stroke-linecap="round" stroke-linejoin="round"></path>
        </svg>` : `<div class="smart-graph-status">${escapeAttribute(panel, status)}</div>`}
        ${graph.show_min_max && geo.min !== null && geo.max !== null ? `<div class="smart-graph-scale"><span>${escapeAttribute(panel, panel._formatNumber(geo.max, widget.decimals, cfg.locale))}</span><span>${escapeAttribute(panel, panel._formatNumber(geo.min, widget.decimals, cfg.locale))}</span></div>` : ""}
      </div>
      ${data.missing && widget.entity ? `<div class="entity-id">${escapeAttribute(panel, widget.entity)}</div>` : ""}
    </section>`;
}

function renderExtraCard(panel, widget, cfg) {
  const ref = extraRef(widget.id);
  if (widget.type === "bar") return renderBarCard(panel, widget, cfg, ref);
  if (widget.type === "graph") return renderGraphCard(panel, widget, cfg, ref);
  return panel._entityCard(widget, cfg, ref);
}

function renderOrderEditor(panel, cfg) {
  const order = cfg.card_layout?.order || [];
  const rows = order.map((ref, index) => {
    const extra = findExtraCard(cfg, ref);
    const widget = extra || cfg[ref];
    const label = extra ? (extra.label || `Tarjeta adicional ${index + 1}`) : (widget?.label || BUILTIN_CARD_LABELS[ref] || ref);
    const type = extra ? cardTypeLabel(extra.type) : ref === "power" ? "Tacómetro" : "Tarjeta existente";
    const icon = widget?.icon || "mdi:card-outline";
    const color = widget?.style?.icon_color || cfg.design?.accent_color || "#35ddd5";
    return `
      <div class="item-card smart-card-order-item">
        <div class="item-head">
          <div style="display:flex;align-items:center;gap:8px;min-width:0">
            <span class="icon-preview">${panel._icon(icon, 22, color)}</span>
            <span style="min-width:0"><span class="item-name">${escapeAttribute(panel, label)}</span><span class="smart-card-order-type">${escapeAttribute(panel, type)}</span></span>
          </div>
          <div class="row-actions">
            <button class="tiny-btn" data-action="move-smart-card" data-direction="-1" data-card-ref="${escapeAttribute(panel, ref)}" ${index === 0 ? "disabled" : ""} aria-label="Subir tarjeta">↑</button>
            <button class="tiny-btn" data-action="move-smart-card" data-direction="1" data-card-ref="${escapeAttribute(panel, ref)}" ${index === order.length - 1 ? "disabled" : ""} aria-label="Bajar tarjeta">↓</button>
          </div>
        </div>
      </div>`;
  }).join("");

  return panel._section("Orden de tarjetas", `${rows}<div class="help">Solo cambia el orden dentro del bloque de tarjetas. Encabezado, avisos y navegación permanecen en su posición actual.</div>`);
}

function renderExtraCardEditor(panel, cfg, widget, index) {
  const key = `extra_cards.${index}`;
  const s = widget.style || {};
  const bar = widget.bar || {};
  const graph = widget.graph || {};
  const typeFields = widget.type === "bar"
    ? panel._section(`Barra · ${widget.label || `Tarjeta ${index + 1}`}`, `<div class="field-grid">
        ${panel._input(`${key}.bar.min`, "Mínimo", bar.min, { type: "number", step: "0.1" })}
        ${panel._input(`${key}.bar.max`, "Máximo", bar.max, { type: "number", step: "0.1" })}
        ${panel._input(`${key}.bar.height`, "Grosor de barra", bar.height, { type: "range", min: 5, max: 30, step: 1 })}
        ${panel._color(`${key}.bar.track_color`, "Fondo de barra", bar.track_color)}
        ${panel._color(`${key}.bar.fill_color`, "Color de barra", bar.fill_color)}
        ${panel._input(`${key}.bar.show_scale`, "Mostrar escala y porcentaje", bar.show_scale, { type: "checkbox", full: true })}
      </div>`)
    : widget.type === "graph"
      ? panel._section(`Gráfica · ${widget.label || `Tarjeta ${index + 1}`}`, `<div class="field-grid">
          ${panel._input(`${key}.graph.hours`, "Horas de historial", graph.hours, { type: "range", min: 1, max: 168, step: 1 })}
          ${panel._input(`${key}.graph.max_points`, "Puntos máximos", graph.max_points, { type: "range", min: 12, max: 120, step: 4 })}
          ${panel._input(`${key}.graph.height`, "Altura de gráfica", graph.height, { type: "range", min: 70, max: 220, step: 5 })}
          ${panel._input(`${key}.graph.auto_scale`, "Escala automática", graph.auto_scale, { type: "checkbox" })}
          ${panel._input(`${key}.graph.min`, "Mínimo manual", graph.min, { type: "number", step: "0.1" })}
          ${panel._input(`${key}.graph.max`, "Máximo manual", graph.max, { type: "number", step: "0.1" })}
          ${panel._color(`${key}.graph.line_color`, "Color de línea", graph.line_color)}
          ${panel._color(`${key}.graph.fill_color`, "Color de relleno", graph.fill_color)}
          ${panel._input(`${key}.graph.fill_opacity`, "Opacidad de relleno", graph.fill_opacity, { type: "range", min: 0, max: 0.6, step: 0.05 })}
          ${panel._input(`${key}.graph.line_width`, "Grosor de línea", graph.line_width, { type: "range", min: 1, max: 7, step: 1 })}
          ${panel._input(`${key}.graph.show_min_max`, "Mostrar mínimo y máximo", graph.show_min_max, { type: "checkbox" })}
        </div>`)
      : "";

  return `
    <div class="item-card smart-extra-editor-card">
      <div class="item-head">
        <div style="display:flex;align-items:center;gap:8px"><span class="icon-preview">${panel._icon(widget.icon, 22, s.icon_color || cfg.design.accent_color)}</span><span class="item-name">Tarjeta adicional ${index + 1}</span></div>
        <button class="tiny-btn" data-action="remove-extra-card" data-card-id="${escapeAttribute(panel, widget.id)}">Eliminar</button>
      </div>
      <div class="field-grid">
        ${panel._input(`${key}.show`, "Mostrar", widget.show, { type: "checkbox" })}
        ${panel._input(`${key}.type`, "Tipo", widget.type, { type: "select", options: [["value", "Valor"], ["bar", "Barra"], ["graph", "Gráfica"]] })}
        ${panel._entitySelect(`${key}.entity`, "Entidad", widget.entity, "all")}
        ${panel._input(`${key}.label`, "Título", widget.label)}
        ${panel._input(`${key}.icon`, "Icono MDI", widget.icon)}
        ${panel._input(`${key}.prefix`, "Prefijo", widget.prefix || "")}
        ${panel._input(`${key}.unit`, "Unidad (auto = entidad)", widget.unit ?? "auto")}
        ${panel._input(`${key}.decimals`, "Decimales", widget.decimals, { type: "number", min: 0, max: 6, step: 1 })}
        ${panel._input(`${key}.multiplier`, "Multiplicador", widget.multiplier, { type: "number", step: "0.001" })}
        ${panel._input(`${key}.offset`, "Offset", widget.offset, { type: "number", step: "0.001" })}
        ${panel._input(`${key}.style.height`, "Altura mínima", s.height, { type: "range", min: 70, max: 280, step: 2 })}
        ${panel._input(`${key}.style.width`, "Ancho CSS", s.width || "100%", { full: true })}
        ${panel._input(`${key}.style.padding`, "Padding", s.padding === "" ? cfg.design.card_padding : s.padding, { type: "range", min: 6, max: 36, step: 1 })}
        ${panel._input(`${key}.style.align`, "Alineación", s.align, { type: "select", options: [["left", "Izquierda"], ["center", "Centro"], ["right", "Derecha"]], full: true })}
        ${panel._color(`${key}.style.background`, "Fondo", s.background || cfg.design.card_background)}
        ${panel._color(`${key}.style.border_color`, "Color de borde", s.border_color || cfg.design.card_border_color)}
        ${panel._input(`${key}.style.border_width`, "Grosor borde", s.border_width === "" ? cfg.design.card_border_width : s.border_width, { type: "range", min: 0, max: 4, step: 1 })}
        ${panel._input(`${key}.style.border_radius`, "Radio", s.border_radius === "" ? cfg.design.card_radius : s.border_radius, { type: "range", min: 0, max: 40, step: 1 })}
        ${panel._color(`${key}.style.icon_color`, "Color icono", s.icon_color)}
        ${panel._input(`${key}.style.icon_size`, "Tamaño icono", s.icon_size, { type: "range", min: 16, max: 54, step: 1 })}
        ${panel._input(`${key}.style.icon_box_size`, "Caja de icono", s.icon_box_size, { type: "range", min: 34, max: 80, step: 1 })}
        ${panel._color(`${key}.style.label_color`, "Color etiqueta", s.label_color || cfg.design.label_color)}
        ${panel._input(`${key}.style.label_size`, "Tamaño etiqueta", s.label_size, { type: "range", min: 10, max: 26, step: 1 })}
        ${panel._color(`${key}.style.value_color`, "Color valor", s.value_color || cfg.design.value_color)}
        ${panel._input(`${key}.style.value_size`, "Tamaño valor", s.value_size, { type: "range", min: 18, max: 62, step: 1 })}
        ${panel._input(`${key}.style.value_weight`, "Peso valor", s.value_weight, { type: "range", min: 300, max: 900, step: 50 })}
        ${panel._color(`${key}.style.unit_color`, "Color unidad", s.unit_color || cfg.design.unit_color)}
        ${panel._input(`${key}.style.unit_size`, "Tamaño unidad", s.unit_size, { type: "range", min: 9, max: 28, step: 1 })}
      </div>
    </div>
    ${typeFields}
    ${panel._actionEditor(key, widget)}
  `;
}

function renderExtraCardsSection(panel, cfg) {
  const editors = (cfg.extra_cards || []).map((widget, index) => renderExtraCardEditor(panel, cfg, widget, index)).join("");
  return panel._section("Tarjetas adicionales", `${editors || '<div class="help">Todavía no hay tarjetas adicionales.</div>'}<button class="editor-btn" data-action="add-extra-card">+ Agregar tarjeta</button><div class="help">Cada tarjeta puede mostrar un valor, una barra o una gráfica de historial. Las acciones de toque y pulsación mantenida son las mismas que en las tarjetas existentes.</div>`);
}

function extraStyles() {
  return `
    .smart-extra-content{width:100%}
    .smart-progress-track{width:100%;height:var(--smart-progress-height);margin-top:13px;border-radius:999px;overflow:hidden;background:var(--smart-progress-track)}
    .smart-progress-fill{height:100%;border-radius:inherit;background:var(--smart-progress-fill);transition:width .25s ease}
    .smart-progress-scale{margin-top:6px;display:grid;grid-template-columns:1fr auto 1fr;gap:8px;color:var(--unit-color);font-size:10px;font-weight:600}.smart-progress-scale span:nth-child(2){text-align:center}.smart-progress-scale span:last-child{text-align:right}
    .smart-extra-graph-card{width:var(--w-width);min-height:var(--w-height);padding:var(--w-padding);background:var(--w-bg);border:var(--w-border-width) solid var(--w-border);border-radius:var(--w-radius);box-shadow:var(--w-shadow);overflow:hidden;text-align:var(--w-align)}
    .smart-extra-graph-head{display:flex;align-items:center;justify-content:var(--w-justify);gap:14px}.smart-extra-graph-title{min-width:0;flex:1;text-align:var(--w-align)}
    .smart-sparkline-wrap{position:relative;width:100%;margin-top:14px;min-height:70px}.smart-sparkline{display:block;width:100%;height:100%;overflow:visible}.smart-graph-status{height:100%;min-height:70px;display:grid;place-items:center;color:var(--unit-color);font-size:12px;border:1px dashed var(--w-border);border-radius:12px}
    .smart-graph-scale{position:absolute;inset:4px 4px 4px auto;display:flex;flex-direction:column;justify-content:space-between;pointer-events:none;color:var(--unit-color);font-size:9px;font-weight:650;text-shadow:0 1px 3px var(--w-bg)}
    .smart-card-order-type{display:block;margin-top:2px;color:var(--secondary-text-color,#9aa6af);font-size:10px;font-weight:500}.smart-card-order-item .tiny-btn[disabled]{opacity:.35;cursor:not-allowed}.smart-extra-editor-card{margin-top:10px}
  `;
}

function reorderRenderedCards(panel, cfg) {
  const stack = panel.shadowRoot?.querySelector?.(".stack");
  if (!stack) return;

  stack.querySelectorAll?.('[data-smart-extra-card="1"]').forEach((node) => node.remove());

  for (const widget of cfg.extra_cards || []) {
    if (!widget?.show) continue;
    const html = renderExtraCard(panel, widget, cfg);
    if (!html) continue;
    const template = document.createElement("template");
    template.innerHTML = html.trim();
    if (template.content.firstElementChild) stack.append(template.content.firstElementChild);
  }

  const byRef = new Map();
  for (const child of [...stack.children]) {
    const ref = child.getAttribute?.("data-smart-card-ref");
    if (ref) byRef.set(ref, child);
  }

  for (const ref of cfg.card_layout?.order || []) {
    const node = byRef.get(ref);
    if (node) stack.append(node);
  }
}

function installCardLayoutRuntime() {
  const PanelClass = customElements.get("smart-home-panel");
  const proto = PanelClass?.prototype;
  if (!proto) {
    console.warn("[Smart Home Cards] smart-home-panel no está disponible; extensión omitida");
    return false;
  }
  if (proto[CARD_LAYOUT_MARKER]) return true;

  const originalConfig = proto._config;
  if (typeof originalConfig === "function") {
    proto._config = function smartCardsConfig() {
      return normalizeCardsConfig(originalConfig.call(this));
    };
  }

  const originalEntityCard = proto._entityCard;
  if (typeof originalEntityCard === "function") {
    proto._entityCard = function smartCardsEntityCard(widget, cfg, key) {
      const html = originalEntityCard.call(this, widget, cfg, key);
      return addCardRefAttribute(this, html, key, String(key || "").startsWith("extra:"));
    };
  }

  const originalGauge = proto._gauge;
  if (typeof originalGauge === "function") {
    proto._gauge = function smartCardsGauge(widget, cfg, key) {
      return addCardRefAttribute(this, originalGauge.call(this, widget, cfg, key), key, false);
    };
  }

  const originalWidgetFromKey = proto._widgetFromKey;
  if (typeof originalWidgetFromKey === "function") {
    proto._widgetFromKey = function smartCardsWidgetFromKey(key) {
      if (String(key || "").startsWith("extra:")) {
        return findExtraCard(this._config(), key);
      }
      return originalWidgetFromKey.call(this, key);
    };
  }

  const originalHasDemo = proto._hasDemo;
  if (typeof originalHasDemo === "function") {
    proto._hasDemo = function smartCardsHasDemo(cfg) {
      if (originalHasDemo.call(this, cfg)) return true;
      return (cfg.extra_cards || []).some((widget) => widget?.show && cfg.demo_when_missing && !this._hass?.states?.[widget.entity] && widget.demo_value !== undefined);
    };
  }

  const originalSignature = proto._signature;
  if (typeof originalSignature === "function") {
    proto._signature = function smartCardsSignature(cfg) {
      const states = (cfg.extra_cards || []).map((widget) => [
        widget.id,
        widget.entity,
        this._hass?.states?.[widget.entity]?.state ?? null,
        this._hass?.states?.[widget.entity]?.attributes?.unit_of_measurement ?? null,
      ]);
      return JSON.stringify([
        originalSignature.call(this, cfg),
        cfg.card_layout?.order || [],
        states,
        this._smartCardHistoryRevision || 0,
      ]);
    };
  }

  const originalStyles = proto._styles;
  if (typeof originalStyles === "function") {
    proto._styles = function smartCardsStyles(cfg) {
      return `${originalStyles.call(this, cfg)}\n${extraStyles()}`;
    };
  }

  const originalEditorCards = proto._editorCards;
  if (typeof originalEditorCards === "function") {
    proto._editorCards = function smartCardsEditor(cfg) {
      return `${renderOrderEditor(this, cfg)}${originalEditorCards.call(this, cfg)}${renderExtraCardsSection(this, cfg)}`;
    };
  }

  const originalOnClick = proto._onClick;
  if (typeof originalOnClick === "function") {
    proto._onClick = async function smartCardsOnClick(ev) {
      const target = ev.target?.closest?.("[data-action]");
      const action = target?.dataset?.action;

      if (action === "add-extra-card") {
        if (!this._editConfig) return;
        const cfg = normalizeCardsConfig(this._editConfig);
        const card = extraCardDefaults();
        cfg.extra_cards.push(card);
        cfg.card_layout.order.push(extraRef(card.id));
        this._editConfig = cfg;
        this._lastSignature = "";
        this._queueRender();
        return;
      }

      if (action === "remove-extra-card") {
        if (!this._editConfig) return;
        const id = String(target.dataset.cardId || "");
        const cfg = normalizeCardsConfig(this._editConfig);
        cfg.extra_cards = cfg.extra_cards.filter((card) => card.id !== id);
        cfg.card_layout.order = cfg.card_layout.order.filter((ref) => ref !== extraRef(id));
        historyCache(this).delete(id);
        this._editConfig = cfg;
        this._lastSignature = "";
        this._queueRender();
        return;
      }

      if (action === "move-smart-card") {
        if (!this._editConfig) return;
        const ref = String(target.dataset.cardRef || "");
        const direction = Number(target.dataset.direction) < 0 ? -1 : 1;
        const cfg = normalizeCardsConfig(this._editConfig);
        const index = cfg.card_layout.order.indexOf(ref);
        const next = index + direction;
        if (index >= 0 && next >= 0 && next < cfg.card_layout.order.length) {
          [cfg.card_layout.order[index], cfg.card_layout.order[next]] = [cfg.card_layout.order[next], cfg.card_layout.order[index]];
          this._editConfig = cfg;
          this._lastSignature = "";
          this._queueRender();
        }
        return;
      }

      return originalOnClick.call(this, ev);
    };
  }

  const originalRender = proto._render;
  if (typeof originalRender === "function") {
    proto._render = function smartCardsRender(...args) {
      originalRender.apply(this, args);
      if (!this._hass || !this._panel || !this._loaded || !this.shadowRoot) return;
      try {
        reorderRenderedCards(this, this._config());
      } catch (err) {
        console.warn("[Smart Home Cards] no se pudo aplicar el orden de tarjetas", err);
      }
    };
  }

  Object.defineProperty(proto, CARD_LAYOUT_MARKER, {
    value: true,
    configurable: false,
    enumerable: false,
  });

  console.info(`[Smart Home Cards] runtime v${SMART_HOME_CARD_LAYOUT_RUNTIME_VERSION} activo`);
  return true;
}

if (!installCardLayoutRuntime() && typeof customElements?.whenDefined === "function") {
  customElements.whenDefined("smart-home-panel").then(() => installCardLayoutRuntime());
}
