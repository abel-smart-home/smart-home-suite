# Smart Home module

Arquitectura actual:

`/smart-home` → dashboard nativo Lovelace (storage) → `custom:smart-home-dashboard-card`
→ bridge V1.3.0 → Suite Runtime V1.1.0 → `<smart-home-panel>` V2.0.5.

## Fuente validada

`smart-home-panel.js` permanece en **V2.0.5** y no se modifica para agregar
funciones de la Suite. El runtime importa ese frontend validado y aplica capas
pequeñas, independientes y con fail-open.

El runtime conserva:

- narrow-render guard V1.0.0, que evita cerrar el selector MDI por renders redundantes;
- configurable cards runtime V1.0.0.

## Tarjetas configurables

La configuración existente continúa intacta:

- `monthly_cost`
- `season`
- `tariff`
- `power`

La extensión agrega únicamente:

- `card_layout.order`: orden estable de las tarjetas dentro del stack;
- `extra_cards[]`: tarjetas opcionales con ID estable.

Las tarjetas adicionales pueden ser:

- **Valor**: misma presentación base de una entidad;
- **Barra**: valor actual + barra configurable entre mínimo y máximo;
- **Gráfica**: valor actual + sparkline de historial del Recorder.

Todas reutilizan los selectores y comportamientos existentes del panel:

- selector de entidad;
- selector MDI nativo/fallback del bridge;
- tap/hold (`more-info`, `none`, `navigate`, `url`, `toggle`);
- colores, tamaños, bordes, radios, padding y alineación;
- Exportar / Importar / Restablecer.

El orden solo afecta el bloque de tarjetas. Encabezado, avisos, navegación y el
resto de Smart Home conservan su posición y comportamiento actuales.

## Compatibilidad

Una configuración anterior que no tenga `card_layout` ni `extra_cards` recibe el
orden histórico automáticamente:

`monthly_cost → season → tariff → power`

No se modifica `.storage` fuera del mecanismo WebSocket existente del panel y no
se requiere migración destructiva.
