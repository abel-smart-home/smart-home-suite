# Changelog

## 0.3.3 - 2026-08-17 · TEST

- Smart Home bridge persistido como recurso Lovelace.
- Smart Home deja de depender de una custom dashboard strategy.
- Dashboard Smart Home usa una vista panel normal con la tarjeta del bridge.
- Corrige listener one-shot de Smart Support al recargar la Config Entry.

## 0.3.2 - 2026-08-17 · TEST

- Corrige la carga del backend exacto Smart Home Panel V2.0.5.
- Elimina `importlib.import_module()` dentro del event loop.
- Usa importación relativa de paquete: `from ...legacy import smart_home_panel`.
- Mantiene sin cambios el dashboard storage, frontend V2.0.5 y bridge V1.3.0.
- Mantiene las correcciones de Smart Support introducidas en 0.3.1.

## 0.3.1 - 2026-08-17 · TEST

- Smart Home V2.0.5 ahora está incluido de forma autocontenida.
- Smart Home se crea como dashboard Lovelace storage persistente y visible en Ajustes → Dashboards.
- Eliminada la captura obligatoria desde instalaciones anteriores.
- Smart Support conserva `smart_support_panel.*` y registra descripciones de servicios sin integración separada.
- Limpieza explícita de módulos desactivados para evitar dashboards persistentes huérfanos.

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
