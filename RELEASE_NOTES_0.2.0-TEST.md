# Smart Home Suite 0.2.0 — Smart Lighting Pilot (TEST)

No publicar este release hasta completar la prueba en HAOS.

## Nuevo

- Primer módulo productivo de Smart Home Suite: Smart Lighting.
- Registro automático del panel `/lighting` desde la integración central.
- Frontend servido desde `custom_components/smart_home_suite`; no requiere `/config/www`.
- Configuración persistente en `.storage` usando la clave legado `smart_lighting_panel`.
- WebSocket de lectura, guardado y restablecimiento integrado en la Suite.
- Module Manager básico y Options Flow para activar/desactivar Smart Lighting.
- Mantiene el comportamiento funcional de Smart Lighting Panel V1.0.3: áreas, dispositivos, tap/hold, more-info, selector de entidades, editor lateral, import/export y selector MDI nativo con fallback manual.

## Gate antes de release

- Builder amd64/aarch64 verde.
- Smart Home Suite Manager 0.2.0 visible como actualización.
- `INSTALLATION_OK` al actualizar desde Suite 0.1.0.
- Integración Smart Home Suite carga sin errores tras reinicio.
- `/lighting` aparece en sidebar y abre correctamente.
- Smart Lighting guarda y recupera configuración.
- Tap alterna entidad y hold abre Más información.
- Drawer/scroll estable.
- Selector MDI funciona o mantiene fallback `mdi:...` sin romper el editor.
- Desactivar/activar Smart Lighting desde Opciones elimina/restaura el panel tras recarga de la integración.
- `restore_latest` devuelve Suite 0.1.0 correctamente.
