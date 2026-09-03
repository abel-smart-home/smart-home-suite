# Smart Automations 1.3.2 · PRE-RELEASE

## Cadena

1. Smart Automations Panel V1.0.0
2. Layout V1.0.0
3. Color Picker Guard V1.0.0
4. Responsive V1.0.0
5. Alert Control V1.1.0

## Alert Control V1.1.0

Recetas:

- `high_power`
- `energy_limit`

Nuevo parámetro:

`schedule_outside_behavior`

Valores:

- `discard` — default y compatibilidad.
- `pending` — espera el siguiente inicio del horario.

Pendiente se cancela por rearme. En el inicio del horario sólo notifica si continúa sobre el límite.

Si ya bajó del límite principal pero aún no alcanzó el rearme, no notifica y mantiene `mode: single` hasta el rearme.

## Preservado

- `max_exceeded: silent`
- 1/2 avisos
- segundo aviso
- horario opcional
- rangos que cruzan medianoche
- histéresis
- `.storage` v1
- sin helpers
- REST/WebSocket sin cambios

## Existentes

No se reescriben automáticamente.

Abrir + Guardar aplica `energy-alert-control-1.1.0`.

## Limitación

Un reinicio completo de Home Assistant puede cancelar una espera pendiente activa.

## Estado

**PRE-RELEASE**
