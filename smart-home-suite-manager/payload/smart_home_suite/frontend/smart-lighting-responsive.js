/**
 * Smart Home Suite · Smart Lighting responsive runtime v1.0.0
 *
 * Source chain preserved:
 *   Smart Lighting Panel V1.0.3 (unchanged)
 *   -> smart-lighting-layout.js V1.2.0 (unchanged)
 *   -> this responsive runtime V1.0.0
 *
 * Goals:
 * - preserve the validated mobile layout;
 * - allow legacy 520/760 px configurations to use available tablet/desktop width;
 * - choose device-grid columns from the panel's real available width;
 * - preserve all existing Personalización fields and .storage data;
 * - never write/migrate configuration automatically.
 *
 * Custom max widths other than the known legacy 520/760 values are respected.
 */

import "./smart-lighting-layout.js?v=120-module130-suite180";

const SMART_LIGHTING_RESPONSIVE_RUNTIME_VERSION = "1.0.0";
const SMART_LIGHTING_EFFECTIVE_VERSION = "1.4.0";
const SMART_LIGHTING_ADAPTIVE_MAX_WIDTH = 1200;
const LEGACY_AUTO_WIDTHS = new Set([520, 760]);
const RESPONSIVE_MARKER = Symbol.for(
  "smart-home-suite-smart-lighting-responsive-v1.0.0"
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

function responsiveStyles(panel, cfg) {
  const mobile = numericColumns(panel, cfg?.design?.columns_mobile, 2);
  const tablet = numericColumns(panel, cfg?.design?.columns_tablet, 3);
  const desktop = numericColumns(panel, cfg?.design?.columns_desktop, 4);
  const widthRule = usesLegacyAutoWidth(cfg)
    ? `@media (min-width:560px){.page{max-width:min(${SMART_LIGHTING_ADAPTIVE_MAX_WIDTH}px,100%)}}`
    : "";

  return `
    ${widthRule}
    .page{container-type:inline-size;container-name:smart-lighting-page}
    @supports (container-type:inline-size){
      @container smart-lighting-page (max-width:559px){
        .device-grid{grid-template-columns:repeat(${mobile},minmax(0,1fr))}
      }
      @container smart-lighting-page (min-width:560px) and (max-width:819px){
        .device-grid{grid-template-columns:repeat(${tablet},minmax(0,1fr))}
      }
      @container smart-lighting-page (min-width:820px){
        .device-grid{grid-template-columns:repeat(${desktop},minmax(0,1fr))}
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
