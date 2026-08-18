# Smart Home Suite 1.6.0

## Smart Lighting 1.3.0 · Global Actions Layout

Smart Home Suite 1.6.0 promueve a **estable** el payload 1.6.0 validado previamente en Home Assistant OS.

La promoción no cambia el código funcional probado durante el pre-release. Mantiene Smart Lighting Panel V1.0.3 como frontend base y `smart-lighting-layout.js` V1.2.0 como extensión runtime.

### Novedades de Smart Lighting 1.3.0

- **Acciones globales** participa en el mismo orden visual que las áreas normales.
- Puede moverse arriba, abajo o entre cualquier área mediante ↑ / ↓.
- El orden de las áreas normales continúa almacenado en `areas[]`.
- La posición especial de Acciones globales se guarda en `global_actions.position`.
- **Apagar todo** y **Encender todo** pueden reordenarse mediante `global_actions.button_order`.
- Cada botón dispone de **Color activo** y **Color inactivo**.
- **Apagar todo** se considera activo cuando todas las entidades objetivo están apagadas.
- **Encender todo** se considera activo cuando todas las entidades objetivo están encendidas.
- Con estados mezclados ambos botones utilizan su color inactivo.
- Sin entidades válidas, los botones permanecen deshabilitados.
- Se conserva compatibilidad con el campo `color` de Suite 1.5.0 como fallback del nuevo color activo.
- Las acciones globales siguen trabajando dinámicamente con cualquier cantidad de entidades `light.*` y `switch.*`, eliminan duplicados y omiten entidades inexistentes, `unavailable` o `unknown`.

### Compatibilidad

Se conserva sin cambios:

- `.storage/smart_lighting_panel.config`
- storage version 1
- `smart_lighting_panel/config/get`
- `smart_lighting_panel/config/save`
- `smart_lighting_panel/config/reset`
- Smart Lighting Panel V1.0.3 como frontend base
- selector de entidades
- selector visual MDI y entrada manual `mdi:...`
- tap/hold y More Info nativo
- navegación
- responsive móvil/tablet/escritorio
- drawer de Personalización
- Guardar / Cancelar
- Importar / Exportar / Restablecer
- aislamiento del módulo

No requiere migración destructiva de configuración.

### Versiones

- Smart Home Suite / Manager: **1.6.0**
- Smart Lighting: **1.3.0**
- Smart Lighting base: **1.0.3**
- Lighting layout runtime: **1.2.0**
- Lighting ordering runtime: **1.1.0**
- Global Actions runtime: **1.1.0**
- Smart Home: **1.4.0**
- Smart Energy Advanced: **1.4.0**
- Smart Automations: **1.0.0**
- Smart Support: **1.1.2**

### Estado

**STABLE**

Esta publicación corresponde al mismo payload funcional que fue probado como pre-release. La promoción a estable actualiza únicamente documentación y estado de publicación.
