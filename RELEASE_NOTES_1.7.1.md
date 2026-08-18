# Smart Home Suite 1.7.1

## Smart Automations 1.1.1 · orden, personalización y selector de colores estable

Smart Home Suite 1.7.1 promueve a **STABLE** el payload validado previamente como pre-release en Home Assistant OS.

### Smart Automations 1.1.1

Incluye todas las mejoras de Smart Automations 1.1.0:

- orden configurable de categorías;
- orden configurable de automatizaciones dentro de su propia categoría;
- texto, icono y colores configurables por categoría;
- personalización visual individual por automatización;
- título visible independiente del alias nativo;
- texto secundario personalizable;
- icono MDI;
- colores y tamaños de icono, título y detalle;
- fondo y borde de tarjeta;
- colores Activa, Pausada y No encontrada;
- mostrar/ocultar detalle y estado.

### Corrección del selector de colores

Smart Automations 1.1.1 añade `smart-automations-runtime.js` V1.0.0 con **Color Picker Guard V1.0.0**.

Corrige el cierre prematuro del selector nativo de colores durante la selección.

- los eventos `input` de color actualizan únicamente la copia temporal de Personalización;
- no se reconstruye el control mientras el selector permanece abierto;
- el evento `change` existente aplica el preview al terminar;
- Guardar persiste;
- Cancelar revierte;
- los demás inputs conservan su comportamiento.

### Seguridad y compatibilidad

- Smart Automations Panel V1.0.0 permanece intacto.
- `smart-automations-layout.js` V1.0.0 permanece intacto.
- `.storage` sigue siendo `smart_automations.config`, versión 1.
- No cambia `RECIPE_VERSION`.
- No cambia `_buildNativeConfig()`.
- Los cambios visuales no reescriben triggers, conditions ni actions.
- Home Assistant continúa siendo el motor de ejecución.
- Se conservan navegación, responsive, Importar/Exportar/Restablecer, selectores y permisos.
- No requiere migración.
- Rollback compatible.

### Versiones

- Smart Home Suite / Manager: **1.7.1**
- Smart Home: **1.4.0**
- Smart Lighting: **1.3.0**
- Smart Energy Advanced: **1.4.0**
- Smart Automations: **1.1.1**
- Smart Automations base frontend: **1.0.0**
- Smart Automations layout runtime: **1.0.0**
- Color Picker Guard: **1.0.0**
- Smart Support: **1.1.2**

### Estado

**STABLE**

La promoción a estable no modifica el payload funcional que pasó las pruebas del pre-release.
