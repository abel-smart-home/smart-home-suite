/**
 * Smart Home Suite · Smart Energy Advanced responsive runtime v1.2.0
 *
 * Preserved chain:
 *   Smart Energy Advanced Panel V1.3.1
 *   -> smart-energy-advanced-layout.js V1.0.0
 *   -> this responsive runtime V1.2.0
 *
 * Third-test scope:
 * - below 700px real panel width: 2 columns;
 * - from 700px to 899px: 3 columns;
 * - from 900px: validated 4-column desktop layout;
 * - legacy panel_max_width=520 may expand to 680px in narrow layouts,
 *   900px in tablet layouts and 1000px on desktop;
 * - span-2 is full row below 700px and spans 2 columns from 700px upward;
 * - hero cards always remain full width;
 * - native power-sources-graph remains outside metric-grid and full width;
 * - sections remain vertically stacked;
 * - custom panel_max_width values other than 520 are respected;
 * - no config/API/.storage writes are performed.
 */

import "./smart-energy-advanced-layout.js?v=100-module140-suite130";

const SMART_ENERGY_RESPONSIVE_RUNTIME_VERSION = "1.2.0";
const SMART_ENERGY_EFFECTIVE_VERSION = "1.5.2";
const SMART_ENERGY_NARROW_MAX_WIDTH = 680;
const SMART_ENERGY_TABLET_MAX_WIDTH = 900;
const SMART_ENERGY_ADAPTIVE_MAX_WIDTH = 1000;
const SMART_ENERGY_TABLET_COLUMNS_MIN_WIDTH = 700;
const SMART_ENERGY_DESKTOP_COLUMNS_MIN_WIDTH = 900;
const LEGACY_AUTO_WIDTHS = new Set([520]);

const RESPONSIVE_MARKER = Symbol.for(
  "smart-home-suite-smart-energy-responsive-v1.2.0"
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
      @media (min-width:560px) and (max-width:699px){
        .page{max-width:min(${SMART_ENERGY_NARROW_MAX_WIDTH}px,100%)}
      }
      @media (min-width:700px) and (max-width:899px){
        .page{max-width:min(${SMART_ENERGY_TABLET_MAX_WIDTH}px,100%)}
      }
      @media (min-width:900px){
        .page{max-width:min(${SMART_ENERGY_ADAPTIVE_MAX_WIDTH}px,100%)}
      }
    `
    : "";

  let fallbackRules = "";
  if (adaptive) {
    fallbackRules = `
      @supports not (container-type:inline-size){
        @media (max-width:699px){
          .metric-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
          .metric-card.span-2,
          .metric-card.kind-hero{grid-column:1/-1}
        }
        @media (min-width:700px) and (max-width:899px){
          .metric-grid{grid-template-columns:repeat(3,minmax(0,1fr))}
          .metric-card.span-2{grid-column:span 2}
          .metric-card.kind-hero{grid-column:1/-1}
        }
        @media (min-width:900px){
          .metric-grid{grid-template-columns:repeat(4,minmax(0,1fr))}
          .metric-card.span-2{grid-column:span 2}
          .metric-card.kind-hero{grid-column:1/-1}
        }
      }
    `;
  } else if (width >= SMART_ENERGY_DESKTOP_COLUMNS_MIN_WIDTH) {
    fallbackRules = `
      @supports not (container-type:inline-size){
        .metric-grid{grid-template-columns:repeat(4,minmax(0,1fr))}
        .metric-card.span-2{grid-column:span 2}
        .metric-card.kind-hero{grid-column:1/-1}
      }
    `;
  } else if (width >= SMART_ENERGY_TABLET_COLUMNS_MIN_WIDTH) {
    fallbackRules = `
      @supports not (container-type:inline-size){
        .metric-grid{grid-template-columns:repeat(3,minmax(0,1fr))}
        .metric-card.span-2{grid-column:span 2}
        .metric-card.kind-hero{grid-column:1/-1}
      }
    `;
  }

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
      @container smart-energy-advanced-page (max-width:699px){
        .metric-grid{
          grid-template-columns:repeat(2,minmax(0,1fr));
        }
        .metric-card.span-2,
        .metric-card.kind-hero{
          grid-column:1/-1;
        }
      }

      @container smart-energy-advanced-page (min-width:700px) and (max-width:899px){
        .metric-grid{
          grid-template-columns:repeat(3,minmax(0,1fr));
        }
        .metric-card.span-2{
          grid-column:span 2;
        }
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

    ${fallbackRules}
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
    `[Smart Energy Responsive] v${SMART_ENERGY_RESPONSIVE_RUNTIME_VERSION} · módulo v${SMART_ENERGY_EFFECTIVE_VERSION} · 2/3/4 columnas · tablet ${SMART_ENERGY_TABLET_MAX_WIDTH}px · desktop ${SMART_ENERGY_ADAPTIVE_MAX_WIDTH}px`
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
