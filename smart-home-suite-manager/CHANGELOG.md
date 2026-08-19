# Changelog

## 1.12.3 - 2026-08-19 · STABLE

- Promueve a estable el mismo payload **1.12.3** validado previamente como pre-release en Home Assistant OS.
- Actualiza **Smart Energy Advanced a 1.5.3**.
- Mantiene Smart Energy Advanced Panel V1.3.1 y ordering runtime V1.0.0 intactos.
- Mantiene `smart-energy-advanced-responsive.js` V1.3.0.
- Conserva móvil con 2 columnas y el ancho heredado 520 sin expansión debajo de 700 px.
- Desde 700 px reales tablet y PC comparten 4 columnas.
- Tablet puede crecer hasta 900 px y PC hasta 1000 px.
- En móvil `span:2` ocupa toda la fila.
- En tablet/PC `span:2` ocupa 2 de 4 columnas.
- `kind-hero` y `power-sources-graph` conservan ancho completo.
- Conserva `.storage/smart_energy_advanced_panel.config` versión 1.
- Conserva WebSocket, entidades, cálculos, acciones, selectores, navegación, Personalización y ordenamiento.
- No requiere migración.
- Mantiene los contratos validados de Lighting responsive V1.1.0 y Automations responsive V1.0.0.
- La promoción a estable no modifica el payload funcional que pasó las pruebas del pre-release.

## 1.12.2 - 2026-08-19 · TEST

- Actualiza **Smart Energy Advanced a 1.5.2**.
- Mantiene Smart Energy Advanced Panel V1.3.1 y ordering runtime V1.0.0 intactos.
- Actualiza `smart-energy-advanced-responsive.js` a V1.2.0.
- Introduce una composición diferenciada por ancho real: 2 / 3 / 4 columnas.
- Menos de 700 px reales conserva 2 columnas.
- Entre 700 y 899 px reales usa 3 columnas.
- Desde 900 px reales conserva 4 columnas.
- En tablet `span:2` ocupa 2 de 3 columnas.
- En PC `span:2` ocupa 2 de 4 columnas.
- `kind-hero` conserva ancho completo.
- `power-sources-graph` permanece fuera del grid y a ancho completo.
- Conserva `.storage` versión 1.
- No requiere migración.

## 1.12.1 - 2026-08-19 · TEST

- Actualiza **Smart Energy Advanced a 1.5.1**.
- Mantiene base V1.3.1 y ordering runtime V1.0.0 intactos.
- Actualiza responsive a V1.1.0.
- Tablet continúa en 2 columnas con ancho limitado a 780 px.
- Conserva `.storage` versión 1.
- No requiere migración.

## 1.12.0 - 2026-08-19 · TEST

- Actualiza **Smart Energy Advanced a 1.5.0**.
- Añade `smart-energy-advanced-responsive.js` V1.0.0.
- Conserva móvil y añade PC en 4 columnas.
- Reutiliza `span:1` y `span:2`.
- Conserva `power-sources-graph`.
- Conserva `.storage` versión 1.
- No requiere migración.

## 1.11.0 - 2026-08-19 · STABLE

- Promueve a estable el mismo payload 1.11.0 validado previamente como pre-release.
- Actualiza **Smart Automations a 1.3.0**.
- Añade Alert Control V1.0.0.
- Conserva Home Assistant como motor nativo.
- Mantiene `.storage` versión 1.
- No requiere migración.

## 1.10.0 - 2026-08-19 · STABLE

- Promueve a estable Smart Automations 1.2.0.
- Añade responsive V1.0.0.
- Conserva automatizaciones nativas, `.storage`, selectores y navegación.
- No requiere migración.

## 1.9.1 - 2026-08-18 · STABLE

- Promueve a estable Smart Lighting 1.4.1.
- Mantiene panel base V1.0.3 y layout V1.2.0.
- Actualiza responsive a V1.1.0.
- Global Actions se alinea al grid en tablet/PC.
- No requiere migración.

## 1.9.0 - 2026-08-18 · TEST

- Añade responsive V1.0.0 a Smart Lighting.
- Mantiene panel base/layout intactos.
- No requiere migración.

## 1.8.0 - 2026-08-18 · TEST

- Actualiza Smart Support a 1.2.0.
- Añade orden y personalización de acciones.
- No requiere migración.

## 1.7.1 - 2026-08-18 · STABLE

- Promueve Smart Automations 1.1.1.
- Añade Color Picker Guard V1.0.0.
- No requiere migración.

## 1.6.0 - 2026-08-18 · STABLE

- Promueve Smart Lighting 1.3.0.
- Añade orden de Global Actions y colores de estado.
- Conserva `.storage` versión 1.
- No requiere migración.

## 1.5.0 - 2026-08-18 · TEST

- Añade Global Actions a Smart Lighting.
- Conserva `.storage` versión 1.
- No requiere migración.

## 1.4.0 - 2026-08-18 · TEST

- Añade ordering runtime inicial a Smart Lighting.
- No requiere migración.

## 1.3.0 - 2026-08-18 · STABLE

- Promueve Smart Energy Advanced 1.4.0.
- Añade ordering runtime V1.0.0.
- Conserva `.storage`, navegación, selectores, acciones y gráfico nativo.
- No requiere migración.

## 1.2.0 - 2026-08-18 · STABLE

- Promueve Smart Home module 1.4.0.
- Mantiene Smart Home Panel V2.0.5 y Native Dashboard Bridge V1.3.0.
- Conserva navegación, selectores y compatibilidad.
