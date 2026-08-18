# Smart Home Suite Manager 1.4.0 · PRE-RELEASE

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

El Manager conserva el mecanismo existente de staging, backup y rollback.

## Smart Lighting 1.1.0

La versión 1.1.0 conserva Smart Lighting Panel 1.0.3 como base y añade `smart-lighting-layout.js` 1.0.0.

### Reordenamiento

- **Áreas → Orden de áreas:** mueve áreas completas con ↑ / ↓.
- **Áreas → Orden de dispositivos:** mueve cada luz o interruptor con ↑ / ↓ dentro de su propia área.
- La vista previa usa la copia de trabajo actual.
- **Guardar** persiste el orden en la configuración existente.
- **Cancelar** descarta el cambio.
- No se crea una nueva clave `.storage` ni una nueva versión de storage.
- Áreas y dispositivos futuros aparecen automáticamente.
- No se cambia la pertenencia de un dispositivo a un área; solo su posición dentro de ella.

## Smart Energy Advanced 1.4.0

La versión 1.4.0 conserva Smart Energy Advanced Panel 1.3.1 como base y añade `smart-energy-advanced-layout.js` 1.0.0.

### Reordenamiento

- **General → Orden de secciones:** mueve secciones completas con ↑ / ↓.
- **Datos → Orden de widgets eléctricos:** mueve cada widget con ↑ / ↓ dentro de su propia sección.
- La vista previa usa la copia de trabajo actual.
- **Guardar** persiste el orden en la configuración existente.
- **Cancelar** descarta el cambio.
- No se crea una nueva clave `.storage`.
- Widgets y secciones futuros aparecen automáticamente.
- El gráfico nativo de fuentes de energía sigue unido a `realtime`.

## Restaurar

Selecciona `restore_latest` y ejecuta la App.

Resultado correcto:

`RESTORE_OK`

Después reinicia Home Assistant.

## Importante

No instales simultáneamente versiones standalone de los paneles ya incluidos en Smart Home Suite, porque podrían competir por rutas, servicios o almacenamiento.
