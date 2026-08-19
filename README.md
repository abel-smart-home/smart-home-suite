# Abel Smart Home Suite

Repositorio de distribución de **Smart Home Suite** para Home Assistant OS sin HACS.

## Smart Home Suite 1.11.0 — PRE-RELEASE

**Último release estable:** Smart Home Suite **1.10.0**.

Suite 1.11.0 actualiza **Smart Automations a 1.3.0** y añade control de avisos a las recetas:

- **Consumo elevado**
- **Límite de kWh**

Home Assistant continúa siendo el motor real de ejecución.

### Versiones

- Smart Home Suite / Manager: **1.11.0**
- Smart Home: **1.4.0**
- Smart Lighting: **1.4.1**
- Smart Energy Advanced: **1.4.0**
- Smart Automations: **1.3.0**
- Smart Support: **1.2.0**

## Smart Automations 1.3.0

Se conserva la cadena ya estable de 1.10.0:

- Smart Automations Panel V1.0.0
- layout runtime V1.0.0
- Color Picker Guard V1.0.0
- responsive runtime V1.0.0

Y se añade:

- `smart-automations-alert-control.js` V1.0.0

### Control de avisos

Cada automatización de Consumo elevado o Límite de kWh puede configurar:

- **1 o 2 avisos máximo por evento**
- retraso configurable para el segundo aviso
- horario de notificaciones opcional
- hora inicial y final configurables
- rangos que cruzan medianoche
- funcionamiento 24/7 si el horario está desactivado
- rearme controlado opcional
- umbral de rearme configurable

### Regla del horario

Si el evento se cumple fuera del horario configurado:

**se descarta y no se notifica después.**

No se crea una notificación pendiente para el inicio del horario.

Si se configuraron dos avisos, antes del segundo se comprueba nuevamente:

1. que el evento no haya sido rearmado;
2. que el sensor siga arriba del límite;
3. que todavía esté dentro del horario.

Si ya salió del horario, el segundo aviso también se descarta.

### Rearme / histéresis

Ejemplo:

- disparo: 6000 W
- rearme: 5500 W

Después del primer ciclo, la automatización permanece dentro de la misma ejecución `mode: single` hasta que el consumo baja de 5500 W.

Esto evita nuevos ciclos por oscilaciones pequeñas alrededor de 6000 W.

Si se desactiva el rearme controlado, se conserva el comportamiento natural de `numeric_state`: debe bajar y volver a cruzar el límite principal para disparar otra vez.

### Automatizaciones existentes

No se reescriben automáticamente.

Después de actualizar, una automatización existente continúa funcionando con su configuración nativa anterior hasta que un administrador:

1. abre la automatización desde Smart Automations;
2. revisa Control de avisos;
3. pulsa **Guardar**.

Esto evita sustituir silenciosamente configuraciones que pudieran haber sido editadas directamente en Home Assistant.

### Persistencia

No existe migración.

Se conserva:

`smart_automations.config`

Storage version:

`1`

Los nuevos parámetros viven dentro de `instances[].params`.

### Nota sobre reinicios

No se crean helpers persistentes. Las esperas `for` y `wait_for_trigger` son nativas de Home Assistant. Un reinicio o recarga de automatizaciones puede cancelar una espera activa; el siguiente ciclo requerirá volver a cruzar el umbral.

## Instalación de laboratorio

1. Actualiza el repositorio.
2. Actualiza Smart Home Suite Manager a 1.11.0.
3. Ejecuta `validate_only`.
4. Ejecuta `install_repair` con `create_backup: true`.
5. Confirma `INSTALLATION_OK`.
6. Reinicia Home Assistant.
7. Completa `TEST-CHECKLIST-1.11.0.md`.

**Mantener como PRE-RELEASE hasta completar pruebas reales.**
