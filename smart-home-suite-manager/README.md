# Smart Home Suite Manager 1.12.0

Smart Home Suite 1.12.0 es un **PRE-RELEASE** para validar el primer responsive de Smart Energy Advanced 1.5.0.

**Último release estable:** 1.11.0.

## Módulos

- Smart Home 1.4.0
- Smart Lighting 1.4.1
- Smart Energy Advanced 1.5.0
- Smart Automations 1.3.0
- Smart Support 1.2.0

## Smart Energy Advanced 1.5.0

Añade `smart-energy-advanced-responsive.js` V1.0.0 sobre la base V1.3.1 y ordering runtime V1.0.0, ambos intactos.

Reglas de esta primera prueba:

- móvil: 2 columnas;
- tablet: 2 columnas;
- PC: 4 columnas;
- máximo adaptativo: 1000 px para el ancho heredado 520;
- `span-2`: fila completa en móvil/tablet, 2 columnas en PC;
- `hero`: siempre ancho completo;
- `power-sources-graph`: siempre ancho completo;
- secciones: flujo vertical existente.

No cambia `.storage`, WebSocket, acciones, selectores, ordenamiento ni Personalización.

## Acciones del Manager

- `install_repair`
- `validate_only`
- `restore_latest`

## Flujo de prueba

1. `validate_only` → `VALIDATION_OK`.
2. `install_repair` con `create_backup: true`.
3. Confirma `PAYLOAD_VALIDATION_OK`, `STAGED_VALIDATION_OK`, `POST_INSTALL_VALIDATION_OK` e `INSTALLATION_OK`.
4. Reinicia Home Assistant.
5. Recarga completamente el frontend.
6. Ejecuta el checklist de 1.12.0.

## Distribución

`ghcr.io/abel-smart-home/smart-home-suite-manager:1.12.0`
