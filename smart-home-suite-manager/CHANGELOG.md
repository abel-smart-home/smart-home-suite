# Changelog

## 1.10.0 - 2026-08-19 · STABLE

- Promueve a estable el mismo payload 1.10.0 validado previamente como pre-release en Home Assistant OS.
- Actualiza **Smart Automations a 1.2.0**.
- Mantiene Smart Automations Panel V1.0.0, layout runtime V1.0.0 y Color Picker Guard V1.0.0 intactos.
- Añade `smart-automations-responsive.js` V1.0.0 como capa aislada.
- Conserva móvil y permite que el ancho heredado 520 px aproveche hasta 1000 px en tablet/PC.
- Usa container queries para adaptar `.cards` al ancho real disponible.
- Respeta `columns_mobile`, `columns_tablet` y `columns_desktop`.
- Mantiene `.summary` a ancho completo y fuera del grid.
- Mantiene tarjetas alineadas desde la izquierda; las celdas no utilizadas quedan libres.
- Respeta cualquier `panel_max_width` personalizado distinto de 520.
- Conserva `.storage/smart_automations.config` versión 1.
- No cambia REST de automatizaciones nativas, recetas, ownership/hash, Personalización, selectores, navegación ni Color Picker Guard.
- No requiere migración.
- La promoción a estable no modifica el payload funcional que pasó las pruebas del pre-release.

## 1.9.1 - 2026-08-18 · STABLE

- Promueve a estable el mismo payload 1.9.1 validado previamente como pre-release en Home Assistant OS.
- Actualiza **Smart Lighting a 1.4.1** manteniendo Smart Lighting Panel V1.0.3 y `smart-lighting-layout.js` V1.2.0 intactos.
- Actualiza `smart-lighting-responsive.js` a V1.1.0.
- Conserva el responsive general introducido en 1.9.0 para móvil, tablet y PC.
- Móvil conserva el diseño y Global Actions previamente validado.
- Tablet usa `columns_tablet` y escritorio usa `columns_desktop`.
- Global Actions usa en tablet/PC la misma cuadrícula de tarjetas, ocupa las primeras posiciones y permanece alineado a la izquierda.
- Los botones globales dejan de estirarse para llenar media pantalla.
- Conservan altura compacta y el mismo `card_gap` del grid de dispositivos.
- Conserva `.storage/smart_lighting_panel.config` versión 1 y WebSocket `smart_lighting_panel/config/*`.
- No requiere migración.
- La promoción a estable no modifica el payload funcional probado.

## 1.9.0 - 2026-08-18 · TEST

- Actualiza **Smart Lighting a 1.4.0**.
- Añade `smart-lighting-responsive.js` V1.0.0 encima del frontend base V1.0.3 y layout runtime V1.2.0, ambos intactos.
- Mantiene móvil y permite que configuraciones heredadas de 520/760 px aprovechen progresivamente hasta 1200 px en tablet/PC.
- Usa container queries para adaptar las columnas al ancho real disponible del panel.
- Conserva `columns_mobile`, `columns_tablet` y `columns_desktop`.
- Respeta anchos personalizados distintos de 520/760.
- No escribe ni migra `.storage`.
- Mantiene Personalización, navegación, selectores, acciones, ordenamiento, Global Actions y aislamiento del módulo.

## 1.8.0 - 2026-08-18 · TEST

- Actualiza **Smart Support a 1.2.0**.
- Conserva el backend y contrato de sesión de Smart Support 1.1.2.
- Añade orden compacto de acciones.
- Añade personalización visual global e individual de botones.
- Añade Color Picker Guard.
- Mantiene `.storage`, servicios/WebSocket, temporizador, navegación, selectores y aislamiento.
- No requiere migración.

## 1.7.1 - 2026-08-18 · STABLE

- Promueve a estable el payload previamente validado de Smart Automations 1.1.1.
- Mantiene Smart Automations Panel V1.0.0 y layout runtime V1.0.0.
- Añade Color Picker Guard V1.0.0.
- Conserva `.storage`, automations nativas, navegación, responsive, Importar/Exportar/Restablecer, selectores y permisos.
- No requiere migración.

## 1.6.0 - 2026-08-18 · STABLE

- Promueve a estable la versión 1.6.0 validada previamente como pre-release en Home Assistant OS.
- Actualiza **Smart Lighting a 1.3.0** manteniendo Smart Lighting Panel V1.0.3 como frontend base intacto.
- Actualiza `smart-lighting-layout.js` a V1.2.0.
- Amplía ordering runtime a V1.1.0 para incluir **Acciones globales** dentro del orden de áreas.
- Permite mover Acciones globales arriba, abajo o entre áreas normales mediante ↑ / ↓.
- Conserva el orden real de las áreas normales en `areas[]` y guarda únicamente la inserción especial en `global_actions.position`.
- Amplía Global Actions runtime a V1.1.0.
- Añade orden configurable de **Apagar todo** / **Encender todo** mediante `global_actions.button_order`.
- Añade **Color activo** y **Color inactivo** por botón.
- Apagar todo se considera activo cuando todas las entidades objetivo están apagadas; Encender todo cuando todas están encendidas; estados mezclados usan color inactivo.
- Mantiene compatibilidad con el campo `color` de Suite 1.5.0 usándolo como fallback del color activo.
- Conserva alcance, visibilidad, contador, selector MDI y ejecución dinámica sobre `light.*`/`switch.*`.
- Conserva `.storage/smart_lighting_panel.config` versión 1 y WebSocket `smart_lighting_panel/config/*`.
- No requiere migración destructiva y mantiene rollback compatible.
- Mantiene sin cambios funcionales Smart Home 1.4.0, Smart Energy Advanced 1.4.0, Smart Automations 1.0.0 y Smart Support 1.1.2.
- Refuerza `validate_release.py` para validar nuevas versiones, posición del área, orden de botones, colores por estado y cache-buster.
- La promoción a estable no modifica el payload funcional que pasó las pruebas del pre-release.

## 1.5.0 - 2026-08-18 · TEST

- Actualiza **Smart Lighting a 1.2.0** manteniendo Smart Lighting Panel V1.0.3 como frontend base intacto.
- Actualiza `smart-lighting-layout.js` a V1.1.0.
- Conserva el reordenamiento de áreas/dispositivos V1.0.0 ya validado en Suite 1.4.0.
- Añade acciones globales opcionales V1.0.0 dentro de una sección visual separada.
- Añade botones configurables **Apagar todo** y **Encender todo**.
- Permite alcance sobre todos los dispositivos configurados o solo los visibles.
- Conserva `.storage/smart_lighting_panel.config` versión 1.
- No requiere migración.

## 1.4.0 - 2026-08-18 · TEST

- Actualiza **Smart Lighting a 1.1.0** mediante `smart-lighting-layout.js` V1.0.0.
- Mantiene Smart Lighting Panel V1.0.3 como frontend base sin reconstruirlo.
- Añade orden configurable de áreas y dispositivos.
- Conserva `.storage`, selectores, navegación, responsive y acciones.
- No requiere migración destructiva.

## 1.3.0 - 2026-08-18 · STABLE

- Promueve a estable Smart Energy Advanced 1.4.0.
- Mantiene Smart Energy Advanced Panel V1.3.1 como frontend base.
- Añade orden configurable de secciones y widgets.
- Conserva `.storage`, navegación, selectores, acciones y gráfico nativo de fuentes de energía.
- No requiere migración.

## 1.2.0 - 2026-08-18 · STABLE

- Promueve a estable Smart Home module 1.4.0.
- Mantiene Smart Home Panel V2.0.5 y Native Dashboard Bridge V1.3.0.
- Añade orden y tarjetas adicionales configurables.
- Conserva navegación, selectores y compatibilidad.
