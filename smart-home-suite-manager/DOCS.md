# Smart Home Suite Manager 1.11.0 · STABLE

## Instalar / actualizar

1. Ejecuta `validate_only`.
2. Confirma `VALIDATION_OK`.
3. Ejecuta `install_repair`.
4. Mantén `create_backup: true`.
5. Confirma:
   - `PAYLOAD_VALIDATION_OK`
   - `STAGED_VALIDATION_OK`
   - `POST_INSTALL_VALIDATION_OK`
   - `INSTALLATION_OK`
6. Reinicia Home Assistant.
7. Haz una recarga completa del frontend.

## Smart Automations 1.3.0

### Recetas afectadas

- Consumo elevado
- Límite de kWh

Iluminación por sol y Apagar luces al salir conservan su configuración nativa anterior.

### Parámetros

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

El valor de rearme debe ser mayor que cero e igual o menor que el límite de disparo.

### Automatizaciones existentes

La actualización no toca automatizaciones nativas automáticamente.

Abre **Editar** en la tarjeta y pulsa **Guardar** para generar la nueva receta.

Si la tarjeta muestra **Modificada en HA**, revisa primero la automatización nativa: Guardar desde Smart Automations sigue reemplazando su configuración, igual que antes.

## Restore

`restore_latest` → `RESTORE_OK` → reiniciar Home Assistant.

## Importante

La promoción de 1.11.0 PRE-RELEASE a 1.11.0 STABLE no cambia ningún archivo funcional del payload.
