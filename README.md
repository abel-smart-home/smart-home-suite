# Abel Smart Home Suite

Repositorio de distribución de **Smart Home Suite** para Home Assistant OS sin HACS.

## Smart Home Suite 1.5.0 — PRE-RELEASE

**Smart Home Suite 1.5.0** amplía **Smart Lighting a 1.2.0** sobre la versión de `main` que ya incorporaba el reordenamiento de áreas y dispositivos.

La actualización conserva **Smart Lighting Panel V1.0.3** como frontend base sin modificar y actualiza `smart-lighting-layout.js` a V1.1.0. El runtime conserva el reordenamiento V1.0.0 y añade acciones globales opcionales V1.0.0 para encender o apagar en una sola acción todas las entidades de iluminación configuradas en el panel.

- Smart Home Suite / Manager: **1.5.0**
- Smart Home: módulo **1.4.0** · Panel **2.0.5** + Native Dashboard Bridge **1.3.0** + Suite Runtime **1.1.0**
- Smart Lighting: **1.2.0** · base **1.0.3** + layout runtime **1.1.0**
- Smart Energy Advanced: **1.4.0** · base **1.3.1** + ordering runtime **1.0.0**
- Smart Automations: **1.0.0**
- Smart Support: **1.1.2**

Todos los módulos se instalan bajo `custom_components/smart_home_suite` y se administran desde una sola Config Entry.

## Smart Lighting 1.2.0

La ampliación se aplica mediante `smart-lighting-layout.js` V1.1.0; `smart-lighting-panel.js` V1.0.3 permanece intacto.

### Acciones globales opcionales

En **Personalización → Áreas → Acciones globales** puede activarse una sección adicional que aparece después de las áreas normales y contiene hasta dos botones:

- **Apagar todo**
- **Encender todo**

Características:

- la sección está oculta por defecto para conservar exactamente el aspecto anterior;
- cada botón puede mostrarse u ocultarse individualmente;
- título, icono y colores son configurables;
- los iconos conservan el selector MDI nativo y la entrada manual `mdi:...`;
- el alcance puede ser **Todos los configurados** o **Solo dispositivos visibles**;
- se admiten entidades `light.*` y `switch.*`;
- las entidades duplicadas se ejecutan una sola vez;
- se omiten entidades inexistentes, `unavailable` o `unknown`;
- la cantidad de entidades disponibles puede mostrarse en el encabezado del área;
- si no hay entidades válidas, los botones quedan deshabilitados;
- Home Assistant continúa siendo quien ejecuta `homeassistant.turn_on` y `homeassistant.turn_off`.

### Reordenamiento conservado

- orden configurable de áreas con ↑ / ↓;
- orden configurable de dispositivos dentro de su propia área;
- vista previa inmediata;
- Guardar persiste y Cancelar descarta;
- áreas y dispositivos futuros aparecen automáticamente.

### Compatibilidad

- `.storage/smart_lighting_panel.config` permanece en versión 1;
- se conservan `smart_lighting_panel/config/get|save|reset`;
- no existe migración destructiva;
- la configuración previa sigue siendo válida y las acciones globales permanecen ocultas hasta activarlas;
- el nuevo objeto opcional `global_actions` puede permanecer en `.storage` incluso tras rollback: las versiones anteriores simplemente no lo utilizan;
- se conservan selector de entidades, selector MDI, navegación, responsive, tap/hold, More Info, Importar/Exportar/Restablecer y aislamiento del módulo.

## Smart Energy Advanced 1.4.0

Conserva el frontend base V1.3.1 y el ordering runtime V1.0.0 para reordenar secciones y widgets sin cambiar `.storage`.

## Smart Home 1.4.0

Conserva Smart Home Panel V2.0.5, Native Dashboard Bridge V1.3.0 y Suite Runtime V1.1.0 con tarjetas configurables/reordenables.

## Distribución y robustez

La Suite se distribuye mediante Smart Home Suite Manager e imágenes multi-arquitectura en GHCR. Incluye staging, validación previa/posterior, backups, rollback, `validate_only`, Repairs y diagnóstico.

## Instalación de pre-release

1. Agrega o actualiza el repositorio `https://github.com/abel-smart-home/smart-home-suite`.
2. Actualiza **Smart Home Suite Manager** a 1.5.0.
3. Ejecuta primero `validate_only`.
4. Ejecuta `install_repair` con `create_backup: true`.
5. Confirma `INSTALLATION_OK`.
6. Reinicia Home Assistant.
7. Completa `TEST-CHECKLIST-1.5.0.md` antes de promover el release a estable.
