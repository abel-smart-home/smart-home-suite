# Abel Smart Home Suite

Repositorio de distribución de **Smart Home Suite** para Home Assistant OS sin HACS.

## Smart Home Suite 1.14.1 — PRE-RELEASE

**Último release estable:** Smart Home Suite **1.14.0**.

Suite 1.14.1 es un bugfix localizado de **Smart Automations 1.3.1** para las
recetas `high_power` y `energy_limit`.

### Corrección principal

Alert Control V1.0.1 conserva `mode: single` como bloqueo intencional mientras
espera el rearme, pero ahora genera también:

`max_exceeded: silent`

Home Assistant puede intentar iniciar otra ejecución mientras la anterior sigue
esperando el umbral de rearme. En `single`, ese intento se rechaza. Antes se
registraba como warning `Already running`; ahora el intento sigue rechazándose,
pero sin generar el warning esperado.

### Lo que NO cambia

- umbral principal;
- histéresis/rearme;
- 1 o 2 avisos;
- retraso del segundo aviso;
- horario opcional;
- eventos fuera de horario siguen descartándose definitivamente;
- no se envía una notificación al comenzar el horario si el cruce ocurrió fuera;
- `.storage`;
- WebSocket;
- helpers;
- responsive;
- navegación;
- selectores;
- orden/personalización.

### Versiones

- Smart Home Suite / Manager: **1.14.1**
- Smart Home: **1.6.0**
- Smart Home Panel V3: **3.1.0**
- Smart Lighting: **1.4.1**
- Smart Energy Advanced: **1.5.3**
- Smart Automations: **1.3.1**
- Alert Control: **1.0.1**
- Smart Support: **1.2.0**

## Compatibilidad actual

Entorno objetivo de validación reportado:

- Home Assistant OS
- Core 2026.9.0
- Supervisor 2026.08.0
- Operating System 18.2
- Frontend 20260826.4
- ESPHome 2026.8.2

El cambio no depende de ESPHome: corrige la configuración de la automatización
nativa generada por Smart Automations.

## Smart Home V3 preservado

Suite 1.14.1 conserva íntegramente la arquitectura estable de 1.14.0:

- `smart-home-panel-v3.js` V3.1.0;
- `smart-home-native-v3.js` V1.0.0;
- Smart Home Panel V2.0.5 como fallback;
- Runtime V1.1.0;
- Card Layout V1.0.0;
- `layout_v3` schema 1;
- responsive 1 columna móvil / 4 columnas tablet-PC desde 700 px por defecto.

## Smart Automations 1.3.1

Cadena:

1. Smart Automations Panel V1.0.0
2. layout V1.0.0
3. Color Picker Guard V1.0.0
4. responsive V1.0.0
5. Alert Control V1.0.1

Las automatizaciones existentes no se reescriben automáticamente. Para aplicar
el fix a una automatización ya creada:

1. abre Smart Automations;
2. abre la tarjeta;
3. pulsa **Editar**;
4. revisa la configuración;
5. pulsa **Guardar**.

El YAML generado debe terminar con:

```yaml
mode: single
max_exceeded: silent
```

## Instalación de laboratorio

1. Actualiza Smart Home Suite Manager a 1.14.1.
2. Ejecuta `validate_only`.
3. Confirma `VALIDATION_OK`.
4. Ejecuta `install_repair` con `create_backup: true`.
5. Confirma `INSTALLATION_OK`.
6. Reinicia Home Assistant.
7. Vuelve a Guardar las alertas energéticas que quieras actualizar.
8. Completa `TEST-CHECKLIST-1.14.1.md`.

Mantener como **PRE-RELEASE** hasta validar el warning en HAOS 2026.9.0.
