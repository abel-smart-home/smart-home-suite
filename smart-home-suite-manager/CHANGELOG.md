# Changelog

## 1.14.0 - 2026-08-19 · TEST

- Actualiza Smart Home module a **1.6.0**.
- Añade `smart-home-panel-v3.js` **V3.1.0** como custom element propio.
- Añade `smart-home-native-v3.js` **V1.0.0**.
- `/smart-home` deja de cargar activamente `smart-home-layout-v3.js`.
- Conserva el runtime 1.13.0 como artefacto legado no cargado.
- Conserva Smart Home Panel V2.0.5 como fallback intacto.
- Conserva Runtime V1.1.0, Narrow Guard V1.0.0 y Card Layout V1.0.0.
- Conserva `layout_v3` schema 1 y lee configuración 1.13.0 sin migración.
- V3 nativo crea secciones DOM reales con grids internos.
- Añade superficie opcional de toda la sección además de superficie de encabezado.
- Conserva reordenamiento, tamaños semánticos y responsive 1/4 columnas.
- Conserva header configurable, menú móvil por rol y selector MDI dentro de V3.
- No cambia backend, `.storage`, WebSocket, entidades, acciones, gauge, navegación,
  extra cards ni historial.
- Otros módulos permanecen funcionalmente sin cambios.

## 1.13.0 - 2026-08-19 · TEST

- Introdujo Smart Home Layout V3 runtime V1.0.0 sobre Smart Home Panel V2.0.5.
- Añadió secciones, widgets movibles, tamaños semánticos y container queries.
- Mantuvo storage/backend sin migración.

## 1.12.3 - 2026-08-19 · STABLE

- Smart Energy Advanced 1.5.3.
- Energy móvil 2 columnas; tablet/PC 4 columnas.
- Sin migración de storage.

Historial anterior disponible en releases previos.
