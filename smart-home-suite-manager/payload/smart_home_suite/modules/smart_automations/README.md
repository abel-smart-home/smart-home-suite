# Smart Automations 1.1.1

Bugfix sobre Smart Automations 1.1.0.

## Corrección

Smart Automations Panel V1.0.0 realiza preview inmediato de los campos `settings.*`. Los controles `input[type="color"]` emiten múltiples eventos `input` mientras el selector nativo está abierto.

En 1.1.0 esos eventos causaban un rerender completo, cerrando el selector de color antes de terminar.

Smart Automations 1.1.1 añade `smart-automations-runtime.js` V1.0.0:

- intercepta únicamente `input` de campos de color en Personalización;
- actualiza `_editSettings` sin renderizar;
- deja que el evento `change` existente haga el render normal;
- no altera otros tipos de campo.

## Se conserva

- Smart Automations Panel V1.0.0;
- Layout runtime V1.0.0;
- orden de categorías;
- orden de automatizaciones;
- personalización individual;
- `.storage` `smart_automations.config`;
- Storage version 1;
- WebSocket existentes;
- generación de automatizaciones nativas;
- Guardar/Cancelar;
- Importar/Exportar/Restablecer;
- navegación, responsive y selectores.

No requiere migración.
