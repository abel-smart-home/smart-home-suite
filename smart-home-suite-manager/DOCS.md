# Smart Home Suite Manager 1.14.0 · PRE-RELEASE

## Smart Home V3 nativo

### Arquitectura

```text
Smart Home Panel V2.0.5 (fallback)
        ↓ herencia funcional
Runtime V1.1.0 + Card Layout V1.0.0
        ↓
SmartHomePanelV3 V3.1.0
```

`SmartHomePanelV3` es un custom element propio:

`<smart-home-panel-v3>`

El dashboard lo monta mediante:

`<smart-home-dashboard-card-v3>`

El bridge V3 hereda el dashboard card validado del Native Bridge V1.3.0, por lo
que conserva ocultamiento/restauración del header, botón ☰ móvil, control por
rol y comportamiento narrow.

### Compatibilidad con 1.13.0

`layout_v3.schema_version = 1` permanece igual.

No hay conversión ni reescritura automática.
Los datos existentes de 1.13.0 se leen directamente por V3.1.0.

### Secciones

Cada sección soporta:

- `show`
- `show_header`
- `show_empty`
- `section_surface`
- `header_surface`
- `title`
- `subtitle`
- `icon`
- colores/tamaños/alineación
- background/border/radius/padding
- widgets

### Widgets

Refs:

- `monthly_cost`
- `season`
- `tariff`
- `power`
- `extra:<id>`

Tamaños:

- `auto`
- `small`
- `medium`
- `large`
- `full`

### Responsive

Default:

- `<700 px`: 1 columna
- `>=700 px`: 4 columnas
- max width adaptativo heredado: 1100 px

Container query: `smart-home-v3-page`.

### Editor

Conserva General / Tarjetas / Tacómetro / Navegación / Avanzado y añade
**Layout V3**.

El selector de iconos usa `ha-selector`, `ha-icon-picker` y siempre conserva el
campo manual `mdi:...`.

### Recuperación

Si `layout_v3.enabled` se desactiva, el panel V3 vuelve a mostrar el layout plano
heredado dentro del mismo frontend.

Para rollback de Suite usa `restore_latest`.

## Otros módulos

Lighting 1.4.1, Energy Advanced 1.5.3, Automations 1.3.0 y Support 1.2.0
no cambian funcionalmente en 1.14.0.
