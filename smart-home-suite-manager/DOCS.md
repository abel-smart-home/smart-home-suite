# Smart Home Suite Manager 1.7.0 · PRE-RELEASE

## Instalar / actualizar / reparar

1. Selecciona `validate_only`.
2. Confirma `VALIDATION_OK`.
3. Selecciona `install_repair`.
4. Mantén `create_backup: true`.
5. Inicia la App.
6. Confirma `PAYLOAD_VALIDATION_OK`.
7. Confirma `STAGED_VALIDATION_OK`.
8. Confirma `POST_INSTALL_VALIDATION_OK`.
9. Confirma `INSTALLATION_OK`.
10. Reinicia Home Assistant.

## Smart Automations 1.1.0

### Orden

En **Personalización → Orden**:

- las categorías pueden moverse con ↑ / ↓;
- las automatizaciones pueden moverse con ↑ / ↓ dentro de su categoría;
- el orden de tarjetas persiste utilizando el array `instances` existente;
- el orden de categorías se guarda en `automation_layout.category_order`;
- cada categoría puede personalizar texto, icono y colores.

### Tarjetas

En **Personalización → Tarjetas** se puede personalizar cada automatización creada:

- título visible;
- texto secundario;
- icono MDI;
- colores de icono, título, detalle, fondo y borde;
- colores de estado activo/pausado/no disponible;
- tamaños de icono, título y detalle;
- mostrar/ocultar detalle y estado.

Esta personalización vive dentro de `instances[].params.appearance` y **no participa en `_buildNativeConfig()`**. Cambiarla no llama al endpoint de guardado de automatizaciones nativas.

### Restablecer

`Restablecer panel` continúa preservando `instances`, por lo que conserva automatizaciones administradas y su apariencia individual. Restablece la apariencia global, navegación y el orden/estilo de categorías.

## Restaurar

Selecciona `restore_latest`, ejecuta la App, confirma `RESTORE_OK` y reinicia Home Assistant.

## Importante

No instales simultáneamente versiones standalone de paneles ya incluidos en Smart Home Suite.
