# Smart Automations 1.1.0

Smart Automations 1.1.0 conserva **Smart Automations Panel V1.0.0** como base funcional y añade `smart-automations-layout.js` V1.0.0.

Home Assistant continúa siendo el motor de ejecución: las automatizaciones generadas son automatizaciones nativas.

## Recetas conservadas

- encender/apagar luces al amanecer/anochecer;
- apagar luces cuando la casa queda vacía;
- notificación por potencia elevada;
- notificación por límite de kWh.

## Orden

**Personalización → Orden** permite:

- mover categorías;
- mover automatizaciones dentro de cada categoría;
- personalizar texto/icono/colores de categoría.

Las instancias siguen almacenadas en el mismo array `instances`; no existe migración destructiva.

## Apariencia individual

**Personalización → Tarjetas** permite configurar por automatización:

- título visible;
- texto secundario;
- icono MDI;
- colores de icono, título, detalle, fondo y borde;
- colores de estado;
- tamaños;
- visibilidad del detalle/estado.

Los datos viven en `instances[].params.appearance`.

## Seguridad funcional

La apariencia y el orden **no se incorporan a `_buildNativeConfig()`** y no alteran triggers, conditions ni actions. El editor funcional original continúa siendo el único que guarda la automatización nativa.

## Persistencia y rollback

- clave: `smart_automations.config`;
- Storage version: 1;
- WebSocket: sin cambios;
- rollback a 1.6.0/Smart Automations 1.0.0 compatible: las claves nuevas son ignoradas;
- Importar/Exportar conserva los metadatos nuevos.
