# Smart Home Suite 1.14.2 — PRE-RELEASE

## Smart Automations 1.3.2 · aviso pendiente fuera del horario

Este pre-release amplía Alert Control a **V1.1.0**.

### Nuevo comportamiento configurable

Cuando `Limitar horario de notificaciones` está activo aparece:

**Si el límite se alcanza fuera del horario**

Opciones:

- **Descartar el aviso**
- **Dejar aviso pendiente**

`Descartar` es el valor predeterminado y conserva 1.14.1.

### Aviso pendiente

Si el límite se cruza fuera del horario:

1. no notifica en ese momento;
2. espera el siguiente inicio del horario o el rearme;
3. si rearma primero, cancela el evento;
4. si inicia el horario primero y el sensor sigue sobre el límite, notifica;
5. después aplica normalmente segundo aviso y rearme.

Si al iniciar el horario ya está por debajo del límite principal pero todavía no alcanzó el umbral de rearme:

- no notifica;
- no libera el ciclo;
- mantiene el bloqueo hasta alcanzar el rearme.

### Ejemplo

- límite: 500 kWh
- rearme: 480 kWh
- horario: 07:00–22:00
- fuera de horario: Pendiente

`06:30 → 505 kWh`

No avisa.

`07:00 → 510 kWh`

Avisa una vez y espera rearme `<480`.

Si antes de las 07:00 baja de 480, el aviso pendiente se cancela.

### Fix 1.14.1 preservado

```yaml
mode: single
max_exceeded: silent
```

No vuelve el warning esperado `Already running`.

### Compatibilidad

No cambia:

- `.storage/smart_automations.config` versión 1;
- WebSocket;
- REST;
- helpers;
- orden/personalización;
- Color Picker Guard;
- responsive;
- navegación;
- selectores;
- Smart Home V3;
- Lighting;
- Energy Advanced;
- Support.

Las configuraciones existentes usan `discard` si el nuevo parámetro no existe.

### Limitación conocida

El estado pendiente vive en una ejecución nativa con `wait_for_trigger`. Un reinicio completo de Home Assistant puede cancelar esa espera. No se añaden helpers persistentes.

### Versiones

- Suite / Manager: **1.14.2**
- Smart Automations: **1.3.2**
- Alert Control: **1.1.0**
- Último Stable: **1.14.0**

## Estado

**PRE-RELEASE / TEST**

Validar primero en HAOS antes de considerar estable.
