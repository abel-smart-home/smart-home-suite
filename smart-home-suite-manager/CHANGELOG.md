# Changelog

## 1.12.1 - 2026-08-19 · TEST

- Actualiza **Smart Energy Advanced a 1.5.1**.
- Mantiene base V1.3.1 y ordering runtime V1.0.0 intactos.
- Actualiza `smart-energy-advanced-responsive.js` a V1.1.0.
- Conserva móvil exactamente como en la prueba 1.12.0.
- Conserva PC en 4 columnas hasta 1000 px, exactamente como en la prueba 1.12.0.
- Tablet continúa en 2 columnas, pero el ancho heredado 520 se limita a **780 px** y se centra.
- Conserva `span:1`, `span:2`, `kind-hero` y el gráfico nativo sin cambios de contrato.
- Conserva `.storage/smart_energy_advanced_panel.config` versión 1.
- No cambia WebSocket, entidades, cálculos, acciones, selectores, navegación, Personalización ni ordenamiento.
- No requiere migración.
- Debe permanecer como pre-release hasta validar visualmente tablet y repetir regresión móvil/PC.

## 1.12.0 - 2026-08-19 · TEST

- Actualiza **Smart Energy Advanced a 1.5.0**.
- Mantiene Smart Energy Advanced Panel V1.3.1 y ordering runtime V1.0.0 intactos.
- Añade `smart-energy-advanced-responsive.js` V1.0.0 como capa aislada.
- Conserva móvil en 2 columnas.
- Conserva tablet en 2 columnas.
- Añade PC en 4 columnas a partir de 900 px reales disponibles.
- Permite que el ancho heredado 520 px aproveche hasta 1000 px.
- Reutiliza `span:1` y `span:2` existentes sin migrar storage.
- En móvil/tablet `span-2` conserva fila completa.
- En PC `span-2` ocupa 2 de 4 columnas.
- `kind-hero` conserva siempre ancho completo.
- `power-sources-graph` permanece fuera del grid y a ancho completo.
- Las secciones continúan apiladas verticalmente.
- Respeta cualquier `panel_max_width` personalizado distinto de 520.
- Conserva `.storage/smart_energy_advanced_panel.config` versión 1.
- Conserva WebSocket, acciones, selectores, navegación, Personalización y ordenamiento.
- No requiere migración.
- Debe publicarse como pre-release hasta validarlo en HAOS real.

## 1.11.0 - 2026-08-19 · STABLE

- Promueve a estable el mismo payload 1.11.0 validado previamente como pre-release en Home Assistant OS.
- Actualiza **Smart Automations a 1.3.0**.
- Mantiene Smart Automations Panel V1.0.0, layout V1.0.0, Color Picker Guard V1.0.0 y responsive V1.0.0 intactos.
- Añade `smart-automations-alert-control.js` V1.0.0.
- Extiende exclusivamente `high_power` y `energy_limit`.
- Añade 1 o 2 avisos configurables por evento.
- Añade retraso configurable para el segundo aviso.
- Añade horario opcional configurable; desactivado conserva operación 24/7.
- Los eventos fuera de horario se descartan y nunca se recuperan después.
- El segundo aviso vuelve a comprobar horario y que el sensor continúe arriba del límite.
- Añade rearme controlado opcional e histéresis configurable.
- El valor de rearme debe ser igual o menor que el umbral de disparo.
- Mantiene Home Assistant como motor nativo y `mode: single`.
- No crea helpers ni cambia `.storage/smart_automations.config` versión 1.
- Las automatizaciones existentes no se reescriben automáticamente; el usuario debe abrirlas y Guardar para adoptar la nueva receta.
- Mantiene rollback compatible.
- La promoción a estable no modifica el payload funcional que pasó las pruebas del pre-release.

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
- Conserva el orden real de las áreas normales en `areas[]`.
- Añade orden configurable de **Apagar todo** / **Encender todo**.
- Añade **Color activo** y **Color inactivo** por botón.
- Conserva `.storage/smart_lighting_panel.config` versión 1.
- No requiere migración destructiva y mantiene rollback compatible.

## 1.5.0 - 2026-08-18 · TEST

- Actualiza **Smart Lighting a 1.2.0** manteniendo Smart Lighting Panel V1.0.3 como frontend base intacto.
- Añade acciones globales opcionales.
- Añade botones configurables Apagar todo / Encender todo.
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
