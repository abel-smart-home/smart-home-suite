# Smart Home Suite Manager 1.14.1 · PRE-RELEASE

## Motivo

Home Assistant 2026.9.0 puede registrar `Already running` cuando una alerta
energética generada por Smart Automations sigue esperando el rearme y el trigger
intenta arrancar otra ejecución.

Ese bloqueo es intencional: `mode: single` evita un aviso duplicado.

Alert Control V1.0.1 genera además:

```yaml
mode: single
max_exceeded: silent
```

## Semántica preservada

### Horario

Si está desactivado: 24/7.

Si está activado y el evento cruza el límite fuera del horario:

- no notifica;
- no queda pendiente;
- no notifica al comenzar posteriormente el horario;
- necesita rearmarse y volver a cruzar el límite dentro del horario.

### Rearme

La automatización sigue esperando el cruce hacia abajo del valor configurado.

Ejemplo:

- disparo: 350 kWh
- rearme: 340 kWh

Después del aviso permanece bloqueada hasta `<340`.

### Reinicio o recuperación del sensor

Si el sensor vuelve a estar disponible aún por encima del límite y Home
Assistant intenta disparar otra ejecución mientras la anterior sigue activa:

- `mode: single` la bloquea;
- `max_exceeded: silent` evita el warning;
- no debe emitirse una segunda notificación.

## Aplicar a automatizaciones existentes

La Suite no reescribe automatizaciones nativas silenciosamente.

Después de instalar 1.14.1:

1. Smart Automations → automatización;
2. Editar;
3. Guardar;
4. abrir botón HA;
5. confirmar `max_exceeded: silent`.

## Instalación

1. `validate_only`
2. `install_repair`
3. `create_backup: true`
4. reiniciar Home Assistant
5. recarga completa del frontend

## Rollback

`restore_latest` restaura la Suite. Una automatización nativa ya guardada con
`max_exceeded: silent` puede conservar el campo porque es configuración nativa
válida de Home Assistant.

## Compatibilidad

No cambia `.storage`, Storage version 1, WebSocket, REST, navegación,
personalización, responsive, selectores, Smart Home V3, Lighting, Energy
Advanced ni Support.
