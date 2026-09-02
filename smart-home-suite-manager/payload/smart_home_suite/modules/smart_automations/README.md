# Smart Automations 1.3.1 · PRE-RELEASE

## Arquitectura

1. Smart Automations Panel V1.0.0
2. `smart-automations-layout.js` V1.0.0
3. `smart-automations-runtime.js` V1.0.0
4. `smart-automations-responsive.js` V1.0.0
5. `smart-automations-alert-control.js` V1.0.1

## Alert Control V1.0.1

Sólo extiende:

- `high_power`
- `energy_limit`

Mantiene toda la funcionalidad de V1.0.0 y añade:

```yaml
mode: single
max_exceeded: silent
```

El objetivo es silenciar el warning esperado cuando Home Assistant intenta
iniciar la automatización mientras todavía está ejecutándose y esperando el
rearme.

No desactiva la protección: la ejecución adicional continúa siendo rechazada.

## Horario

No cambia:

- horario opcional;
- fuera de horario se descarta;
- no se recupera al inicio de la ventana;
- el segundo aviso también revalida el horario.

## Persistencia

- `.storage`: `smart_automations.config`
- Storage version: 1
- WebSocket: sin cambios
- helpers: ninguno

## Automatizaciones existentes

No se actualizan automáticamente.

Abrir y Guardar desde Smart Automations aplica Alert Control V1.0.1 y actualiza
el marker a `energy-alert-control-1.0.1`.

## Estado

**PRE-RELEASE**
