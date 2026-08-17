# Smart Home Suite 0.2.1 — Smart Lighting exact migration TEST

Esta revisión corrige la migración piloto de Smart Lighting.

## Correcciones

- Frontend original completo de Smart Lighting Panel V1.0.3.
- Sin reconstrucción visual ni funcional.
- Misma API WebSocket del componente independiente.
- Misma clave de almacenamiento: `smart_lighting_panel.config`.
- Cache-buster nuevo para impedir que Home Assistant reutilice el JS incorrecto de 0.2.0.

## Objetivo de prueba

El panel `/lighting` debe verse y comportarse igual que Smart Lighting Panel V1.0.3 independiente, con la única diferencia de que ahora es instalado y registrado por Smart Home Suite.
