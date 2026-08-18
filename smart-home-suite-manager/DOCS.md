# Smart Home Suite Manager 1.6.0 · STABLE

## Instalar / actualizar / reparar

1. Selecciona `validate_only` para comprobar primero la instalación actual.
2. Para actualizar, selecciona `install_repair`.
3. Mantén `create_backup: true`.
4. Inicia la App una vez.
5. Confirma `PAYLOAD_VALIDATION_OK`.
6. Confirma `STAGED_VALIDATION_OK`.
7. Confirma `POST_INSTALL_VALIDATION_OK`.
8. Confirma `INSTALLATION_OK`.
9. Reinicia Home Assistant.

El Manager conserva staging, backup y rollback.

## Smart Lighting 1.3.0

Conserva Smart Lighting Panel V1.0.3 como base y utiliza `smart-lighting-layout.js` V1.2.0.

### Orden de áreas

- **Acciones globales** aparece junto con las áreas normales en **Áreas → Orden de áreas**.
- Usa ↑ / ↓ para colocarla arriba, abajo o entre otras áreas.
- El orden de las áreas normales continúa persistiendo en `areas[]`.
- La posición especial se guarda en `global_actions.position`.

### Orden de botones globales

En **Áreas → Acciones globales → Orden de botones**:

- reordena **Apagar todo** y **Encender todo** con ↑ / ↓;
- el orden se guarda en `global_actions.button_order`;
- Guardar persiste y Cancelar descarta.

### Colores por estado

Cada botón dispone de:

- **Color activo**;
- **Color inactivo**.

**Apagar todo** está activo cuando todas las entidades objetivo están apagadas. **Encender todo** está activo cuando todas están encendidas. Con estados mezclados ambos usan el color inactivo. Sin entidades válidas permanecen deshabilitados.

Los campos `color` existentes de 1.5.0 se conservan como fallback para el nuevo color activo, por lo que no se pierde personalización previa.

## Restaurar

Selecciona `restore_latest`, ejecuta la App, confirma `RESTORE_OK` y reinicia Home Assistant.

## Importante

No instales simultáneamente versiones standalone de paneles ya incluidos en Smart Home Suite.
