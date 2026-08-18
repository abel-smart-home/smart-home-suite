# Abel Smart Home Suite

Repositorio de distribución de **Smart Home Suite** para Home Assistant OS sin HACS.

## Smart Home Suite 1.6.0 — PRE-RELEASE

**Smart Home Suite 1.6.0** amplía **Smart Lighting a 1.3.0** sobre la versión 1.5.0 de acciones globales ya probada.

La actualización conserva **Smart Lighting Panel V1.0.3** como frontend base sin modificar y actualiza `smart-lighting-layout.js` a V1.2.0. El runtime mantiene Encender/Apagar todo y el reordenamiento anterior, y añade reordenamiento completo del área **Acciones globales**, orden configurable de sus botones y colores activo/inactivo.

- Smart Home Suite / Manager: **1.6.0**
- Smart Home: módulo **1.4.0** · Panel **2.0.5** + Native Dashboard Bridge **1.3.0** + Suite Runtime **1.1.0**
- Smart Lighting: **1.3.0** · base **1.0.3** + layout runtime **1.2.0**
- Smart Energy Advanced: **1.4.0** · base **1.3.1** + ordering runtime **1.0.0**
- Smart Automations: **1.0.0**
- Smart Support: **1.1.2**

Todos los módulos se instalan bajo `custom_components/smart_home_suite` y se administran desde una sola Config Entry.

## Smart Lighting 1.3.0

La ampliación se aplica mediante `smart-lighting-layout.js` V1.2.0; `smart-lighting-panel.js` V1.0.3 permanece intacto.

### Acciones globales mejoradas

En **Personalización → Áreas**:

- **Acciones globales** aparece dentro de **Orden de áreas** y puede moverse con ↑ / ↓ entre cualquier área normal;
- los botones **Apagar todo** y **Encender todo** pueden reordenarse entre sí;
- cada botón permite configurar **Color activo** y **Color inactivo**;
- **Apagar todo** se considera activo cuando todas las entidades objetivo están apagadas;
- **Encender todo** se considera activo cuando todas las entidades objetivo están encendidas;
- con estados mezclados ambos botones usan su color inactivo;
- sin entidades válidas los botones permanecen deshabilitados.

Se conservan título, iconos MDI, alcance, conteo, visibilidad individual y ejecución sobre cualquier cantidad de `light.*` y `switch.*`.

### Compatibilidad

- `.storage/smart_lighting_panel.config` permanece en versión 1;
- se conservan `smart_lighting_panel/config/get|save|reset`;
- `global_actions.position` guarda la posición del área;
- `global_actions.button_order` guarda el orden de botones;
- los colores antiguos `color` de 1.5.0 siguen siendo válidos como fallback del nuevo color activo;
- no existe migración destructiva;
- rollback compatible: builds anteriores ignoran campos nuevos que no reconocen;
- se conservan selector de entidades, selector MDI, navegación, responsive, tap/hold, More Info, Importar/Exportar/Restablecer y aislamiento del módulo.

## Smart Energy Advanced 1.4.0

Conserva el frontend base V1.3.1 y el ordering runtime V1.0.0 para reordenar secciones y widgets sin cambiar `.storage`.

## Smart Home 1.4.0

Conserva Smart Home Panel V2.0.5, Native Dashboard Bridge V1.3.0 y Suite Runtime V1.1.0 con tarjetas configurables/reordenables.

## Distribución y robustez

La Suite se distribuye mediante Smart Home Suite Manager e imágenes multi-arquitectura en GHCR. Incluye staging, validación previa/posterior, backups, rollback, `validate_only`, Repairs y diagnóstico.

## Instalación de pre-release

1. Agrega o actualiza el repositorio `https://github.com/abel-smart-home/smart-home-suite`.
2. Actualiza **Smart Home Suite Manager** a 1.6.0.
3. Ejecuta primero `validate_only`.
4. Ejecuta `install_repair` con `create_backup: true`.
5. Confirma `INSTALLATION_OK`.
6. Reinicia Home Assistant.
7. Completa `TEST-CHECKLIST-1.6.0.md` antes de promover el release a estable.
