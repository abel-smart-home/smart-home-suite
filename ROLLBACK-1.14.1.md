# Rollback · Smart Home Suite 1.14.1

## Suite

1. Smart Home Suite Manager → `restore_latest`.
2. Ejecutar.
3. Confirmar `RESTORE_OK`.
4. Reiniciar Home Assistant.
5. Recarga completa del frontend.

## Automatizaciones nativas

Una automatización que ya fue guardada con 1.14.1 puede conservar:

```yaml
max_exceeded: silent
```

después de restaurar la Suite, porque es un campo nativo válido de Home
Assistant y forma parte de la automatización guardada en HA.

Esto no rompe la automatización ni altera su lógica.

Si se desea volver exactamente al YAML anterior, puede volver a guardarse desde
Smart Automations 1.3.0 o retirarse manualmente el campo.

## Persistencia

No existe migración de `.storage`.
