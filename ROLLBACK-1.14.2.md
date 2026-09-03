# Rollback · Smart Home Suite 1.14.2

## Suite

1. Smart Home Suite Manager → `restore_latest`.
2. Ejecutar.
3. Confirmar `RESTORE_OK`.
4. Reiniciar Home Assistant.
5. Recarga completa.

## `.storage`

No hay migración.

El parámetro `schedule_outside_behavior` puede permanecer dentro de `instances[].params`; versiones anteriores lo ignoran.

## Automatizaciones nativas

Una automatización ya guardada con Alert Control 1.1.0 puede conservar su YAML nativo después de restaurar la Suite.

Para volver exactamente a la receta anterior:

- Guardar nuevamente desde una versión anterior de Smart Automations; o
- restaurar la automatización desde backup.

`max_exceeded: silent` es configuración nativa válida de Home Assistant.
