# Smart Home Suite Manager 1.5.0 · PRE-RELEASE

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

## Smart Lighting 1.2.0

Conserva Smart Lighting Panel V1.0.3 como base y utiliza `smart-lighting-layout.js` V1.1.0.

### Reordenamiento conservado

- **Áreas → Orden de áreas:** mueve áreas completas con ↑ / ↓.
- **Áreas → Orden de dispositivos:** mueve cada luz o interruptor dentro de su propia área.
- Guardar persiste y Cancelar descarta.

### Acciones globales

En **Áreas → Acciones globales**:

- activa `Mostrar área de acciones`;
- configura título, icono y color del área;
- activa/desactiva **Apagar todo** y **Encender todo** por separado;
- configura texto, icono MDI y color de cada botón;
- elige alcance `Todos los configurados` o `Solo dispositivos visibles`;
- opcionalmente muestra el número de entidades disponibles.

Las acciones admiten `light.*` y `switch.*`, eliminan duplicados y omiten entidades inexistentes, `unavailable` o `unknown`.

No se crea una nueva clave `.storage`; la nueva configuración se guarda como `global_actions` dentro de `smart_lighting_panel.config`.

## Restaurar

Selecciona `restore_latest`, ejecuta la App, confirma `RESTORE_OK` y reinicia Home Assistant.

## Importante

No instales simultáneamente versiones standalone de paneles ya incluidos en Smart Home Suite.
