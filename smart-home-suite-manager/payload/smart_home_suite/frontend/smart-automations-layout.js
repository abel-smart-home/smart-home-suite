/**
 * Smart Home Suite · Smart Automations layout runtime v1.0.0
 *
 * Base frontend preserved:
 *   Smart Automations Panel V1.0.0
 *
 * Adds only UI/layout metadata:
 * - configurable category order;
 * - configurable automation order inside each category;
 * - category label/icon/colors;
 * - per-automation card title/detail/icon/colors/sizes/visibility;
 * - live preview through the existing Personalización working copy.
 *
 * Native Home Assistant automations remain owned/executed by Home Assistant.
 * Visual metadata is stored only inside smart_automations.config.
 */

import "./smart-automations-panel.js?v=100-suite160-base";

const SMART_AUTOMATIONS_LAYOUT_RUNTIME_VERSION = "1.0.0";
const SMART_AUTOMATIONS_EFFECTIVE_VERSION = "1.1.0";
const AUTOMATIONS_LAYOUT_MARKER = Symbol.for(
  "smart-home-suite-smart-automations-layout-v1.0.0"
);

const RECIPE_VISUAL_META = Object.freeze({
  lighting_sun: {
    category: "lighting",
    label: "Iluminación por sol",
    icon: "mdi:weather-sunset-up",
    color: "#ffd66b",
  },
  lights_away: {
    category: "presence",
    label: "Apagar luces al salir",
    icon: "mdi:home-export-outline",
    color: "#7cb7ff",
  },
  high_power: {
    category: "energy",
    label: "Consumo elevado",
    icon: "mdi:flash-alert-outline",
    color: "#35ddd5",
  },
  energy_limit: {
    category: "energy",
    label: "Límite de kWh",
    icon: "mdi:counter",
    color: "#77d898",
  },
});

const CATEGORY_DEFAULTS = Object.freeze({
  lighting: {
    label: "Iluminación",
    icon: "mdi:lightbulb-group",
    icon_color: "#ffd66b",
    title_color: "",
  },
  presence: {
    label: "Presencia",
    icon: "mdi:account-multiple-outline",
    icon_color: "#7cb7ff",
    title_color: "",
  },
  energy: {
    label: "Energía",
    icon: "mdi:lightning-bolt-circle",
    icon_color: "#35ddd5",
    title_color: "",
  },
});

const DEFAULT_CATEGORY_ORDER = Object.freeze(["lighting", "presence", "energy"]);

const APPEARANCE_DEFAULTS = Object.freeze({
  title: "",
  detail: "",
  icon: "",
  icon_color: "",
  title_color: "",
  detail_color: "",
  background: "",
  border_color: "",
  active_color: "",
  paused_color: "",
  missing_color: "",
  icon_size: 27,
  title_size: 14,
  detail_size: 12,
  show_detail: true,
  show_status: true,
});

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function escapeValue(panel, value) {
  return panel?._escape ? panel._escape(value) : String(value ?? "");
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function fallbackCategory(id) {
  return {
    label: id === "other" ? "Otros" : String(id || "Categoría"),
    icon: "mdi:shape-outline",
    icon_color: "#b59cff",
    title_color: "",
  };
}

function categoryForRecipe(recipe) {
  return RECIPE_VISUAL_META[String(recipe || "")]?.category || "other";
}

function categoryForInstance(instance) {
  return categoryForRecipe(instance?.recipe);
}

function recipeMeta(instance, cfg) {
  const base = RECIPE_VISUAL_META[String(instance?.recipe || "")] || {
    category: categoryForInstance(instance),
    label: instance?.recipe || "Automatización",
    icon: "mdi:robot",
    color: cfg?.design?.accent_color || "#b59cff",
  };
  return base;
}

function normalizeAppearance(raw) {
  return {
    ...clone(APPEARANCE_DEFAULTS),
    ...(isPlainObject(raw) ? raw : {}),
  };
}

function normalizeAutomationConfig(config) {
  const cfg = isPlainObject(config) ? config : {};
  cfg.instances = Array.isArray(cfg.instances)
    ? cfg.instances.map((instance) => {
        const params = isPlainObject(instance?.params) ? { ...instance.params } : {};
        params.appearance = normalizeAppearance(params.appearance);
        return { ...instance, params };
      })
    : [];

  const oldLayout = isPlainObject(cfg.automation_layout)
    ? { ...cfg.automation_layout }
    : {};
  const oldCategories = isPlainObject(oldLayout.categories)
    ? oldLayout.categories
    : {};

  const discovered = new Set(DEFAULT_CATEGORY_ORDER);
  for (const instance of cfg.instances) discovered.add(categoryForInstance(instance));
  for (const id of Object.keys(oldCategories)) discovered.add(String(id));

  const categories = {};
  for (const id of discovered) {
    const defaults = CATEGORY_DEFAULTS[id] || fallbackCategory(id);
    categories[id] = {
      ...defaults,
      ...(isPlainObject(oldCategories[id]) ? oldCategories[id] : {}),
    };
  }

  const requested = Array.isArray(oldLayout.category_order)
    ? oldLayout.category_order.map((item) => String(item))
    : [];
  const seen = new Set();
  const categoryOrder = [];
  for (const id of requested) {
    if (!discovered.has(id) || seen.has(id)) continue;
    seen.add(id);
    categoryOrder.push(id);
  }
  for (const id of discovered) {
    if (seen.has(id)) continue;
    seen.add(id);
    categoryOrder.push(id);
  }

  cfg.automation_layout = {
    ...oldLayout,
    category_order: categoryOrder,
    categories,
  };
  return cfg;
}

function categoryStyle(cfg, categoryId) {
  const defaults = CATEGORY_DEFAULTS[categoryId] || fallbackCategory(categoryId);
  return {
    ...defaults,
    ...(cfg?.automation_layout?.categories?.[categoryId] || {}),
  };
}

function appearanceFor(instance) {
  return normalizeAppearance(instance?.params?.appearance);
}

function moveButton(action, direction, attrs, disabled, label) {
  return `<button
    class="mini smart-order-btn"
    type="button"
    data-action="${action}"
    data-direction="${direction}"
    ${attrs}
    ${disabled ? "disabled" : ""}
    title="${label}"
    aria-label="${label}"
  >${direction < 0 ? "↑" : "↓"}</button>`;
}

function renderLayoutTab(panel, cfg) {
  const layout = cfg.automation_layout || {};
  const order = layout.category_order || [];
  const instances = cfg.instances || [];

  const categoryRows = order.map((categoryId, index) => {
    const style = categoryStyle(cfg, categoryId);
    const count = instances.filter(
      (instance) => categoryForInstance(instance) === categoryId
    ).length;
    const attrs = `data-category-id="${escapeValue(panel, categoryId)}"`;
    return `
      <div class="smart-order-card">
        <div class="smart-order-head">
          <div class="smart-order-copy">
            <span>${panel._icon(
              style.icon || "mdi:shape-outline",
              21,
              style.icon_color || cfg.design.accent_color
            )}</span>
            <span>
              <b>${escapeValue(panel, style.label || categoryId)}</b>
              <small>${count} automatización${count === 1 ? "" : "es"}</small>
            </span>
          </div>
          <div class="smart-order-actions">
            ${moveButton(
              "move-automation-category",
              -1,
              attrs,
              index === 0,
              "Subir categoría"
            )}
            ${moveButton(
              "move-automation-category",
              1,
              attrs,
              index === order.length - 1,
              "Bajar categoría"
            )}
          </div>
        </div>
      </div>`;
  }).join("");

  const groups = order.map((categoryId) => {
    const style = categoryStyle(cfg, categoryId);
    const peers = instances
      .map((instance, globalIndex) => ({ instance, globalIndex }))
      .filter(({ instance }) => categoryForInstance(instance) === categoryId);

    const rows = peers.map(({ instance }, localIndex) => {
      const meta = recipeMeta(instance, cfg);
      const appearance = appearanceFor(instance);
      const label =
        String(appearance.title || "").trim() ||
        instance.alias ||
        meta.label ||
        instance.recipe;
      const attrs = `data-instance-id="${escapeValue(panel, instance.id)}"`;
      const icon = appearance.icon || meta.icon || "mdi:robot";
      const color =
        appearance.icon_color || meta.color || cfg.design.accent_color;

      return `
        <div class="smart-order-card compact">
          <div class="smart-order-head">
            <div class="smart-order-copy">
              <span>${panel._icon(icon, 20, color)}</span>
              <span>
                <b>${escapeValue(panel, label)}</b>
                <small>${escapeValue(panel, meta.label || instance.recipe)}</small>
              </span>
            </div>
            <div class="smart-order-actions">
              ${moveButton(
                "move-automation-instance",
                -1,
                attrs,
                localIndex === 0,
                "Subir automatización"
              )}
              ${moveButton(
                "move-automation-instance",
                1,
                attrs,
                localIndex === peers.length - 1,
                "Bajar automatización"
              )}
            </div>
          </div>
        </div>`;
    }).join("");

    return `
      <section class="smart-settings-section">
        <div class="settings-section-title">
          ${escapeValue(panel, style.label || categoryId)}
        </div>
        <div class="smart-order-list">
          ${rows || '<div class="help">Esta categoría todavía no tiene automatizaciones.</div>'}
        </div>
      </section>`;
  }).join("");

  const categoryAppearance = order.map((categoryId) => {
    const style = categoryStyle(cfg, categoryId);
    const key = `settings.automation_layout.categories.${categoryId}`;
    return `
      <div class="smart-custom-card">
        <div class="smart-order-head">
          <div class="smart-order-copy">
            <span>${panel._icon(
              style.icon || "mdi:shape-outline",
              21,
              style.icon_color || cfg.design.accent_color
            )}</span>
            <span><b>${escapeValue(panel, style.label || categoryId)}</b><small>${escapeValue(panel, categoryId)}</small></span>
          </div>
          <button class="mini" data-action="reset-automation-category-style" data-category-id="${escapeValue(panel, categoryId)}">Restablecer</button>
        </div>
        ${panel._fieldText(`${key}.label`, "Texto de categoría", style.label)}
        ${panel._selectorField(`${key}.icon`, "Icono MDI", { icon: {} }, style.icon)}
        <div class="two">
          ${panel._fieldText(
            `${key}.icon_color`,
            "Color icono",
            style.icon_color || cfg.design.accent_color,
            "color"
          )}
          ${panel._fieldText(
            `${key}.title_color`,
            "Color texto",
            style.title_color || cfg.design.category_title_color || cfg.design.text_color,
            "color"
          )}
        </div>
      </div>`;
  }).join("");

  return `
    <div class="info-box">
      ${panel._icon("mdi:sort", 20)}
      <span><b>Orden visual solamente.</b> Mover categorías o tarjetas no modifica triggers, condiciones ni acciones de las automatizaciones nativas.</span>
    </div>

    <div class="settings-section-title">Orden de categorías</div>
    <div class="smart-order-list">${categoryRows}</div>

    <div class="settings-section-title smart-gap-top">Orden dentro de cada categoría</div>
    ${groups}

    <div class="settings-section-title smart-gap-top">Apariencia de categorías</div>
    <div class="smart-custom-list">${categoryAppearance}</div>`;
}

function renderCardsTab(panel, cfg) {
  const instances = cfg.instances || [];
  if (!instances.length) {
    return `<div class="info-box">${panel._icon("mdi:cards-outline", 20)}<span>Crea al menos una automatización para personalizar su tarjeta.</span></div>`;
  }

  const order = cfg.automation_layout?.category_order || DEFAULT_CATEGORY_ORDER;
  const blocks = order.map((categoryId) => {
    const style = categoryStyle(cfg, categoryId);
    const items = instances
      .map((instance, index) => ({ instance, index }))
      .filter(({ instance }) => categoryForInstance(instance) === categoryId);

    if (!items.length) return "";

    const editors = items.map(({ instance, index }) => {
      const meta = recipeMeta(instance, cfg);
      const appearance = appearanceFor(instance);
      const key = `settings.instances.${index}.params.appearance`;
      const shownTitle =
        String(appearance.title || "").trim() ||
        instance.alias ||
        meta.label ||
        instance.recipe;
      const icon = appearance.icon || meta.icon || "mdi:robot";
      const iconColor =
        appearance.icon_color || meta.color || cfg.design.accent_color;

      return `
        <div class="smart-custom-card">
          <div class="smart-order-head">
            <div class="smart-order-copy">
              <span>${panel._icon(icon, appearance.icon_size || 27, iconColor)}</span>
              <span>
                <b>${escapeValue(panel, shownTitle)}</b>
                <small>Nombre en HA: ${escapeValue(panel, instance.alias || instance.params?.alias || "—")}</small>
              </span>
            </div>
            <button class="mini" data-action="reset-automation-appearance" data-instance-id="${escapeValue(panel, instance.id)}">Restablecer</button>
          </div>

          ${panel._fieldText(
            `${key}.title`,
            "Título visible (vacío = nombre en HA)",
            appearance.title || ""
          )}
          ${panel._fieldText(
            `${key}.detail`,
            "Texto secundario (vacío = resumen automático)",
            appearance.detail || ""
          )}
          ${panel._selectorField(
            `${key}.icon`,
            "Icono MDI",
            { icon: {} },
            appearance.icon || meta.icon
          )}

          <div class="two">
            ${panel._fieldText(
              `${key}.icon_color`,
              "Color icono",
              appearance.icon_color || meta.color || cfg.design.accent_color,
              "color"
            )}
            ${panel._fieldText(
              `${key}.title_color`,
              "Color título",
              appearance.title_color || cfg.design.text_color,
              "color"
            )}
          </div>

          <div class="two">
            ${panel._fieldText(
              `${key}.detail_color`,
              "Color texto secundario",
              appearance.detail_color || cfg.design.muted_color,
              "color"
            )}
            ${panel._fieldText(
              `${key}.background`,
              "Fondo tarjeta",
              appearance.background || cfg.design.card_background,
              "color"
            )}
          </div>

          <div class="two">
            ${panel._fieldText(
              `${key}.border_color`,
              "Color borde",
              appearance.border_color || cfg.design.card_border,
              "color"
            )}
            ${panel._fieldText(
              `${key}.active_color`,
              "Estado activo",
              appearance.active_color || "#77d898",
              "color"
            )}
          </div>

          <div class="two">
            ${panel._fieldText(
              `${key}.paused_color`,
              "Estado pausado",
              appearance.paused_color || cfg.design.muted_color,
              "color"
            )}
            ${panel._fieldText(
              `${key}.missing_color`,
              "Estado no disponible",
              appearance.missing_color || cfg.design.unavailable_color,
              "color"
            )}
          </div>

          <div class="three">
            ${panel._fieldNumber(
              `${key}.icon_size`,
              "Tamaño icono",
              appearance.icon_size,
              16,
              50,
              1,
              "px"
            )}
            ${panel._fieldNumber(
              `${key}.title_size`,
              "Tamaño título",
              appearance.title_size,
              10,
              30,
              1,
              "px"
            )}
            ${panel._fieldNumber(
              `${key}.detail_size`,
              "Tamaño detalle",
              appearance.detail_size,
              9,
              24,
              1,
              "px"
            )}
          </div>

          <div class="two">
            ${panel._fieldCheck(
              `${key}.show_detail`,
              "Mostrar texto secundario",
              appearance.show_detail !== false
            )}
            ${panel._fieldCheck(
              `${key}.show_status`,
              "Mostrar estado",
              appearance.show_status !== false
            )}
          </div>
        </div>`;
    }).join("");

    return `
      <section class="smart-settings-section">
        <div class="settings-section-title">${escapeValue(panel, style.label || categoryId)}</div>
        <div class="smart-custom-list">${editors}</div>
      </section>`;
  }).filter(Boolean).join("");

  return `
    <div class="info-box">
      ${panel._icon("mdi:palette-outline", 20)}
      <span><b>Personalización segura.</b> Estos campos viven en <code>smart_automations.config</code> y no escriben la automatización nativa de Home Assistant. La vista del panel se actualiza en tiempo real; Guardar persiste y Cancelar revierte.</span>
    </div>
    ${blocks}`;
}

function renderDiagnostics(panel, cfg) {
  const instances = cfg.instances || [];
  const external = instances.filter(
    (instance) => panel._externalByInstance?.[instance.id]
  ).length;
  const missing = instances.filter(
    (instance) =>
      !panel._automationState(instance) ||
      panel._missingByInstance?.[instance.id]
  ).length;

  return `<div class="diag">
    <div><span>Panel efectivo</span><b>${SMART_AUTOMATIONS_EFFECTIVE_VERSION}</b></div>
    <div><span>Base frontend</span><b>1.0.0</b></div>
    <div><span>Layout runtime</span><b>${SMART_AUTOMATIONS_LAYOUT_RUNTIME_VERSION}</b></div>
    <div><span>Suite</span><b>${escapeValue(panel, panel._panel?.config?.suite_version || "—")}</b></div>
    <div><span>Instancias administradas</span><b>${instances.length}</b></div>
    <div><span>Modificadas en HA</span><b>${external}</b></div>
    <div><span>No encontradas</span><b>${missing}</b></div>
    <div><span>Backend</span><b>${panel._backendOk ? "OK" : "ERROR"}</b></div>
  </div>
  <div class="help">El diagnóstico central de Smart Home Suite también reporta si el módulo está habilitado, cargado y con su panel registrado.</div>`;
}

function moveCategory(panel, target) {
  if (!panel?._editSettings) return false;
  const cfg = normalizeAutomationConfig(panel._editSettings);
  panel._editSettings = cfg;

  const id = String(target?.dataset?.categoryId || "");
  const order = cfg.automation_layout.category_order;
  const index = order.indexOf(id);
  const direction = Number(target?.dataset?.direction) < 0 ? -1 : 1;
  const next = index + direction;

  if (index < 0 || next < 0 || next >= order.length) return false;
  [order[index], order[next]] = [order[next], order[index]];
  return true;
}

function moveInstance(panel, target) {
  if (!panel?._editSettings) return false;
  const cfg = normalizeAutomationConfig(panel._editSettings);
  panel._editSettings = cfg;

  const id = String(target?.dataset?.instanceId || "");
  const index = cfg.instances.findIndex(
    (instance) => String(instance?.id || "") === id
  );
  if (index < 0) return false;

  const categoryId = categoryForInstance(cfg.instances[index]);
  const peers = cfg.instances
    .map((instance, globalIndex) => ({
      globalIndex,
      categoryId: categoryForInstance(instance),
    }))
    .filter((item) => item.categoryId === categoryId)
    .map((item) => item.globalIndex);

  const localIndex = peers.indexOf(index);
  const direction = Number(target?.dataset?.direction) < 0 ? -1 : 1;
  const nextLocal = localIndex + direction;
  if (localIndex < 0 || nextLocal < 0 || nextLocal >= peers.length) return false;

  const other = peers[nextLocal];
  [cfg.instances[index], cfg.instances[other]] = [
    cfg.instances[other],
    cfg.instances[index],
  ];
  return true;
}

function resetInstanceAppearance(panel, instanceId) {
  if (!panel?._editSettings) return false;
  const cfg = normalizeAutomationConfig(panel._editSettings);
  panel._editSettings = cfg;

  const instance = cfg.instances.find(
    (item) => String(item?.id || "") === String(instanceId || "")
  );
  if (!instance) return false;
  instance.params ||= {};
  instance.params.appearance = clone(APPEARANCE_DEFAULTS);
  return true;
}

function resetCategoryStyle(panel, categoryId) {
  if (!panel?._editSettings) return false;
  const cfg = normalizeAutomationConfig(panel._editSettings);
  panel._editSettings = cfg;
  const id = String(categoryId || "");
  if (!cfg.automation_layout.categories[id]) return false;
  cfg.automation_layout.categories[id] = {
    ...(CATEGORY_DEFAULTS[id] || fallbackCategory(id)),
  };
  return true;
}

function extraStyles() {
  return `
    .smart-order-list,.smart-custom-list{display:grid;gap:9px}
    .smart-order-card,.smart-custom-card{border:1px solid var(--smart-auto-border,#26323a);background:rgba(255,255,255,.018);border-radius:14px;padding:11px}
    .smart-order-card.compact{padding:9px 10px}
    .smart-order-head{display:flex;align-items:center;justify-content:space-between;gap:9px}
    .smart-order-copy{display:flex;align-items:center;gap:9px;min-width:0}
    .smart-order-copy>span:last-child{min-width:0}
    .smart-order-copy b{display:block;font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .smart-order-copy small{display:block;margin-top:2px;font-size:10px;color:var(--smart-auto-muted,#8e9aa4);overflow-wrap:anywhere}
    .smart-order-actions{display:flex;gap:5px;flex:none}
    .smart-order-btn[disabled]{opacity:.32;cursor:not-allowed}
    .smart-gap-top{margin-top:20px!important}
    .smart-settings-section{margin-top:16px}
    .smart-custom-card>.field:first-of-type{margin-top:13px}
    .smart-custom-card .check{margin-bottom:0}
  `;
}

function installAutomationsLayoutRuntime() {
  const PanelClass = customElements.get("smart-automations-panel");
  const proto = PanelClass?.prototype;

  if (!proto) {
    console.warn(
      "[Smart Automations Layout] smart-automations-panel no está disponible; extensión omitida"
    );
    return false;
  }
  if (proto[AUTOMATIONS_LAYOUT_MARKER]) return true;

  const originalConfig = proto._config;
  if (typeof originalConfig === "function") {
    proto._config = function smartAutomationsLayoutConfig() {
      return normalizeAutomationConfig(originalConfig.call(this));
    };
  }

  const originalCategories = proto._categories;
  proto._categories = function smartAutomationsCategories(cfg) {
    try {
      const normalized = normalizeAutomationConfig(cfg);
      const layout = normalized.automation_layout;
      const html = [];

      for (const categoryId of layout.category_order) {
        const instances = normalized.instances.filter(
          (instance) => categoryForInstance(instance) === categoryId
        );
        if (!instances.length) continue;

        const style = categoryStyle(normalized, categoryId);
        const iconColor =
          style.icon_color || normalized.design.accent_color;
        const titleColor =
          style.title_color ||
          normalized.design.category_title_color ||
          normalized.design.text_color;

        html.push(`
          <section class="category">
            <div class="category-head" style="color:${escapeValue(this, titleColor)}">
              ${this._icon(
                style.icon || "mdi:shape-outline",
                23,
                iconColor
              )}
              <span>${escapeValue(this, style.label || categoryId)}</span>
              <span class="pill">${instances.length}</span>
            </div>
            <div class="cards">${instances
              .map((instance) => this._card(instance, normalized))
              .join("")}</div>
          </section>`);
      }

      if (!html.length) {
        return `<section class="empty">
          <div class="empty-icon">${this._icon(
            "mdi:robot-outline",
            42,
            normalized.design.muted_color
          )}</div>
          <div class="empty-title">Todavía no hay automatizaciones Smart</div>
          <div class="empty-copy">Un administrador puede crear una desde las recetas disponibles. Las automatizaciones se guardan como automatizaciones nativas de Home Assistant.</div>
          ${
            this._hass?.user?.is_admin
              ? '<button class="btn primary" data-action="add-automation">Crear primera automatización</button>'
              : ""
          }
        </section>`;
      }

      return html.join("");
    } catch (err) {
      console.warn(
        "[Smart Automations Layout] no se pudo aplicar categorías personalizadas",
        err
      );
      return typeof originalCategories === "function"
        ? originalCategories.call(this, cfg)
        : "";
    }
  };

  const originalCard = proto._card;
  proto._card = function smartAutomationsCard(instance, cfg) {
    try {
      const meta = recipeMeta(instance, cfg);
      const appearance = appearanceFor(instance);
      const state = this._automationState(instance);
      const missing =
        !state || Boolean(this._missingByInstance?.[instance.id]);
      const external = Boolean(this._externalByInstance?.[instance.id]);
      const on = state?.state === "on";
      const status = missing ? "No encontrada" : on ? "Activa" : "Pausada";

      const displayTitle =
        String(appearance.title || "").trim() ||
        instance.alias ||
        meta.label ||
        instance.recipe;
      const displayDetail =
        String(appearance.detail || "").trim() ||
        this._instanceDetail(instance);

      const icon = appearance.icon || meta.icon || "mdi:robot";
      const iconColor =
        appearance.icon_color || meta.color || cfg.design.accent_color;
      const titleColor =
        appearance.title_color || cfg.design.text_color;
      const detailColor =
        appearance.detail_color || cfg.design.muted_color;
      const background =
        appearance.background || cfg.design.card_background;
      const missingColor =
        appearance.missing_color || cfg.design.unavailable_color || "#ef6461";
      const borderColor = missing
        ? missingColor
        : appearance.border_color || cfg.design.card_border;
      const statusColor = missing
        ? missingColor
        : on
          ? appearance.active_color || "#77d898"
          : appearance.paused_color || cfg.design.muted_color;
      const iconSize = Math.max(
        16,
        Math.min(50, Number(appearance.icon_size || 27))
      );
      const titleSize = Math.max(
        10,
        Math.min(30, Number(appearance.title_size || 14))
      );
      const detailSize = Math.max(
        9,
        Math.min(24, Number(appearance.detail_size || 12))
      );

      return `<article
        class="card ${missing ? "missing" : ""}"
        style="background:${escapeValue(this, background)};border-color:${escapeValue(this, borderColor)}"
      >
        <div class="card-top">
          <div
            class="recipe-icon"
            style="background:color-mix(in srgb, ${escapeValue(this, iconColor)} 12%, transparent)"
          >${this._icon(icon, iconSize, iconColor)}</div>
          <div class="card-copy">
            <div
              class="card-title"
              style="color:${escapeValue(this, titleColor)};font-size:${titleSize}px"
            >${escapeValue(this, displayTitle)}</div>
            ${
              appearance.show_detail !== false
                ? `<div class="card-detail" style="color:${escapeValue(this, detailColor)};font-size:${detailSize}px">${escapeValue(this, displayDetail)}</div>`
                : ""
            }
          </div>
          <button
            class="toggle ${on ? "on" : ""}"
            data-action="toggle-automation"
            data-instance-id="${escapeValue(this, instance.id)}"
            ${missing ? "disabled" : ""}
            aria-label="${escapeValue(this, status)}"
          ><span></span></button>
        </div>
        <div class="card-bottom">
          ${
            appearance.show_status !== false
              ? `<div class="status" style="color:${escapeValue(this, statusColor)}"><span class="dot"></span>${escapeValue(this, status)}${external ? " · Modificada en HA" : ""}</div>`
              : "<span></span>"
          }
          <div class="card-actions">
            ${
              this._hass?.user?.is_admin
                ? `<button class="mini" data-action="edit-instance" data-instance-id="${escapeValue(this, instance.id)}">Editar</button><button class="mini" data-action="open-native" data-instance-id="${escapeValue(this, instance.id)}">HA</button>`
                : ""
            }
          </div>
        </div>
      </article>`;
    } catch (err) {
      console.warn(
        "[Smart Automations Layout] no se pudo aplicar apariencia de tarjeta",
        err
      );
      return typeof originalCard === "function"
        ? originalCard.call(this, instance, cfg)
        : "";
    }
  };

  const originalSettingsBody = proto._settingsBody;
  if (typeof originalSettingsBody === "function") {
    proto._settingsBody = function smartAutomationsSettingsBody(cfg) {
      if (this._settingsTab === "layout") {
        return renderLayoutTab(this, normalizeAutomationConfig(cfg));
      }
      if (this._settingsTab === "cards") {
        return renderCardsTab(this, normalizeAutomationConfig(cfg));
      }
      if (this._settingsTab === "diagnostics") {
        return renderDiagnostics(this, normalizeAutomationConfig(cfg));
      }

      const html = originalSettingsBody.call(this, cfg);
      if (this._settingsTab === "data") {
        return String(html).replace(
          "sólo restablece apariencia/navegación",
          "restablece apariencia global, navegación y orden/estilo de categorías; conserva las automatizaciones administradas y la apariencia individual de sus tarjetas"
        );
      }
      return html;
    };
  }

  const originalSettingsHtml = proto._settingsHtml;
  if (typeof originalSettingsHtml === "function") {
    proto._settingsHtml = function smartAutomationsSettingsHtml(...args) {
      const html = String(originalSettingsHtml.apply(this, args));
      if (html.includes('data-tab="layout"')) return html;

      const extraTabs = `
        <button class="tab ${
          this._settingsTab === "layout" ? "active" : ""
        }" data-action="settings-tab" data-tab="layout">Orden</button>
        <button class="tab ${
          this._settingsTab === "cards" ? "active" : ""
        }" data-action="settings-tab" data-tab="cards">Tarjetas</button>`;

      const navigationTab =
        /(<button class="tab[^"]*" data-action="settings-tab" data-tab="navigation">Navegación<\/button>)/;
      if (navigationTab.test(html)) {
        return html.replace(navigationTab, `$1${extraTabs}`);
      }
      return html.replace(
        '<div class="drawer-body">',
        `${extraTabs}<div class="drawer-body">`
      );
    };
  }

  const originalOnClick = proto._onClick;
  if (typeof originalOnClick === "function") {
    proto._onClick = async function smartAutomationsLayoutClick(ev) {
      const target = ev?.target?.closest?.("[data-action]");
      const action = target?.dataset?.action;

      if (action === "move-automation-category") {
        if (moveCategory(this, target)) this._queueRender();
        return;
      }

      if (action === "move-automation-instance") {
        if (moveInstance(this, target)) this._queueRender();
        return;
      }

      if (action === "reset-automation-appearance") {
        if (resetInstanceAppearance(this, target.dataset.instanceId)) {
          this._queueRender();
        }
        return;
      }

      if (action === "reset-automation-category-style") {
        if (resetCategoryStyle(this, target.dataset.categoryId)) {
          this._queueRender();
        }
        return;
      }

      return originalOnClick.call(this, ev);
    };
  }

  const originalStyles = proto._styles;
  if (typeof originalStyles === "function") {
    proto._styles = function smartAutomationsLayoutStyles(cfg) {
      const baseStyles = originalStyles.call(this, cfg);
      const d = cfg?.design || {};
      return `${baseStyles}
        :host{
          --smart-auto-border:${d.card_border || "#26323a"};
          --smart-auto-muted:${d.muted_color || "#8e9aa4"};
        }
        ${extraStyles()}`;
    };
  }

  const originalRender = proto._render;
  if (typeof originalRender === "function") {
    proto._render = function smartAutomationsLayoutRender(...args) {
      const result = originalRender.apply(this, args);
      try {
        const version = this.shadowRoot?.querySelector?.(".version");
        if (version) {
          version.textContent = `Smart Automations ${SMART_AUTOMATIONS_EFFECTIVE_VERSION}`;
        }
      } catch (_) {
        // Version label is cosmetic; fail open.
      }
      return result;
    };
  }

  Object.defineProperty(proto, AUTOMATIONS_LAYOUT_MARKER, {
    value: true,
    configurable: false,
    enumerable: false,
  });

  console.info(
    `[Smart Automations Layout] runtime v${SMART_AUTOMATIONS_LAYOUT_RUNTIME_VERSION} · módulo v${SMART_AUTOMATIONS_EFFECTIVE_VERSION} activo`
  );
  return true;
}

if (
  !installAutomationsLayoutRuntime() &&
  typeof customElements?.whenDefined === "function"
) {
  customElements
    .whenDefined("smart-automations-panel")
    .then(() => installAutomationsLayoutRuntime());
}
