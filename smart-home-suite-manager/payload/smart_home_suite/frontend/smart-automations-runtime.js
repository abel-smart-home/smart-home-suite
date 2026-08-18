/**
 * Smart Home Suite · Smart Automations runtime v1.0.0
 *
 * Loads the validated Smart Automations layout runtime V1.0.0 and adds a
 * color-picker guard. Native <input type="color"> controls emit many "input"
 * events while their OS/browser picker is open. Smart Automations Panel V1.0.0
 * normally rerenders Personalización on every settings input, which destroys
 * the active color input and closes the native picker prematurely.
 *
 * This guard updates only the Personalización working copy during color
 * "input" events and intentionally waits for the normal "change" event before
 * allowing the full panel rerender. Guardar/Cancelar semantics are unchanged.
 */

import "./smart-automations-layout.js?v=100-module110-suite170";

const SMART_AUTOMATIONS_RUNTIME_VERSION = "1.0.0";
const SMART_AUTOMATIONS_COLOR_PICKER_GUARD_VERSION = "1.0.0";
const SMART_AUTOMATIONS_EFFECTIVE_VERSION = "1.1.1";

const COLOR_PICKER_GUARD_MARKER = Symbol.for(
  "smart-home-suite-smart-automations-color-picker-guard-v1.0.0"
);

function installColorPickerGuard() {
  const PanelClass = customElements.get("smart-automations-panel");
  const proto = PanelClass?.prototype;

  if (!proto) {
    console.warn(
      "[Smart Automations Runtime] smart-automations-panel no está disponible; guard omitido"
    );
    return false;
  }
  if (proto[COLOR_PICKER_GUARD_MARKER]) return true;

  const originalOnInput = proto._onInput;
  if (typeof originalOnInput === "function") {
    proto._onInput = function smartAutomationsColorSafeInput(ev) {
      const target = ev?.target;
      const bind = target?.dataset?.bind;

      if (
        target?.type === "color" &&
        bind?.startsWith("settings.") &&
        this._editSettings &&
        typeof this._setSettingsPath === "function"
      ) {
        // Keep the picker alive: mutate only the temporary working copy.
        // The existing _onChange handler will call _setBoundValue(), queue the
        // normal preview render and keep Guardar/Cancelar behavior unchanged.
        this._setSettingsPath(
          this._editSettings,
          bind.slice("settings.".length),
          target.value
        );
        return;
      }

      return originalOnInput.call(this, ev);
    };
  }

  const originalRender = proto._render;
  if (typeof originalRender === "function") {
    proto._render = function smartAutomationsRuntimeRender(...args) {
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

  Object.defineProperty(proto, COLOR_PICKER_GUARD_MARKER, {
    value: true,
    configurable: false,
    enumerable: false,
  });

  console.info(
    `[Smart Automations Runtime] v${SMART_AUTOMATIONS_RUNTIME_VERSION} · color picker guard v${SMART_AUTOMATIONS_COLOR_PICKER_GUARD_VERSION} · módulo v${SMART_AUTOMATIONS_EFFECTIVE_VERSION}`
  );
  return true;
}

if (
  !installColorPickerGuard() &&
  typeof customElements?.whenDefined === "function"
) {
  customElements
    .whenDefined("smart-automations-panel")
    .then(() => installColorPickerGuard());
}
