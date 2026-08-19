# Smart Home Suite Manager 1.14.0

**PRE-RELEASE** — Smart Home Panel V3 nativo.

## Estado

- Stable recomendado: **1.12.3**
- Pre-release anterior: **1.13.0**
- Nuevo pre-release: **1.14.0**

## Módulos

- Smart Home 1.6.0 · Panel V3.1.0
- Smart Lighting 1.4.1
- Smart Energy Advanced 1.5.3
- Smart Automations 1.3.0
- Smart Support 1.2.0

## Smart Home 1.6.0

Frontend activo:

`smart-home-panel-v3.js`

Bridge activo:

`smart-home-native-v3.js`

Fallbacks preservados:

- Smart Home Panel V2.0.5
- Native Dashboard Bridge V1.3.0
- Runtime V1.1.0
- Card Layout V1.0.0
- Layout V3 runtime 1.0.0 de 1.13.0 como artefacto legado no cargado

## Compatibilidad

- mismo backend;
- mismo `.storage`;
- mismo WebSocket;
- mismo `layout_v3` schema 1;
- sin migración;
- actualización desde 1.13.0 directa;
- instalación limpia soportada.

## Acciones

- `validate_only`
- `install_repair`
- `restore_latest`

Imagen:

`ghcr.io/abel-smart-home/smart-home-suite-manager:1.14.0`
