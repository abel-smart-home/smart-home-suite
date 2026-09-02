# Smart Home Suite Manager 1.14.1

**PRE-RELEASE** — Smart Automations Alert Control warning fix.

## Estado

- Último Stable: **1.14.0**
- Candidato: **1.14.1**
- Smart Automations: **1.3.1**
- Alert Control: **1.0.1**

## Corrección

Las recetas Consumo elevado y Límite de kWh mantienen:

- `mode: single`;
- espera de rearme;
- histéresis;
- horario opcional;
- 1/2 avisos.

Ahora añaden:

`max_exceeded: silent`

para que intentos adicionales mientras la automatización sigue ejecutándose se
ignoren sin llenar el registro con `Already running`.

## Módulos preservados

- Smart Home 1.6.0 · Panel V3.1.0
- Smart Lighting 1.4.1
- Smart Energy Advanced 1.5.3
- Smart Support 1.2.0

## Acciones del Manager

- `validate_only`
- `install_repair`
- `restore_latest`

Imagen de prueba:

`ghcr.io/abel-smart-home/smart-home-suite-manager:1.14.1`
