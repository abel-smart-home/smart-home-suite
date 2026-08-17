# Smart Home Suite 0.3.1 — Clean install correction TEST

Corrección de la candidata 0.3.0.

## Smart Home
- Incluye Smart Home Panel V2.0.5 exacto dentro de la Suite.
- Incluye backend V2.0.5 exacto.
- Conserva bridge nativo V1.3.0 exacto.
- Ya no depende de capturar archivos de una instalación anterior.
- Crea `/smart-home` como dashboard Lovelace storage real.
- Debe aparecer en Ajustes → Dashboards.

## Smart Support
- Conserva frontend, manager, constantes, stores y servicios V1.1.2.
- Conserva el dominio de servicios `smart_support_panel`.
- Registra las descripciones de servicios desde la Suite para evitar que Home Assistant busque una integración independiente inexistente.
- La UI `/support` se registra antes del bloque de servicios para aislarla de errores de metadata.

No publicar release hasta terminar el checklist.
