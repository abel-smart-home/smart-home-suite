/**
 * Smart Home Suite · Smart Energy Advanced responsive runtime v1.1.0
 *
 * Preserved chain:
 *   Smart Energy Advanced Panel V1.3.1
 *   -> smart-energy-advanced-layout.js V1.0.0
 *   -> this responsive runtime V1.1.0
 *
 * Second-test scope:
 * - mobile remains exactly on the validated 2-column behavior;
 * - legacy panel_max_width=520 is capped at 780px in tablet widths;
 * - desktop keeps the validated V1.0.0 4-column behavior up to 1000px;
 * - existing span-1 / span-2 semantics are unchanged;
 * - on desktop span-2 occupies 2 of 4 columns;
 * - hero cards always remain full width;
 * - native power-sources-graph remains outside metric-grid and full width;
 * - sections remain vertically stacked;
 * - custom panel_max_width values other than 520 are respected;
 * - no config/API/.storage writes are performed.
 */

import "./smart-energy-advanced-layout.js?v=100-module140-suite130";

const SMART_ENERGY_RESPONSIVE_RUNTIME_VERSION = "1.1.0";
const SMART_ENERGY_EFFECTIVE_VERSION = "1.5.1";
const SMART_ENERGY_TABLET_MAX_WIDTH = 780;
const SMART_ENERGY_ADAPTIVE_MAX_WIDTH = 1000;
const LEGACY_AUTO_WIDTHS = new Set([520]);

const RESPONSIVE_MARKER = Symbol.for(
  "smart-home-suite-smart-energy-responsive-v1.1.0"
);

function configuredWidth(cfg) {
  const value = Number(cfg?.design?.panel_max_width);
  return Number.isFinite(value) ? Math.round(value) : 520;
}

function usesLegacyAutoWidth(cfg) {
  return LEGACY_AUTO_WIDTHS.has(configuredWidth(cfg));
}

function responsiveStyles(cfg) {
  const width = configuredWidth(cfg);
  const adaptive = usesLegacyAutoWidth(cfg);

  const widthRule = adaptive
    ? `
      @media (min-width:560px) and (max-width:899px){
        .page{max-width:min(${SMART_ENERGY_TABLET_MAX_WIDTH}px,100%)}
      }
      @media (min-width:900px){
        .page{max-width:min(${SMART_ENERGY_ADAPTIVE_MAX_WIDTH}px,100%)}
      }
    `
    : "";

  const fallbackDesktopRule = adaptive || width >= 900
    ? `
      @supports not (container-type:inline-size){
        @media (min-width:900px){
          .metric-grid{grid-template-columns:repeat(4,minmax(0,1fr))}
          .metric-card.span-2{grid-column:span 2}
          .metric-card.kind-hero{grid-column:1/-1}
        }
      }
    `
    : "";

  return `
    ${widthRule}

    .page{
      container-type:inline-size;
      container-name:smart-energy-advanced-page;
    }

    .native-power-graph-section,
    .native-power-graph-section slot{
      width:100%;
      min-width:0;
    }

    @supports (container-type:inline-size){
      @container smart-energy-advanced-page (max-width:899px){
        .metric-grid{
          grid-template-columns:repeat(2,minmax(0,1fr));
        }
        .metric-card.span-2,
        .metric-card.kind-hero{
          grid-column:1/-1;
        }
      }

      @container smart-energy-advanced-page (min-width:900px){
        .metric-grid{
          grid-template-columns:repeat(4,minmax(0,1fr));
        }
        .metric-card.span-2{
          grid-column:span 2;
        }
        .metric-card.kind-hero{
          grid-column:1/-1;
        }
      }
    }

    ${fallbackDesktopRule}
  `;
}

function installResponsiveRuntime() {
  const PanelClass = customElements.get("smart-energy-advanced-panel");
  const proto = PanelClass?.prototype;

  if (!proto) {
    console.warn(
      "[Smart Energy Responsive] smart-energy-advanced-panel no está disponible; extensión omitida"
    );
    return false;
  }

  if (proto[RESPONSIVE_MARKER]) return true;

  const originalStyles = proto._styles;
  if (typeof originalStyles === "function") {
    proto._styles = function smartEnergyResponsiveStyles(cfg) {
      return `${originalStyles.call(this, cfg)}\n${responsiveStyles(cfg)}`;
    };
  }

  const originalRender = proto._render;
  if (typeof originalRender === "function") {
    proto._render = function smartEnergyResponsiveRender(...args) {
      const result = originalRender.apply(this, args);
      try {
        const version = this.shadowRoot?.querySelector?.(".version");
        if (version) version.textContent = `v${SMART_ENERGY_EFFECTIVE_VERSION}`;
      } catch (_) {
        // Cosmetic only; fail open.
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
    `[Smart Energy Responsive] v${SMART_ENERGY_RESPONSIVE_RUNTIME_VERSION} · módulo v${SMART_ENERGY_EFFECTIVE_VERSION} · tablet ${SMART_ENERGY_TABLET_MAX_WIDTH}px · desktop ${SMART_ENERGY_ADAPTIVE_MAX_WIDTH}px`
  );

  return true;
}

if (
  !installResponsiveRuntime() &&
  typeof customElements?.whenDefined === "function"
) {
  customElements
    .whenDefined("smart-energy-advanced-panel")
    .then(() => installResponsiveRuntime());
}
