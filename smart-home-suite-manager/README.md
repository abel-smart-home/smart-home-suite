# Smart Home Suite Manager 1.14.2

**PRE-RELEASE** — Smart Automations pending out-of-hours alerts.

## Estado

- Último Stable: **1.14.0**
- Pre-release anterior: **1.14.1**
- Candidato actual: **1.14.2**
- Smart Automations: **1.3.2**
- Alert Control: **1.1.0**

## Nuevo

Cuando el horario de notificación está activado:

- `Descartar el aviso`
- `Dejar aviso pendiente`

`Descartar` sigue siendo el default para compatibilidad.

Pendiente espera el siguiente inicio del horario o el rearme, lo que ocurra primero.

## Preservado

- `mode: single`
- `max_exceeded: silent`
- 1/2 avisos
- segundo aviso
- histéresis
- `.storage` v1
- Smart Home 1.6.0 / V3.1.0
- Lighting 1.4.1
- Energy Advanced 1.5.3
- Support 1.2.0

Acciones del Manager:

- `validate_only`
- `install_repair`
- `restore_latest`
