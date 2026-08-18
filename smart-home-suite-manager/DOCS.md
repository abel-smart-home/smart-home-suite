# Smart Home Suite Manager 1.2.0

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

## Smart Home 1.4.0

Suite 1.2.0 conserva Smart Home Panel 2.0.5 y Native Dashboard Bridge 1.3.0 y amplía el runtime de la Suite para permitir:

- reordenar las cuatro tarjetas existentes;
- agregar tarjetas opcionales de valor, barra o gráfica;
- usar selector de entidad e icono MDI;
- configurar estilos y acciones tap/hold;
- conservar configuraciones anteriores sin migración destructiva.

La gráfica de historial se obtiene mediante WebSocket y utiliza caché para evitar consultar Recorder en cada actualización de estado.

## Smart Automations

Smart Automations 1.0.0 continúa como módulo oficial en `/smart-automations` y genera automatizaciones nativas de Home Assistant.

## Smart Support

La Suite continúa supervisando la disponibilidad de las acciones de cuenta utilizadas por Smart Support.

## Importante

No instales simultáneamente versiones standalone de los paneles ya incluidos en Smart Home Suite, porque podrían competir por rutas, servicios o almacenamiento.
