/**
 * Smart Home Suite runtime guard v1.0.0
 *
 * Smart Home Panel V2.0.5 is intentionally kept byte-for-byte unchanged.
 * This tiny module loads that exact panel and guards its `narrow` setter so
 * assigning the same mobile/desktop state does not trigger a redundant render.
 *
 * Why this exists:
 * - Smart Home is hosted by smart-home-dashboard-card.
 * - The bridge synchronizes `hass` frequently as entity states change.
 * - Its sync path also writes panel.narrow on each update.
 * - Smart Home Panel V2.0.5 queues a full render every time narrow is assigned.
 * - The MDI selector added by the bridge is an overlay appended to the panel's
 *   shadowRoot, so a redundant full render removes that open dialog.
 *
 * Other panels keep icon-picker state inside their own render model and do not
 * hit this bridge-specific repeated narrow assignment. The guard below fixes the
 * cause without altering the validated Smart Home Panel or bridge source files.
 */

import "./smart-home-panel.js?v=205-suite050";

const SMART_HOME_RUNTIME_GUARD_VERSION = "1.0.0";
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

      // This is the actual hotfix: do not call the original setter when the
      // effective layout state has not changed. The original setter queues a
      // complete panel render, which used to destroy the open MDI dialog.
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
    `[Smart Home Runtime] guard v${SMART_HOME_RUNTIME_GUARD_VERSION} activo`,
  );
  return true;
}

installNarrowRenderGuard();
