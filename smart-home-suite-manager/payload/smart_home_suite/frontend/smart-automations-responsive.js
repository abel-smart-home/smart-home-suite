/**
 * Smart Home Suite · Smart Automations responsive runtime v1.0.0
 *
 * Preserved chain:
 *   Smart Automations Panel V1.0.0
 *   -> smart-automations-layout.js V1.0.0
 *   -> smart-automations-runtime.js V1.0.0 (Color Picker Guard V1.0.0)
 *   -> this responsive runtime V1.0.0
 *
 * Scope:
 * - legacy panel_max_width=520 can grow on tablet/desktop up to 1000px;
 * - existing columns_mobile / columns_tablet / columns_desktop are respected;
 * - card columns react to the real available panel width via container queries;
 * - summary remains full width because it stays outside the cards grid;
 * - cards occupy the leftmost grid cells naturally;
 * - custom panel_max_width values other than 520 are respected;
 * - no configuration, REST API, WebSocket or .storage writes are performed.
 */

import "./smart-automations-runtime.js?v=100-layout100-color100-module111-suite191";

const SMART_AUTOMATIONS_RESPONSIVE_RUNTIME_VERSION = "1.0.0";
const SMART_AUTOMATIONS_EFFECTIVE_VERSION = "1.2.0";
const SMART_AUTOMATIONS_ADAPTIVE_MAX_WIDTH = 1000;
const LEGACY_AUTO_WIDTHS = new Set([520]);

const RESPONSIVE_MARKER = Symbol.for(
  "smart-home-suite-smart-automations-responsive-v1.0.0"
);

function numericColumns(panel, value, fallback) {
  const n = Number(value);
  return Math.max(1, Math.round(Number.isFinite(n) ? n : fallback));
}

function configuredWidth(cfg) {
  const value = Number(cfg?.design?.panel_max_width);
  return Number.isFinite(value) ? Math.round(value) : 520;
}

function usesLegacyAutoWidth(cfg) {
  return LEGACY_AUTO_WIDTHS.has(configuredWidth(cfg));
}

function responsiveStyles(panel, cfg) {
  const mobile = numericColumns(panel, cfg?.design?.columns_mobile, 1);
  const tablet = numericColumns(panel, cfg?.design?.columns_tablet, 2);
  const desktop = numericColumns(panel, cfg?.design?.columns_desktop, 2);

  const widthRule = usesLegacyAutoWidth(cfg)
    ? `@media (min-width:560px){.page{max-width:min(${SMART_AUTOMATIONS_ADAPTIVE_MAX_WIDTH}px,100%)}}`
    : "";

  return `
    ${widthRule}

    .page{
      container-type:inline-size;
      container-name:smart-automations-page;
    }

    /* Summary is deliberately outside the card grid and remains full width. */
    .summary{
      width:100%;
    }

    /* Explicitly keep the visual flow anchored to the left. */
    .cards{
      justify-content:start;
    }

    /*
     * The base frontend media queries remain intact as fallback.
     * Container queries override only the card grid when supported.
     */
    @supports (container-type:inline-size){
      @container smart-automations-page (max-width:559px){
        .cards{
          grid-template-columns:repeat(${mobile},minmax(0,1fr));
        }
      }

      @container smart-automations-page (min-width:560px) and (max-width:819px){
        .cards{
          grid-template-columns:repeat(${tablet},minmax(0,1fr));
        }
      }

      @container smart-automations-page (min-width:820px){
        .cards{
          grid-template-columns:repeat(${desktop},minmax(0,1fr));
        }
      }
    }
  `;
}

function installResponsiveRuntime() {
  const PanelClass = customElements.get("smart-automations-panel");
  const proto = PanelClass?.prototype;

  if (!proto) {
    console.warn(
      "[Smart Automations Responsive] smart-automations-panel no está disponible; extensión omitida"
    );
    return false;
  }

  if (proto[RESPONSIVE_MARKER]) return true;

  const originalStyles = proto._styles;
  if (typeof originalStyles === "function") {
    proto._styles = function smartAutomationsResponsiveStyles(cfg) {
      return `${originalStyles.call(this, cfg)}\n${responsiveStyles(this, cfg)}`;
    };
  }

  const originalRender = proto._render;
  if (typeof originalRender === "function") {
    proto._render = function smartAutomationsResponsiveRender(...args) {
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

  Object.defineProperty(proto, RESPONSIVE_MARKER, {
    value: true,
    configurable: false,
    enumerable: false,
  });

  console.info(
    `[Smart Automations Responsive] v${SMART_AUTOMATIONS_RESPONSIVE_RUNTIME_VERSION} · módulo v${SMART_AUTOMATIONS_EFFECTIVE_VERSION} · máximo adaptativo ${SMART_AUTOMATIONS_ADAPTIVE_MAX_WIDTH}px`
  );

  return true;
}

if (
  !installResponsiveRuntime() &&
  typeof customElements?.whenDefined === "function"
) {
  customElements
    .whenDefined("smart-automations-panel")
    .then(() => installResponsiveRuntime());
}
