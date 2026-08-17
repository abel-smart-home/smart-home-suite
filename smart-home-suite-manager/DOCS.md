# Smart Home Suite Manager 1.1.0

## Instalar / actualizar / reparar

1. Selecciona `install_repair`.
2. Mantén `create_backup: true`.
3. Inicia la App una vez.
4. Confirma `PAYLOAD_VALIDATION_OK`.
5. Confirma `STAGED_VALIDATION_OK`.
6. Confirma `POST_INSTALL_VALIDATION_OK`.
7. Confirma `INSTALLATION_OK`.
8. Reinicia Home Assistant.

Si ya existe una instalación, el Manager crea un backup antes del reemplazo y conserva temporalmente la instalación anterior hasta que la nueva versión supere la validación final.

## Validar sin modificar

Selecciona `validate_only` para comprobar la integridad estructural del payload y, si existe, de la Suite instalada.

Esta acción no reemplaza archivos ni crea un nuevo backup.

Resultado correcto:

`VALIDATION_OK`

## Restaurar

Selecciona `restore_latest` y ejecuta la App.

El Manager verifica el archivo de backup y su contenido antes de activarlo.

Resultado correcto:

`RESTORE_OK`

Después reinicia Home Assistant.

## Smart Automations

Smart Home Suite 1.1.0 incorpora Smart Automations 1.0.0 como módulo oficial. Su panel vive en `/smart-automations`, conserva `smart_automations.config` y genera automatizaciones nativas de Home Assistant.

Las primeras recetas cubren iluminación por sol, apagado por ausencia, alertas de potencia y límites de kWh. El módulo puede habilitarse o deshabilitarse desde las opciones centrales de la Suite.

## Smart Support

La Suite continúa supervisando la disponibilidad de las acciones de cuenta utilizadas por Smart Support. Esta supervisión vive en la integración instalada; el Manager valida que los archivos correspondientes formen parte del payload antes de instalarlo.

## Importante

No instales simultáneamente versiones standalone de los paneles ya incluidos en Smart Home Suite, porque podrían competir por rutas, servicios o almacenamiento.
