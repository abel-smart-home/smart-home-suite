# Abel Smart Home Suite

Repositorio de distribución de **Smart Home Suite** para Home Assistant OS sin HACS.

## Smart Home Suite 1.10.0 — PRE-RELEASE

**Último release estable:** Smart Home Suite **1.9.1**.

Smart Home Suite 1.10.0 propone la primera prueba responsive de **Smart Automations 1.2.0**, siguiendo el patrón ya validado en Smart Lighting y sin modificar el contrato de automatizaciones nativas.

### Versiones

- Smart Home Suite / Manager: **1.10.0 PRE-RELEASE**
- Smart Home: **1.4.0**
- Smart Lighting: **1.4.1**
- Smart Energy Advanced: **1.4.0**
- Smart Automations: **1.2.0**
- Smart Support: **1.2.0**

## Smart Automations 1.2.0

Conserva intactos:

- Smart Automations Panel V1.0.0;
- `smart-automations-layout.js` V1.0.0;
- `smart-automations-runtime.js` V1.0.0 / Color Picker Guard V1.0.0;
- `.storage/smart_automations.config` versión 1;
- REST API de automatizaciones nativas;
- recetas, validaciones, ownership/hash y `automation_id`;
- Personalización;
- Guardar/Cancelar;
- Importar/Exportar/Restablecer;
- selectores;
- navegación;
- ordenamiento;
- apariencia por tarjeta.

### Primera prueba responsive

Añade `smart-automations-responsive.js` V1.0.0:

- el ancho heredado de 520 px se conserva en móvil;
- desde tablet puede crecer progresivamente hasta 1000 px;
- usa `columns_mobile`, `columns_tablet` y `columns_desktop` ya existentes;
- usa container queries para responder al ancho real disponible;
- el resumen permanece a ancho completo;
- las tarjetas ocupan las primeras celdas del grid y permanecen alineadas desde la izquierda;
- cualquier `panel_max_width` personalizado distinto de 520 se respeta.

No existe migración y el responsive runtime no escribe configuración.

## Smart Lighting 1.4.1

Permanece sin cambios funcionales respecto al release estable 1.9.1.

## Distribución

La Suite se distribuye mediante Smart Home Suite Manager e imágenes multi-arquitectura en GHCR.

## Validación recomendada

1. Publica `v1.10.0` como **pre-release**.
2. Confirma `Actions → Builder` completamente verde.
3. Actualiza primero una instancia laboratorio.
4. Ejecuta `validate_only`.
5. Ejecuta `install_repair` con backup.
6. Prueba Smart Automations en móvil, tablet y PC.
7. Verifica creación, edición, toggle y eliminación de automatizaciones.
8. Solo después de completar el checklist, promover el mismo payload a estable.

## Rollback

Si la prueba falla, usa `restore_latest` desde Smart Home Suite Manager y reinicia Home Assistant.

## Importante

No instales simultáneamente versiones standalone de paneles ya incluidos en Smart Home Suite.
