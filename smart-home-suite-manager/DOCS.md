# Smart Home Suite Manager 1.14.2 · PRE-RELEASE

## Smart Automations 1.3.2

Alert Control V1.1.0 añade un selector bajo Horario de notificaciones:

### Si el límite se alcanza fuera del horario

**Descartar el aviso**

Conserva exactamente el comportamiento de 1.14.1.

**Dejar aviso pendiente**

La ejecución espera:

- el siguiente `schedule_start`; o
- el cruce del umbral de rearme.

Si ocurre el rearme primero, termina sin aviso.

Si ocurre el inicio del horario primero:

- si el sensor sigue arriba del límite → notifica;
- si ya está debajo del límite pero todavía no alcanzó el rearme → no notifica y sigue bloqueada hasta el rearme;
- si ya se rearmó → termina.

## Dos avisos

Después del primer aviso pendiente, el segundo conserva la lógica existente:

- espera configurable;
- exige seguir arriba del límite;
- vuelve a comprobar horario;
- se cancela por rearme;
- no existe tercer aviso.

## Warning fix preservado

```yaml
mode: single
max_exceeded: silent
```

## Automatizaciones existentes

Instalar la Suite no reescribe YAML nativo.

Para adoptar el nuevo modo:

1. abrir la tarjeta;
2. Editar;
3. activar horario;
4. elegir `Dejar aviso pendiente`;
5. Guardar.

Marker esperado:

`energy-alert-control-1.1.0`

## Persistencia

Sin migración.

`smart_automations.config`, Storage version 1.

## Limitación

`wait_for_trigger` no es persistente a un reinicio completo de Home Assistant. No se crean helpers ocultos.

## Instalación

1. `validate_only`
2. `install_repair` con backup
3. reiniciar Home Assistant
4. recarga completa
5. completar `TEST-CHECKLIST-1.14.2.md`
