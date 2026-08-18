# Abel Smart Home Suite

Repositorio de distribución de **Smart Home Suite** para Home Assistant OS sin HACS.

## Smart Home Suite 1.7.0 — PRE-RELEASE

**Último release estable:** Smart Home Suite **1.6.0**.

`main` 1.7.0 actualiza **Smart Automations a 1.1.0** mediante `smart-automations-layout.js` V1.0.0, conservando **Smart Automations Panel V1.0.0** como frontend funcional base.

La ampliación añade orden configurable de categorías y automatizaciones, además de personalización visual por tarjeta, sin cambiar la automatización nativa de Home Assistant.

- Smart Home Suite / Manager: **1.7.0**
- Smart Home: módulo **1.4.0** · Panel **2.0.5** + Bridge **1.3.0** + runtime **1.1.0**
- Smart Lighting: **1.3.0** · base **1.0.3** + layout runtime **1.2.0**
- Smart Energy Advanced: **1.4.0** · base **1.3.1** + ordering runtime **1.0.0**
- Smart Automations: **1.1.0** · base **1.0.0** + layout runtime **1.0.0**
- Smart Support: **1.1.2**

## Smart Automations 1.1.0

En **Personalización → Orden**:

- reordena Iluminación, Presencia y Energía con ↑ / ↓;
- reordena las automatizaciones dentro de su propia categoría;
- personaliza texto/icono/colores de cada categoría.

En **Personalización → Tarjetas** cada automatización puede configurar:

- título visible independiente del nombre nativo;
- texto secundario independiente del resumen automático;
- icono MDI;
- color de icono;
- color/tamaño de título y detalle;
- fondo y borde;
- colores para Activa, Pausada y No encontrada;
- visibilidad del detalle y del estado.

Todo lo anterior es **metadato visual en `smart_automations.config`**. Home Assistant continúa siendo el motor de ejecución y no se reescriben triggers/actions al cambiar apariencia u orden.

## Compatibilidad

- `.storage` permanece en versión 1;
- se conserva la clave `smart_automations.config`;
- se conservan los WebSocket existentes;
- no se cambia `RECIPE_VERSION`;
- no se cambia la generación de automatizaciones nativas;
- rollback compatible: Smart Automations 1.0.0 ignora `automation_layout` y `params.appearance`;
- Importar/Exportar/Restablecer, navegación, responsive, selectores y permisos permanecen.

## Distribución

La Suite se distribuye mediante Smart Home Suite Manager e imágenes multi-arquitectura en GHCR.

## Instalación de prueba

1. Actualiza el repositorio.
2. Instala/actualiza **Smart Home Suite Manager 1.7.0**.
3. Ejecuta `validate_only`.
4. Ejecuta `install_repair` con `create_backup: true`.
5. Confirma `INSTALLATION_OK`.
6. Reinicia Home Assistant.
7. Completa `TEST-CHECKLIST-1.7.0.md`.

Esta versión debe mantenerse como **pre-release** hasta terminar las pruebas reales en HAOS.
