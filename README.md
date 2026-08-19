# Abel Smart Home Suite

Repositorio de distribución de **Smart Home Suite** para Home Assistant OS sin HACS.

## Smart Home Suite 1.10.0 — STABLE

**Último release estable:** Smart Home Suite **1.10.0**.

Smart Home Suite 1.10.0 incorpora como estable el responsive adaptativo de **Smart Automations 1.2.0**, siguiendo el mismo enfoque aislado utilizado en Smart Lighting y manteniendo intacto el contrato de automatizaciones nativas de Home Assistant.

### Versiones

- Smart Home Suite / Manager: **1.10.0**
- Smart Home: **1.4.0**
- Smart Lighting: **1.4.1**
- Smart Energy Advanced: **1.4.0**
- Smart Automations: **1.2.0**
- Smart Support: **1.2.0**

## Smart Automations 1.2.0

Arquitectura conservada:

- Smart Automations Panel V1.0.0;
- `smart-automations-layout.js` V1.0.0;
- `smart-automations-runtime.js` V1.0.0;
- Color Picker Guard V1.0.0;
- `smart-automations-responsive.js` V1.0.0;
- `.storage/smart_automations.config` versión 1.

### Responsive móvil / tablet / PC

El runtime responsive estable:

- conserva el formato móvil con el ancho heredado de 520 px;
- permite que ese layout aproveche progresivamente hasta 1000 px en tablet/PC;
- respeta `columns_mobile`, `columns_tablet` y `columns_desktop`;
- utiliza container queries para responder al ancho real disponible dentro de Home Assistant;
- mantiene el resumen a ancho completo;
- distribuye las tarjetas desde la izquierda;
- deja vacías las celdas restantes cuando una categoría tiene menos tarjetas que columnas;
- respeta cualquier `panel_max_width` personalizado distinto de 520.

### Contrato de automatizaciones

No cambia:

- creación de automatizaciones nativas;
- edición;
- eliminación;
- activar/desactivar;
- REST `config/automation/config/*`;
- recetas;
- validaciones;
- `automation_id`;
- ownership/hash;
- detección de modificaciones externas.

Home Assistant continúa siendo el motor real de ejecución.

### Personalización

Se conserva:

- Guardar;
- Cancelar;
- Importar;
- Exportar;
- Restablecer;
- selector de entidades;
- selector MDI;
- orden de categorías;
- orden de tarjetas;
- apariencia individual;
- navegación;
- Color Picker Guard.

### Persistencia

No existe migración.

La configuración sigue usando:

`smart_automations.config`

Storage version:

`1`

El runtime responsive no escribe configuración automáticamente.

## Smart Lighting 1.4.1

Permanece estable con:

- responsive móvil/tablet/PC;
- `columns_mobile`, `columns_tablet`, `columns_desktop`;
- Global Actions alineadas con el grid en tablet/PC;
- `.storage` sin migración.

## Distribución

La Suite se distribuye mediante **Smart Home Suite Manager** e imágenes multi-arquitectura publicadas en GHCR:

`ghcr.io/abel-smart-home/smart-home-suite-manager:1.10.0`

Arquitecturas:

- `amd64`
- `aarch64`

## Instalación / actualización

1. Actualiza Smart Home Suite Manager.
2. Ejecuta `validate_only`.
3. Confirma `VALIDATION_OK`.
4. Cambia a `install_repair`.
5. Mantén `create_backup: true`.
6. Ejecuta el Manager.
7. Confirma:
   - `PAYLOAD_VALIDATION_OK`
   - `STAGED_VALIDATION_OK`
   - `POST_INSTALL_VALIDATION_OK`
   - `INSTALLATION_OK`
8. Reinicia Home Assistant.
9. Realiza una recarga completa del frontend si el navegador/app conserva recursos antiguos.

## Rollback

Si una actualización falla:

1. abre Smart Home Suite Manager;
2. selecciona `restore_latest`;
3. ejecuta;
4. confirma `RESTORE_OK`;
5. reinicia Home Assistant;
6. realiza una recarga completa del frontend.

## Política de actualización recomendada

Para instalaciones de clientes:

1. validar nuevas versiones primero en una instancia laboratorio;
2. mantener Home Assistant y Smart Home Suite en combinaciones certificadas;
3. actualizar manualmente después de probar;
4. conservar backup antes de `install_repair`.

## Importante

No instales simultáneamente versiones standalone de paneles ya incluidos en Smart Home Suite.
