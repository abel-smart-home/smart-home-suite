# Smart Home Suite Manager 1.11.0 · PRE-RELEASE

## Instalar

1. `validate_only`
2. Confirmar `VALIDATION_OK`
3. `install_repair`
4. `create_backup: true`
5. Confirmar:
   - `PAYLOAD_VALIDATION_OK`
   - `STAGED_VALIDATION_OK`
   - `POST_INSTALL_VALIDATION_OK`
   - `INSTALLATION_OK`
6. Reiniciar Home Assistant.
7. Hacer recarga completa del frontend.

## Smart Automations 1.3.0

### Recetas afectadas

- Consumo elevado
- Límite de kWh

Iluminación por sol y Apagar luces al salir conservan su configuración nativa anterior.

### Parámetros nuevos

- Número máximo de avisos: 1 / 2.
- Segundo aviso después de: 1–1440 minutos.
- Limitar horario: Sí / No.
- Desde / Hasta.
- Rearme controlado: Sí / No.
- Rearmar cuando baje de: configurable.

### Horario

Desactivado = 24/7.

Activado = la condición horaria se evalúa cuando se cumple el disparo.

Fuera del horario:
- no notifica;
- no espera a la hora inicial;
- no recupera la notificación después.

Los rangos pueden cruzar medianoche.

### Segundo aviso

Si está activado:
- espera el tiempo configurado;
- se cancela si antes se alcanza el umbral de rearme;
- al finalizar la espera comprueba que el sensor siga arriba del límite;
- comprueba nuevamente el horario;
- sólo entonces notifica.

### Rearme

Con rearme controlado activo, la ejecución permanece en `mode: single` hasta cruzar hacia abajo el valor configurado.

El valor de rearme debe ser:
- mayor que cero;
- igual o menor que el límite de disparo.

### Aplicar a una automatización existente

La actualización no toca automatizaciones nativas automáticamente.

Abre **Editar** en la tarjeta y pulsa **Guardar** para generar la nueva receta.

Si la tarjeta muestra **Modificada en HA**, revisa primero la automatización nativa: Guardar desde Smart Automations sigue reemplazando su configuración, igual que antes.

## Restore

`restore_latest` → `RESTORE_OK` → reiniciar Home Assistant.
