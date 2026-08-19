# Smart Home Suite Manager 1.14.0 · STABLE

## Smart Home V3 nativo

### Arquitectura estable

```text
Smart Home Panel V2.0.5
        │ fallback / base funcional
        ▼
Runtime V1.1.0 + Card Layout V1.0.0
        │
        ▼
SmartHomePanelV3 V3.1.0
```

Elemento activo:

`<smart-home-panel-v3>`

Dashboard card:

`<smart-home-dashboard-card-v3>`

El bridge V3 reutiliza el comportamiento validado del Native Dashboard Bridge
V1.3.0 para conservar:

- ocultamiento/restauración del header;
- botón ☰ móvil;
- control de acceso por rol;
- comportamiento narrow;
- lifecycle Lovelace fail-open.

## Compatibilidad

`layout_v3.schema_version = 1`.

No existe migración.

Configuraciones creadas por Suite 1.13.0 se leen directamente por V3.1.0.

Abrir el panel no escribe configuración automáticamente.

## Secciones

Cada sección puede configurar:

- `show`;
- `show_header`;
- `show_empty`;
- `section_surface`;
- `header_surface`;
- `title`;
- `subtitle`;
- `icon`;
- colores;
- tamaños;
- alineación;
- background;
- border;
- radius;
- padding;
- widgets.

## Widgets

Refs compatibles:

- `monthly_cost`;
- `season`;
- `tariff`;
- `power`;
- `extra:<id>`.

Tamaños:

- `auto`;
- `small`;
- `medium`;
- `large`;
- `full`.

## Responsive

Default:

- `<700 px`: 1 columna;
- `>=700 px`: 4 columnas;
- max width adaptativo: 1100 px.

Container query:

`smart-home-v3-page`

## Editor

Conserva:

- General;
- Tarjetas;
- Tacómetro;
- Navegación;
- Avanzado.

Añade:

- Layout V3.

Selector MDI:

1. `ha-selector`;
2. `ha-icon-picker`;
3. campo manual `mdi:...`.

## Recuperación

Dentro de Smart Home:

Personalización → Layout V3 → desactivar `Activar Layout V3` → Guardar.

Para rollback de Suite:

Smart Home Suite Manager → `restore_latest`.

## Otros módulos

- Lighting 1.4.1
- Energy Advanced 1.5.3
- Automations 1.3.0
- Support 1.2.0

Todos permanecen funcionalmente sin cambios en la promoción Stable 1.14.0.
