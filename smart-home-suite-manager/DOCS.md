# Smart Home Suite Manager 0.2.0

## Instalar / actualizar / reparar

1. Selecciona `install_repair`.
2. Mantén `create_backup: true`.
3. Inicia la App una vez.
4. Confirma `INSTALLATION_OK`.
5. Reinicia Home Assistant.

La actualización desde 0.1.0 crea un backup antes de instalar 0.2.0.

Después del reinicio, la integración existente **Smart Home Suite** debe seguir configurada y aparecerá el módulo **Smart Lighting** en `/lighting`.

## Restaurar

Selecciona `restore_latest` y ejecuta la App. Un resultado correcto termina en `RESTORE_OK`.

## Importante para el piloto

No instales el componente standalone `smart_lighting_panel` al mismo tiempo en la VM de prueba. La Suite 0.2.0 ya incorpora su backend y panel.

## Validación sin modificar

Selecciona `validate_only` para comprobar la integridad estructural del payload
incluido y de la Suite instalada. Esta acción no reemplaza archivos ni crea
backups. Una validación correcta termina en `VALIDATION_OK`.
