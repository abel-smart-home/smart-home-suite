# Abel Smart Home Suite

Repositorio de distribución de **Smart Home Suite** para Home Assistant OS sin HACS.

## Smart Home Suite 1.14.2 — PRE-RELEASE

**Último release estable:** Smart Home Suite **1.14.0**.

**Pre-release anterior:** 1.14.1 — fix `mode: single + max_exceeded: silent`.

Suite 1.14.2 actualiza **Smart Automations a 1.3.2** y **Alert Control a 1.1.0**.

### Nuevo: aviso pendiente fuera del horario

En `Consumo elevado` y `Límite de kWh`, cuando el horario está activado, el usuario puede elegir:

- **Descartar el aviso** — comportamiento de 1.14.1 y valor predeterminado.
- **Dejar aviso pendiente** — espera hasta el siguiente inicio del horario.

En modo pendiente:

1. el cruce ocurre fuera del horario;
2. no se notifica en ese momento;
3. la automatización espera simultáneamente el inicio del horario o el rearme;
4. si se rearma antes, el aviso se cancela;
5. al iniciar el horario, sólo avisa si el sensor sigue por encima del límite principal;
6. si ya no supera el límite pero tampoco alcanzó el rearme, no avisa y mantiene el bloqueo hasta el rearme;
7. después conserva 1/2 avisos, segundo aviso y rearme configurados.

Se mantiene:

```yaml
mode: single
max_exceeded: silent
```

### Compatibilidad

El nuevo parámetro se guarda dentro de `instances[].params`:

`schedule_outside_behavior`

Valores:

- `discard`
- `pending`

No cambia:

- `.storage/smart_automations.config`
- Storage version 1
- WebSocket
- REST nativo
- helpers
- responsive
- navegación
- selectores
- orden/personalización
- Smart Home V3
- Lighting
- Energy Advanced
- Support

Configuraciones existentes reciben `discard` por defecto y no cambian de comportamiento.

### Limitación conocida

El aviso pendiente usa `wait_for_trigger` nativo y no crea helpers persistentes. Si Home Assistant se reinicia mientras está pendiente, la espera activa puede perderse.

### Versiones

- Suite / Manager: **1.14.2**
- Smart Home: **1.6.0** · Panel V3.1.0
- Smart Lighting: **1.4.1**
- Smart Energy Advanced: **1.5.3**
- Smart Automations: **1.3.2**
- Alert Control: **1.1.0**
- Smart Support: **1.2.0**

Publicar inicialmente como **PRE-RELEASE**.
