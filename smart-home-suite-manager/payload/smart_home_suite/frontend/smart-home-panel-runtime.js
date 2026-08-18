/**
 * Smart Home Suite runtime v1.1.0
 *
 * Smart Home Panel V2.0.5 remains byte-for-byte unchanged. This runtime loads
 * that validated panel, installs the existing narrow-render guard, and loads the
 * Suite card-layout extension that adds configurable/reorderable cards without
 * replacing the base panel source.
 */

import "./smart-home-panel.js?v=205-suite050";
import "./smart-home-card-layout.js?v=100-module140";

const SMART_HOME_RUNTIME_GUARD_VERSION = "1.0.0";
const SMART_HOME_RUNTIME_VERSION = "1.1.0";
const GUARD_MARKER = Symbol.for("smart-home-suite-narrow-render-guard-v1.0.0");

function installNarrowRenderGuard() {
  const PanelClass = customElements.get("smart-home-panel");
  const proto = PanelClass?.prototype;
  if (!proto) {
    console.warn("[Smart Home Runtime] smart-home-panel no está disponible; guard omitido");
    return false;
  }

  if (proto[GUARD_MARKER]) return true;

  const descriptor = Object.getOwnPropertyDescriptor(proto, "narrow");
  if (!descriptor?.set) {
    console.warn("[Smart Home Runtime] no se encontró el setter narrow; guard omitido");
    return false;
  }

  Object.defineProperty(proto, "narrow", {
    ...descriptor,
    set(value) {
      const next = Boolean(value);
      const current = descriptor.get
        ? Boolean(descriptor.get.call(this))
        : Boolean(this._narrow);

      // Preserve the existing MDI-picker stability fix: assigning the same
      // effective layout state must not trigger a full Smart Home render.
      if (current === next) return;
      descriptor.set.call(this, next);
    },
  });

  Object.defineProperty(proto, GUARD_MARKER, {
    value: true,
    configurable: false,
    enumerable: false,
  });

  console.info(
    `[Smart Home Runtime] runtime v${SMART_HOME_RUNTIME_VERSION} · guard v${SMART_HOME_RUNTIME_GUARD_VERSION} activo`,
  );
  return true;
}

installNarrowRenderGuard();
