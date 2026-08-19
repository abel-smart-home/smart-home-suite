# Abel Smart Home Suite

Repositorio de distribución de **Smart Home Suite** para Home Assistant OS sin HACS.

## Smart Home Suite 1.11.0 — STABLE

**Último release estable:** Smart Home Suite **1.11.0**.

Smart Home Suite 1.11.0 promueve a estable la versión validada previamente como pre-release y actualiza **Smart Automations a 1.3.0** con control de avisos para:

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

Arquitectura conservada:

- Smart Automations Panel V1.0.0
- `smart-automations-layout.js` V1.0.0
- Color Picker Guard V1.0.0
- `smart-automations-responsive.js` V1.0.0
- `smart-automations-alert-control.js` V1.0.0

### Control de avisos

Cada automatización de Consumo elevado o Límite de kWh puede configurar:

- 1 o 2 avisos máximo por evento;
- retraso configurable para el segundo aviso;
- horario de notificaciones opcional;
- hora inicial y final configurables;
- rangos que cruzan medianoche;
- funcionamiento 24/7 si el horario está desactivado;
- rearme controlado opcional;
- umbral de rearme configurable.

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

## Distribución

La Suite se distribuye mediante **Smart Home Suite Manager** e imágenes multi-arquitectura publicadas en GHCR:

`ghcr.io/abel-smart-home/smart-home-suite-manager:1.11.0`

Arquitecturas:

- `amd64`
- `aarch64`

## Instalación / actualización

1. Actualiza Smart Home Suite Manager.
2. Ejecuta `validate_only`.
3. Confirma `VALIDATION_OK`.
4. Cambia a `install_repair`.
5. Mantén `create_backup: true`.
6. Ejecuta el Manager.
7. Confirma:
   - `PAYLOAD_VALIDATION_OK`
   - `STAGED_VALIDATION_OK`
   - `POST_INSTALL_VALIDATION_OK`
   - `INSTALLATION_OK`
8. Reinicia Home Assistant.
9. Realiza una recarga completa del frontend si el navegador/app conserva recursos antiguos.

## Rollback

Si una actualización falla:

1. abre Smart Home Suite Manager;
2. selecciona `restore_latest`;
3. ejecuta;
4. confirma `RESTORE_OK`;
5. reinicia Home Assistant;
6. realiza una recarga completa del frontend.

## Política de actualización recomendada

Para instalaciones de clientes:

1. validar nuevas versiones primero en una instancia laboratorio;
2. mantener Home Assistant y Smart Home Suite en combinaciones certificadas;
3. actualizar manualmente después de probar;
4. conservar backup antes de `install_repair`.

## Importante

No instales simultáneamente versiones standalone de paneles ya incluidos en Smart Home Suite.
