# Smart Home Suite 1.14.1 — PRE-RELEASE

## Smart Automations 1.3.1 · suppress expected `Already running` warnings

Este pre-release corrige un registro de advertencia observado en Home Assistant
Core 2026.9.0 con las recetas **Consumo elevado** y **Límite de kWh**.

### Causa

Alert Control usa intencionalmente:

```yaml
mode: single
```

Después de enviar el aviso puede mantener la ejecución activa mientras espera
que el sensor baje del umbral de rearme.

Si durante esa espera Home Assistant recibe otro intento de disparo —por
ejemplo, tras la recuperación de disponibilidad del sensor— `single` lo rechaza
correctamente, pero el nivel por defecto registra `Already running`.

### Corrección

Alert Control V1.0.1 genera:

```yaml
mode: single
max_exceeded: silent
```

La ejecución adicional sigue siendo rechazada. Sólo se elimina el warning
esperado.

### Comportamiento preservado

- 1 o 2 avisos;
- retraso configurable del segundo aviso;
- horario opcional;
- evento fuera de horario: descartado definitivamente;
- no hay aviso atrasado al iniciar el horario;
- segundo aviso vuelve a validar horario y límite;
- rearme/histéresis configurable;
- Home Assistant sigue siendo el motor;
- no se crean helpers;
- `.storage` versión 1 sin migración;
- responsive, orden, personalización, selectores y navegación sin cambios.

### Automatizaciones existentes

La instalación no reescribe automáticamente automatizaciones nativas.

Para aplicar el fix a una alerta existente:

1. abrirla desde Smart Automations;
2. Editar;
3. Guardar;
4. verificar en HA que aparezca `max_exceeded: silent`.

### Entorno objetivo de prueba

- Home Assistant Core 2026.9.0
- Supervisor 2026.08.0
- Home Assistant OS 18.2
- Frontend 20260826.4
- ESPHome 2026.8.2

### Versiones

- Suite / Manager: **1.14.1**
- Smart Automations: **1.3.1**
- Alert Control: **1.0.1**
- Último Stable: **1.14.0**

## Estado

**PRE-RELEASE / TEST**

Promover a estable únicamente después de comprobar que el intento duplicado
queda bloqueado sin una nueva notificación y sin warning en el registro.
