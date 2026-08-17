# Smart Home Suite 1.0.0 — Final Validation Checklist

Realizar estas pruebas en la VM/laboratorio antes de publicar `v1.0.0` como release estable.

## 1. GitHub Actions

Después de subir los archivos de 1.0.0 a `main`, verificar que **Builder** termine completamente en verde.

Esperado:

- `Validate release payload` ✅
- `RELEASE_VALIDATION_OK version=1.0.0 modules=4`
- `CI_VALIDATION_OK`
- `Build amd64` ✅
- `Build aarch64` ✅
- `Publish multi-arch manifest` ✅
- `MULTIARCH_PUBLISH_OK`

No continuar si alguna etapa falla.

## 2. Manager 1.0.0

Actualizar/refrescar el repositorio de Apps de Home Assistant.

Verificar:

- Smart Home Suite Manager muestra **1.0.0**.
- Ejecutar `validate_only`.
- Debe terminar en `VALIDATION_OK`.
- Ejecutar `install_repair` con backup habilitado.
- Debe crear/verificar backup y terminar en `INSTALLATION_OK`.
- Reiniciar Home Assistant.

## 3. Integración y salud general

Después del reinicio:

- Smart Home Suite carga sin errores.
- El sensor de versión muestra **1.0.0**.
- `binary_sensor.smart_home_suite_health` está `on` con la instalación normal.
- Diagnósticos se pueden descargar.
- No hay Repairs inesperados de módulos.

## 4. Regresión de módulos

Comprobar que no cambió el comportamiento productivo:

- Smart Home abre como dashboard de inicio.
- Smart Home conserva su configuración.
- Smart Lighting abre y controla entidades normalmente.
- Smart Energy Advanced abre y actualiza sus entidades normalmente.
- Smart Support abre y conserva su configuración.
- Activar/desactivar módulos desde Opciones sigue funcionando.

## 5. Smart Support con proveedor disponible

Con Spook cargado y el usuario de soporte configurado:

- En Smart Support, `Verificar` debe indicar que el soporte está listo.
- No debe existir el Repair `Smart Support requiere atención`.
- Suite Health debe permanecer `on`.

En los diagnósticos, dentro de `smart_support.provider`, comprobar:

- `provider: Spook`
- `required: true`
- `ready: true`
- `enable_user_available: true`
- `disable_user_available: true`
- `missing_actions: []`

Probar además:

1. Iniciar soporte.
2. Confirmar que el usuario queda activo.
3. Detener soporte manualmente.
4. Confirmar que el usuario queda inactivo.

No continuar con la prueba de fallo hasta confirmar que el usuario de soporte está INACTIVO.

## 6. Simulación de pérdida de Spook

**Solo en la VM/laboratorio.**

Con el usuario de soporte INACTIVO, hacer temporalmente que Spook no cargue y reiniciar Home Assistant.
Usar el método que ya utilices para deshabilitar/retirar temporalmente esa integración en el laboratorio.

Esperado:

- Smart Home sigue funcionando.
- Smart Lighting sigue funcionando.
- Smart Energy Advanced sigue funcionando.
- Smart Support abre, pero `Verificar` informa que Spook/las acciones no están disponibles.
- Aparece en **Ajustes → Reparaciones**: `Smart Support requiere atención`.
- El Repair indica cuál de las acciones falta.
- `binary_sensor.smart_home_suite_health` cambia a `off`.
- En diagnósticos:
  - `required: true`
  - `ready: false`
  - una o ambas acciones aparecen como `false`.

No intentar iniciar una sesión de soporte mientras el proveedor esté ausente.

## 7. Recuperación automática

Restaurar Spook en la VM y reiniciar Home Assistant.

Esperado:

- ambas acciones vuelven a estar disponibles;
- el Repair de Smart Support desaparece automáticamente;
- Suite Health vuelve a `on`;
- `Verificar` vuelve a indicar soporte listo;
- iniciar/detener una sesión vuelve a funcionar normalmente.

## 8. Dependencia no requerida

Prueba opcional pero recomendada:

- dejar Smart Support habilitado;
- retirar temporalmente el ID del usuario de soporte desde su configuración;
- guardar.

Esperado:

- `required: false` en diagnósticos;
- no se genera Repair por Spook;
- la ausencia del proveedor por sí sola no pone Suite Health en fallo.

Restaurar después el ID correcto y verificar nuevamente.

## 9. Backup / restore final

- Ejecutar `install_repair` una vez más para generar backup conocido de 1.0.0.
- Ejecutar `restore_latest` solo si deseas repetir la validación de recuperación.
- Reiniciar Home Assistant.
- Confirmar que los cuatro módulos continúan correctos.

## Resultado para release

Publicar `v1.0.0` únicamente cuando todos los puntos obligatorios hayan pasado.

Release final:

- Tag: `v1.0.0`
- Target: `main`
- Título: `Smart Home Suite v1.0.0 — Stable Baseline`
- **NO** marcar `Set as a pre-release`.
- Marcar como **Latest release**.
