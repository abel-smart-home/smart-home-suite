/**
 * Smart Home Suite · Smart Lighting responsive runtime v1.1.0
 *
 * Source chain preserved:
 *   Smart Lighting Panel V1.0.3 (unchanged)
 *   -> smart-lighting-layout.js V1.2.0 (unchanged)
 *   -> this responsive runtime V1.1.0
 *
 * Runtime v1.0.0:
 * - preserves the validated mobile layout;
 * - allows legacy 520/760 px configurations to use available tablet/desktop width;
 * - chooses device-grid columns from the panel's real available width;
 * - preserves all existing Personalización fields and .storage data;
 * - never writes/migrates configuration automatically.
 *
 * Runtime v1.1.0:
 * - mobile Global Actions remain exactly on their existing two-column layout;
 * - on tablet/desktop, Global Actions use the same configured column count as
 *   device cards and occupy the leftmost grid slots;
 * - their existing compact height and visual state logic are preserved;
 * - no new configuration fields are introduced.
 *
 * Custom max widths other than the known legacy 520/760 values are respected.
 */

import "./smart-lighting-layout.js?v=120-module130-suite180";

const SMART_LIGHTING_RESPONSIVE_RUNTIME_VERSION = "1.1.0";
const SMART_LIGHTING_EFFECTIVE_VERSION = "1.4.1";
const SMART_LIGHTING_ADAPTIVE_MAX_WIDTH = 1200;
const LEGACY_AUTO_WIDTHS = new Set([520, 760]);
const RESPONSIVE_MARKER = Symbol.for(
  "smart-home-suite-smart-lighting-responsive-v1.1.0"
);

function numericColumns(panel, value, fallback) {
  const n = typeof panel?._num === "function"
    ? panel._num(value, fallback)
    : Number(value);
  return Math.max(1, Math.round(Number.isFinite(n) ? n : fallback));
}

function configuredWidth(cfg) {
  const value = Number(cfg?.design?.panel_max_width);
  return Number.isFinite(value) ? Math.round(value) : 760;
}

function usesLegacyAutoWidth(cfg) {
  return LEGACY_AUTO_WIDTHS.has(configuredWidth(cfg));
}

function cssSize(panel, value, fallback) {
  if (typeof panel?._cssSize === "function") {
    return panel._cssSize(value, fallback);
  }
  if (value === "" || value === null || value === undefined) return fallback;
  return typeof value === "number" ? `${value}px` : String(value);
}

function responsiveStyles(panel, cfg) {
  const mobile = numericColumns(panel, cfg?.design?.columns_mobile, 2);
  const tablet = numericColumns(panel, cfg?.design?.columns_tablet, 3);
  const desktop = numericColumns(panel, cfg?.design?.columns_desktop, 4);
  const cardGap = cssSize(panel, cfg?.design?.card_gap, "10px");
  const widthRule = usesLegacyAutoWidth(cfg)
    ? `@media (min-width:560px){.page{max-width:min(${SMART_LIGHTING_ADAPTIVE_MAX_WIDTH}px,100%)}}`
    : "";

  return `
    ${widthRule}
    .page{container-type:inline-size;container-name:smart-lighting-page}

    /*
     * Fallback for browsers without container queries.
     * Mobile is intentionally not overridden: the original Global Actions
     * two-column layout remains exactly as provided by smart-lighting-layout.js.
     */
    @media (min-width:560px){
      .smart-global-actions-grid{
        grid-template-columns:repeat(${tablet},minmax(0,1fr));
        gap:${cardGap};
      }
    }
    @media (min-width:820px){
      .smart-global-actions-grid{
        grid-template-columns:repeat(${desktop},minmax(0,1fr));
        gap:${cardGap};
      }
    }

    @supports (container-type:inline-size){
      @container smart-lighting-page (max-width:559px){
        .device-grid{grid-template-columns:repeat(${mobile},minmax(0,1fr))}
      }
      @container smart-lighting-page (min-width:560px) and (max-width:819px){
        .device-grid,
        .smart-global-actions-grid{
          grid-template-columns:repeat(${tablet},minmax(0,1fr));
        }
        .smart-global-actions-grid{gap:${cardGap}}
      }
      @container smart-lighting-page (min-width:820px){
        .device-grid,
        .smart-global-actions-grid{
          grid-template-columns:repeat(${desktop},minmax(0,1fr));
        }
        .smart-global-actions-grid{gap:${cardGap}}
      }
    }
  `;
}

function installResponsiveRuntime() {
  const PanelClass = customElements.get("smart-lighting-panel");
  const proto = PanelClass?.prototype;

  if (!proto) {
    console.warn("[Smart Lighting Responsive] panel base no disponible; extensión omitida");
    return false;
  }
  if (proto[RESPONSIVE_MARKER]) return true;

  const originalStyles = proto._styles;
  if (typeof originalStyles === "function") {
    proto._styles = function smartLightingResponsiveStyles(cfg) {
      return `${originalStyles.call(this, cfg)}\n${responsiveStyles(this, cfg)}`;
    };
  }

  const originalRender = proto._render;
  if (typeof originalRender === "function") {
    proto._render = function smartLightingResponsiveRender(...args) {
      const result = originalRender.apply(this, args);
      try {
        const version = this.shadowRoot?.querySelector?.(".version");
        if (version) version.textContent = `v${SMART_LIGHTING_EFFECTIVE_VERSION}`;
      } catch (err) {
        console.warn("[Smart Lighting Responsive] no se pudo actualizar etiqueta de versión", err);
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
    `[Smart Lighting Responsive] runtime v${SMART_LIGHTING_RESPONSIVE_RUNTIME_VERSION} · módulo v${SMART_LIGHTING_EFFECTIVE_VERSION} · máximo adaptativo ${SMART_LIGHTING_ADAPTIVE_MAX_WIDTH}px`
  );
  return true;
}

if (!installResponsiveRuntime() && typeof customElements?.whenDefined === "function") {
  customElements.whenDefined("smart-lighting-panel").then(() => {
    installResponsiveRuntime();
  });
}
