# Smart Home Suite Manager 1.13.0 · PRE-RELEASE

Último estable: **1.12.3**.

## Versiones

- Suite / Manager: **1.13.0**
- Smart Home: **1.5.0**
- Smart Home base: **2.0.5**
- Smart Home Layout V3: **3.0.0 / runtime 1.0.0**
- Smart Lighting: **1.4.1**
- Smart Energy Advanced: **1.5.3**
- Smart Automations: **1.3.0**
- Smart Support: **1.2.0**

## Arquitectura Smart Home

```text
Smart Home Panel V2.0.5
        ↓
smart-home-card-layout.js V1.0.0
        ↓
smart-home-panel-runtime.js V1.1.0
        ↓
smart-home-layout-v3.js V1.0.0
```

El backend V2.0.5 y Native Dashboard Bridge V1.3.0 permanecen sin cambio.

## Configuración V3

V3 añade claves opcionales dentro del mismo JSON existente:

- `layout_v3.schema_version`
- `layout_v3.enabled`
- `layout_v3.adaptive_width`
- `layout_v3.breakpoint`
- `layout_v3.wide_max_width`
- `layout_v3.grid_gap`
- `layout_v3.section_gap`
- `layout_v3.sections[]`
- `layout_v3.widget_layout`

No existe migración automática de storage.

## Defaults de instalación limpia

- Resumen: monthly_cost, season, tariff.
- Consumo: power.
- Otros: tarjetas adicionales.

Las secciones vacías se pueden ocultar automáticamente.

## Secciones

Cada sección soporta:

- `show`;
- `show_header`;
- `show_empty`;
- título/subtítulo;
- icono;
- colores;
- tamaños;
- alineación;
- superficie de encabezado opcional;
- fondo/borde/radio/padding;
- orden.

Se pueden agregar, duplicar y reordenar. Las secciones personalizadas se pueden
eliminar y sus widgets se trasladan antes de quitar la sección.

## Widgets

Los refs existentes siguen siendo la fuente de verdad:

- `monthly_cost`
- `season`
- `tariff`
- `power`
- `extra:<id>`

V3 no duplica entidades ni tarjetas. Solo asigna cada ref a una sección y un
tamaño semántico.

Tamaños:

- `auto`
- `small`
- `medium`
- `large`
- `full`

## Responsive

Container: `.page` → `smart-home-v3-page`.

Predeterminado:

- `<700 px`: 1 columna;
- `>=700 px`: 4 columnas;
- max width adaptativo heredado: 1100 px.

El breakpoint y max width se pueden personalizar desde el editor.

## Compatibilidad

V3 conserva:

- `.storage` y WebSocket del backend actual;
- Guardar/Cancelar;
- Importar/Exportar/Restablecer;
- selectores de entidades;
- acciones tap/hold/more-info/toggle/navigate/url;
- navegación;
- gauge;
- tarjetas adicionales value/bar/graph;
- historial de gráficas;
- Narrow Render Guard;
- Native Dashboard Bridge.

Guardar V3 sincroniza `card_layout.order` con el orden plano equivalente.

## Recuperación

Si V3 produce un problema visual:

1. abre Personalización;
2. Layout V3;
3. desactiva `Activar Layout V3`;
4. Guardar.

El layout plano anterior vuelve a controlar la presentación.

Para rollback de Suite usa `restore_latest`.
