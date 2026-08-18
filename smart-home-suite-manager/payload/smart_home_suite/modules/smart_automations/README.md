# Smart Automations 1.1.1 · STABLE

Versión estable validada en Home Assistant OS.

Smart Automations 1.1.1 conserva **Smart Automations Panel V1.0.0** como base funcional.

## Layout runtime V1.0.0

Añade:

- orden de categorías;
- orden de automatizaciones dentro de cada categoría;
- personalización de categorías;
- personalización visual individual por tarjeta.

## Color Picker Guard V1.0.0

Corrige el cierre prematuro del selector nativo de colores.

Los controles `<input type="color">` generan múltiples eventos `input` mientras el selector está abierto. El guard:

- intercepta únicamente esos eventos de color;
- actualiza la copia `_editSettings` sin reconstruir el DOM;
- deja que el evento `change` normal realice el preview al finalizar;
- conserva Guardar/Cancelar.

## Se conserva

- `.storage` `smart_automations.config`;
- Storage version 1;
- WebSocket existentes;
- recetas;
- `RECIPE_VERSION`;
- generación de automatizaciones nativas;
- activar/pausar;
- botón HA;
- Importar/Exportar/Restablecer;
- navegación;
- responsive;
- selectores MDI y entidades.

No requiere migración.
