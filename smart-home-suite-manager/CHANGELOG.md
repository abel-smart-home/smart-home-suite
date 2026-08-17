# Changelog

## 0.3.0 - 2026-08-17 · TEST

- Conserva Smart Lighting Panel V1.0.3 exacto.
- Añade Smart Energy Advanced Panel V1.3.0 con frontend exacto.
- Añade Smart Support Panel V1.1.2 con frontend y lógica backend original adaptada al ciclo de vida de la Suite.
- Añade Smart Home Native Bridge V1.3.0 exacto.
- Smart Home captura automáticamente el frontend/backend V2.0.5 existentes antes de migrar.
- Smart Home se registra dinámicamente como dashboard Lovelace nativo `/smart-home`, sin crear un dashboard YAML nuevo.
- Añade selección independiente de los cuatro módulos desde Opciones.
- No publica release hasta completar pruebas reales en HAOS.

## 0.3.0 - 2026-08-17 · TEST correction

- Sustituye el frontend reconstruido de 0.2.0 por el archivo original completo de Smart Lighting Panel V1.0.3.
- Conserva el JavaScript original byte por byte.
- Corrige la clave de `.storage` a `smart_lighting_panel.config`, exactamente igual al componente independiente V1.0.3.
- Mantiene los WebSocket commands originales `smart_lighting_panel/config/get|save|reset`.
- Mantiene Smart Lighting como módulo 1.0.3; el cambio es exclusivamente de empaquetado/integración de Suite.
- Cambia el cache-buster del frontend para evitar reutilizar el JS incorrecto de 0.2.0.

## 0.2.0 - 2026-08-17

- Integra Smart Lighting Panel V1.0.3 como primer módulo de Smart Home Suite.
- Registra `/lighting` automáticamente sin YAML `panel_custom`.
- Sirve el frontend desde la propia integración.
- Añade Module Manager básico y opción activar/desactivar Smart Lighting.
- Conserva el storage key legado `smart_lighting_panel`.
- Mantiene instalación, backup, reparación y restore de Manager 0.1.0.

## 0.1.0 - 2026-08-17

- Infraestructura inicial validada en HAOS amd64.
