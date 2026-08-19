# Smart Home Suite Manager 1.14.0

**STABLE** — Smart Home Panel V3 nativo.

## Estado

- Último Stable: **1.14.0**
- Smart Home module: **1.6.0**
- Smart Home Panel V3: **3.1.0**

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
- Narrow Guard V1.0.0
- Card Layout V1.0.0
- Layout V3 runtime V1.0.0 de 1.13.0 como artefacto legado no cargado

## Compatibilidad

- mismo backend;
- mismo `.storage`;
- mismo WebSocket;
- mismo `layout_v3` schema 1;
- sin migración;
- compatible con configuración V3 creada en 1.13.0;
- instalación limpia validada.

## Acciones del Manager

- `validate_only`
- `install_repair`
- `restore_latest`

Imagen estable:

`ghcr.io/abel-smart-home/smart-home-suite-manager:1.14.0`
