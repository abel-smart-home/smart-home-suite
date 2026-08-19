/**
 * Smart Home Suite · Smart Automations alert control runtime v1.0.0
 *
 * Preserved chain:
 *   Smart Automations Panel V1.0.0
 *   -> layout runtime V1.0.0
 *   -> color-picker runtime V1.0.0
 *   -> responsive runtime V1.0.0
 *   -> this alert-control runtime V1.0.0
 *
 * Scope is intentionally limited to the two energy alert recipes:
 * - high_power
 * - energy_limit
 *
 * Adds user-configurable:
 * - 1 or 2 notifications per alert cycle;
 * - configurable delay before the second notification;
 * - optional notification schedule;
 * - events outside the schedule are discarded, never postponed;
 * - second notification is skipped if its time is outside the schedule;
 * - optional controlled rearm with configurable lower threshold/hysteresis.
 *
 * Home Assistant remains the execution engine. No helper entities are created.
 * Existing automations are never rewritten automatically; the new native recipe
 * is applied when the user opens the Smart Automation and presses Guardar.
 */

import "./smart-automations-responsive.js?v=100-responsive-module120-suite1100";

const SMART_AUTOMATIONS_ALERT_CONTROL_RUNTIME_VERSION = "1.0.0";
const SMART_AUTOMATIONS_EFFECTIVE_VERSION = "1.3.0";
const SMART_AUTOMATIONS_ALERT_RECIPE_REVISION = "energy-alert-control-1.0.0";

const ALERT_CONTROL_MARKER = Symbol.for(
  "smart-home-suite-smart-automations-alert-control-v1.0.0"
);

const ALERT_RECIPES = new Set(["high_power", "energy_limit"]);

function isAlertRecipe(recipe) {
  return ALERT_RECIPES.has(String(recipe || ""));
}

function positiveNumber(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function integerInRange(value, fallback, min, max) {
  const n = Math.round(Number(value));
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
}

function normalizeClock(value, fallback) {
  const raw = String(value || fallback || "").trim();
  const match = raw.match(/^([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/);
  if (!match) return fallback;
  return `${match[1]}:${match[2]}`;
}

function clockWithSeconds(value, fallback) {
  const normalized = normalizeClock(value, fallback);
  return `${normalized}:00`;
}

function triggerLimitFor(recipe, params) {
  if (recipe === "high_power") {
    return positiveNumber(params?.threshold_w, 6000);
  }
  return positiveNumber(params?.threshold_kwh, 500);
}

function normalizeAlertParams(recipe, params) {
  if (!isAlertRecipe(recipe) || !params || typeof params !== "object") {
    return params;
  }

  const triggerLimit = triggerLimitFor(recipe, params);

  if (![1, 2].includes(Number(params.notification_count))) {
    params.notification_count = 1;
  } else {
    params.notification_count = Number(params.notification_count);
  }

  params.second_notification_delay_minutes = integerInRange(
    params.second_notification_delay_minutes,
    30,
    1,
    1440
  );

  if (params.schedule_enabled === undefined) params.schedule_enabled = false;
  params.schedule_enabled = Boolean(params.schedule_enabled);
  params.schedule_start = normalizeClock(params.schedule_start, "07:00");
  params.schedule_end = normalizeClock(params.schedule_end, "22:00");

  if (params.rearm_enabled === undefined) params.rearm_enabled = true;
  params.rearm_enabled = Boolean(params.rearm_enabled);

  const existingRearm = Number(params.rearm_below);
  params.rearm_below =
    Number.isFinite(existingRearm) && existingRearm > 0
      ? existingRearm
      : triggerLimit;

  return params;
}

function timeCondition(params) {
  if (!params?.schedule_enabled) return null;
  return {
    condition: "time",
    after: clockWithSeconds(params.schedule_start, "07:00"),
    before: clockWithSeconds(params.schedule_end, "22:00"),
  };
}

function numericAboveCondition(entityId, above) {
  return {
    condition: "numeric_state",
    entity_id: entityId,
    above,
  };
}

function numericBelowCondition(entityId, below) {
  return {
    condition: "numeric_state",
    entity_id: entityId,
    below,
  };
}

function waitForBelow(entityId, below, timeoutMinutes = null) {
  const action = {
    wait_for_trigger: [
      {
        trigger: "numeric_state",
        entity_id: entityId,
        below,
      },
    ],
  };

  if (timeoutMinutes !== null) {
    action.timeout = { minutes: Number(timeoutMinutes) };
    action.continue_on_timeout = true;
  }
  return action;
}

function notWaitCompletedCondition() {
  return {
    condition: "template",
    value_template: "{{ not wait.completed }}",
  };
}

function currentNotBelowCondition(entityId, below) {
  return {
    condition: "not",
    conditions: [numericBelowCondition(entityId, below)],
  };
}

function buildAlertActions(
  panel,
  params,
  entityId,
  unit,
  triggerThresholdState,
  rearmThresholdState
) {
  const actions = [];
  const dynamicLine = `Valor actual: {{ states('${entityId}') }} ${unit}.`;

  // Notification 1.
  actions.push(panel._notifyAction(params, dynamicLine));

  const notificationCount = Number(params.notification_count || 1);
  const rearmEnabled = params.rearm_enabled !== false;

  if (notificationCount === 2) {
    // Race the second-notification delay against the event being rearmed.
    // If the value crosses below the configured rearm point first,
    // wait.completed becomes true and this alert cycle ends immediately.
    const cancellationBelow = rearmEnabled
      ? rearmThresholdState
      : triggerThresholdState;

    actions.push(
      waitForBelow(
        entityId,
        cancellationBelow,
        Number(params.second_notification_delay_minutes || 30)
      )
    );

    const secondConditions = [
      notWaitCompletedCondition(),
      numericAboveCondition(entityId, triggerThresholdState),
    ];
    const schedule = timeCondition(params);
    if (schedule) secondConditions.push(schedule);

    actions.push({
      choose: [
        {
          conditions: secondConditions,
          sequence: [panel._notifyAction(params, dynamicLine)],
        },
      ],
    });

    if (rearmEnabled) {
      // If the timeout expired without rearm, remain in the same mode:single
      // run until the deeper rearm threshold is actually crossed.
      // The current-value guard avoids waiting forever if the sensor happened
      // to be below the threshold before this action is reached.
      actions.push({
        choose: [
          {
            conditions: [
              notWaitCompletedCondition(),
              currentNotBelowCondition(entityId, rearmThresholdState),
            ],
            sequence: [waitForBelow(entityId, rearmThresholdState)],
          },
        ],
      });
    }

    return actions;
  }

  if (rearmEnabled) {
    actions.push({
      choose: [
        {
          conditions: [
            currentNotBelowCondition(entityId, rearmThresholdState),
          ],
          sequence: [waitForBelow(entityId, rearmThresholdState)],
        },
      ],
    });
  }

  return actions;
}

function alertControlFields(panel, ed) {
  const p = normalizeAlertParams(ed.recipe, ed.params);
  const isPower = ed.recipe === "high_power";
  const unit = isPower ? "W" : "kWh";
  const limit = triggerLimitFor(ed.recipe, p);
  const count = Number(p.notification_count || 1);

  return `
    <div class="smart-alert-control">
      <div class="settings-section-title">Control de avisos</div>

      <div class="info-box">
        ${panel._icon("mdi:bell-check-outline", 20)}
        <span>
          El horario es opcional. Si el límite se cumple <b>fuera del horario</b>,
          el evento se descarta y no se recupera después.
        </span>
      </div>

      ${panel._fieldSelect(
        "auto.notification_count",
        "Número máximo de avisos por evento",
        String(count),
        [["1", "1 aviso"], ["2", "2 avisos"]]
      )}

      ${
        count === 2
          ? panel._fieldNumber(
              "auto.second_notification_delay_minutes",
              "Segundo aviso después de",
              p.second_notification_delay_minutes,
              1,
              1440,
              1,
              "min"
            )
          : ""
      }

      <div class="smart-alert-subtitle">Horario de notificaciones</div>
      ${panel._fieldCheck(
        "auto.schedule_enabled",
        "Limitar horario de notificaciones",
        p.schedule_enabled
      )}

      ${
        p.schedule_enabled
          ? `<div class="two">
              ${panel._fieldText(
                "auto.schedule_start",
                "Desde",
                p.schedule_start,
                "time"
              )}
              ${panel._fieldText(
                "auto.schedule_end",
                "Hasta",
                p.schedule_end,
                "time"
              )}
            </div>
            <div class="help">
              Se permiten rangos que crucen medianoche, por ejemplo 22:00 → 06:00.
              Si el primer o segundo aviso cae fuera del horario, no se envía.
            </div>`
          : `<div class="help">
              Horario desactivado: funciona 24/7, como la receta original.
            </div>`
      }

      <div class="smart-alert-subtitle">Rearme</div>
      ${panel._fieldCheck(
        "auto.rearm_enabled",
        "Usar rearme controlado",
        p.rearm_enabled
      )}

      ${
        p.rearm_enabled
          ? `${panel._fieldNumber(
              "auto.rearm_below",
              "Rearmar cuando baje de",
              p.rearm_below,
              0.01,
              limit,
              isPower ? 1 : 0.01,
              unit
            )}
            <div class="help">
              Debe ser igual o menor que el límite de disparo (${limit} ${unit}).
              Un valor menor crea histéresis y evita avisos por pequeñas oscilaciones.
            </div>`
          : `<div class="help">
              Sin rearme controlado, se conserva el comportamiento nativo:
              numeric_state podrá volver a disparar después de bajar y volver a cruzar
              el límite principal.
            </div>`
      }
    </div>
  `;
}

function validateAlertParams(ed) {
  if (!isAlertRecipe(ed?.recipe)) return "";
  const p = normalizeAlertParams(ed.recipe, ed.params);

  if (![1, 2].includes(Number(p.notification_count))) {
    return "Número de avisos inválido.";
  }

  if (
    Number(p.notification_count) === 2 &&
    !(
      Number(p.second_notification_delay_minutes) >= 1 &&
      Number(p.second_notification_delay_minutes) <= 1440
    )
  ) {
    return "El segundo aviso debe esperar entre 1 y 1440 minutos.";
  }

  if (p.schedule_enabled) {
    const validTime = /^([01]\d|2[0-3]):[0-5]\d$/;
    if (!validTime.test(String(p.schedule_start || ""))) {
      return "Hora inicial inválida.";
    }
    if (!validTime.test(String(p.schedule_end || ""))) {
      return "Hora final inválida.";
    }
    if (p.schedule_start === p.schedule_end) {
      return "La hora inicial y final no pueden ser iguales. Desactiva el horario para usar 24/7.";
    }
  }

  if (p.rearm_enabled) {
    const triggerLimit = triggerLimitFor(ed.recipe, p);
    const rearm = Number(p.rearm_below);
    if (!(rearm > 0)) return "El valor de rearme debe ser mayor que cero.";
    if (rearm > triggerLimit) {
      return "El valor de rearme debe ser igual o menor que el límite de disparo.";
    }
  }

  return "";
}

function buildHighPowerNativeConfig(panel, ed) {
  const p = normalizeAlertParams(ed.recipe, ed.params);
  const unit = String(
    panel._hass?.states?.[p.power_sensor]?.attributes?.unit_of_measurement || "W"
  );
  const thresholdState =
    unit === "kW" ? Number(p.threshold_w) / 1000 : Number(p.threshold_w);
  const rearmState =
    unit === "kW" ? Number(p.rearm_below) / 1000 : Number(p.rearm_below);

  const trigger = {
    trigger: "numeric_state",
    entity_id: p.power_sensor,
    above: thresholdState,
  };
  if (Number(p.duration_minutes || 0) > 0) {
    trigger.for = { minutes: Number(p.duration_minutes) };
  }

  const conditions = [];
  const schedule = timeCondition(p);
  if (schedule) conditions.push(schedule);

  return {
    alias: p.alias,
    description:
      `${panel._marker(ed)} | ${SMART_AUTOMATIONS_ALERT_RECIPE_REVISION}`,
    triggers: [trigger],
    conditions,
    actions: buildAlertActions(
      panel,
      p,
      p.power_sensor,
      unit,
      thresholdState,
      rearmState
    ),
    mode: "single",
  };
}

function buildEnergyLimitNativeConfig(panel, ed) {
  const p = normalizeAlertParams(ed.recipe, ed.params);
  const unit = String(
    panel._hass?.states?.[p.energy_sensor]?.attributes?.unit_of_measurement ||
      "kWh"
  );
  const thresholdState =
    unit === "Wh"
      ? Number(p.threshold_kwh) * 1000
      : Number(p.threshold_kwh);
  const rearmState =
    unit === "Wh" ? Number(p.rearm_below) * 1000 : Number(p.rearm_below);

  const conditions = [];
  const schedule = timeCondition(p);
  if (schedule) conditions.push(schedule);

  return {
    alias: p.alias,
    description:
      `${panel._marker(ed)} | ${SMART_AUTOMATIONS_ALERT_RECIPE_REVISION}`,
    triggers: [
      {
        trigger: "numeric_state",
        entity_id: p.energy_sensor,
        above: thresholdState,
      },
    ],
    conditions,
    actions: buildAlertActions(
      panel,
      p,
      p.energy_sensor,
      unit,
      thresholdState,
      rearmState
    ),
    mode: "single",
  };
}

function alertDetail(panel, instance) {
  const p = normalizeAlertParams(instance.recipe, instance.params || {});
  const count = Number(p.notification_count || 1);
  const schedule = p.schedule_enabled
    ? `${p.schedule_start}–${p.schedule_end}`
    : "24/7";
  const rearm = p.rearm_enabled
    ? `rearme <${Number(p.rearm_below)} ${instance.recipe === "high_power" ? "W" : "kWh"}`
    : "rearme nativo";

  if (instance.recipe === "high_power") {
    return `>${Number(p.threshold_w || 0)} W · ${Number(
      p.duration_minutes || 0
    )} min · ${count} aviso${count === 1 ? "" : "s"} · ${schedule} · ${rearm}`;
  }

  return `${Number(p.threshold_kwh || 0)} kWh · ${count} aviso${
    count === 1 ? "" : "s"
  } · ${schedule} · ${rearm}`;
}

function extraStyles() {
  return `
    .smart-alert-control{
      margin-top:18px;
      padding-top:4px;
      border-top:1px solid rgba(255,255,255,.07);
    }
    .smart-alert-subtitle{
      margin:17px 0 8px;
      font-size:11px;
      font-weight:800;
      letter-spacing:.04em;
      text-transform:uppercase;
      color:var(--smart-auto-muted,#8e9aa4);
    }
  `;
}

function installAlertControlRuntime() {
  const PanelClass = customElements.get("smart-automations-panel");
  const proto = PanelClass?.prototype;

  if (!proto) {
    console.warn(
      "[Smart Automations Alert Control] panel base no disponible; extensión omitida"
    );
    return false;
  }
  if (proto[ALERT_CONTROL_MARKER]) return true;

  const originalRecipeFields = proto._recipeFields;
  if (typeof originalRecipeFields === "function") {
    proto._recipeFields = function smartAlertRecipeFields(ed) {
      if (isAlertRecipe(ed?.recipe)) {
        normalizeAlertParams(ed.recipe, ed.params);
      }
      const base = originalRecipeFields.call(this, ed);
      return isAlertRecipe(ed?.recipe)
        ? `${base}${alertControlFields(this, ed)}`
        : base;
    };
  }

  const originalValidateEditor = proto._validateEditor;
  if (typeof originalValidateEditor === "function") {
    proto._validateEditor = function smartAlertValidateEditor(ed) {
      if (isAlertRecipe(ed?.recipe)) {
        normalizeAlertParams(ed.recipe, ed.params);
      }
      const originalError = originalValidateEditor.call(this, ed);
      if (originalError) return originalError;
      return validateAlertParams(ed);
    };
  }

  const originalBuildNativeConfig = proto._buildNativeConfig;
  if (typeof originalBuildNativeConfig === "function") {
    proto._buildNativeConfig = function smartAlertBuildNativeConfig(ed) {
      if (ed?.recipe === "high_power") {
        return buildHighPowerNativeConfig(this, ed);
      }
      if (ed?.recipe === "energy_limit") {
        return buildEnergyLimitNativeConfig(this, ed);
      }
      return originalBuildNativeConfig.call(this, ed);
    };
  }

  const originalInstanceDetail = proto._instanceDetail;
  if (typeof originalInstanceDetail === "function") {
    proto._instanceDetail = function smartAlertInstanceDetail(instance) {
      if (isAlertRecipe(instance?.recipe)) {
        return alertDetail(this, instance);
      }
      return originalInstanceDetail.call(this, instance);
    };
  }

  const originalOnChange = proto._onChange;
  if (typeof originalOnChange === "function") {
    proto._onChange = function smartAlertOnChange(ev) {
      const bind = String(ev?.target?.dataset?.bind || "");
      const result = originalOnChange.call(this, ev);

      if (
        [
          "auto.notification_count",
          "auto.schedule_enabled",
          "auto.rearm_enabled",
        ].includes(bind)
      ) {
        this._queueRender();
      }
      return result;
    };
  }

  const originalStyles = proto._styles;
  if (typeof originalStyles === "function") {
    proto._styles = function smartAlertStyles(cfg) {
      return `${originalStyles.call(this, cfg)}\n${extraStyles()}`;
    };
  }

  const originalRender = proto._render;
  if (typeof originalRender === "function") {
    proto._render = function smartAlertRender(...args) {
      const result = originalRender.apply(this, args);
      try {
        const version = this.shadowRoot?.querySelector?.(".version");
        if (version) {
          version.textContent =
            `Smart Automations ${SMART_AUTOMATIONS_EFFECTIVE_VERSION}`;
        }
      } catch (_) {
        // Cosmetic only.
      }
      return result;
    };
  }

  Object.defineProperty(proto, ALERT_CONTROL_MARKER, {
    value: true,
    configurable: false,
    enumerable: false,
  });

  console.info(
    `[Smart Automations Alert Control] v${SMART_AUTOMATIONS_ALERT_CONTROL_RUNTIME_VERSION} · módulo v${SMART_AUTOMATIONS_EFFECTIVE_VERSION}`
  );
  return true;
}

if (
  !installAlertControlRuntime() &&
  typeof customElements?.whenDefined === "function"
) {
  customElements
    .whenDefined("smart-automations-panel")
    .then(() => installAlertControlRuntime());
}
