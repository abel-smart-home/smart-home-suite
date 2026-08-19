# Smart Home Suite Manager 1.10.0 · STABLE

## Versiones

- Suite / Manager: **1.10.0**
- Smart Home: **1.4.0**
- Smart Lighting: **1.4.1**
- Smart Energy Advanced: **1.4.0**
- Smart Automations: **1.2.0**
- Smart Support: **1.2.0**

## Instalar / actualizar / reparar

1. Actualiza Smart Home Suite Manager a 1.10.0.
2. Selecciona `validate_only`.
3. Confirma `VALIDATION_OK`.
4. Selecciona `install_repair`.
5. Mantén `create_backup: true`.
6. Configura `keep_backups` entre 1 y 10.
7. Ejecuta la App.
8. Confirma:
   - `PAYLOAD_VALIDATION_OK`
   - `STAGED_VALIDATION_OK`
   - `POST_INSTALL_VALIDATION_OK`
   - `INSTALLATION_OK`
9. Reinicia Home Assistant.
10. Realiza una recarga completa del navegador/app si conserva recursos antiguos.

## Smart Automations 1.2.0

### Arquitectura preservada

- frontend base: Smart Automations Panel V1.0.0;
- layout runtime: `smart-automations-layout.js` V1.0.0;
- runtime: `smart-automations-runtime.js` V1.0.0;
- Color Picker Guard: V1.0.0;
- responsive runtime: `smart-automations-responsive.js` V1.0.0;
- storage: `smart_automations.config`;
- storage version: 1.

No existe migración.

### Responsive móvil / tablet / PC

El responsive usa el ancho real disponible del panel.

#### Móvil

- conserva el comportamiento validado;
- usa `columns_mobile`;
- el panel nunca excede el ancho disponible;
- el ancho heredado 520 mantiene la presentación móvil.

#### Tablet

- cuando `panel_max_width` conserva el valor heredado 520, el panel puede expandirse;
- usa `columns_tablet`;
- el grid responde al ancho real disponible;
- el resumen permanece a ancho completo;
- las tarjetas se colocan desde la izquierda.

#### PC

- con el ancho heredado 520, el panel puede crecer hasta 1000 px;
- usa `columns_desktop`;
- redimensionar la ventana reorganiza dinámicamente las tarjetas;
- sidebar abierto/cerrado cambia el ancho útil sin requerir configuración adicional.

#### Ancho personalizado

Un `panel_max_width` distinto de 520 se respeta y no entra al modo adaptativo automático.

### Resumen y tarjetas

- `.summary` permanece fuera del grid y ocupa el ancho completo;
- `.cards` usa las columnas existentes;
- una categoría con menos tarjetas que columnas deja libres las celdas restantes;
- las tarjetas permanecen alineadas desde la izquierda.

### Automatizaciones nativas

No cambia:

- creación;
- actualización;
- eliminación;
- toggle on/off;
- REST `config/automation/config/*`;
- recipes;
- validación de parámetros;
- `automation_id`;
- hashes;
- detección de cambios externos.

Home Assistant continúa ejecutando las automatizaciones.

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
- orden dentro de categorías;
- apariencia individual;
- navegación;
- Color Picker Guard.

## Smart Lighting 1.4.1

Permanece estable con su responsive móvil/tablet/PC y Global Actions alineadas al grid en tablet/escritorio.

## Smart Support 1.2.0

Mantiene backend/sesión, temporizador, configuración visual, orden de acciones, selectores y dependencia supervisada con Spook.

## Restaurar

Si una actualización falla:

1. selecciona `restore_latest`;
2. ejecuta la App;
3. confirma `RESTORE_OK`;
4. reinicia Home Assistant;
5. realiza una recarga completa del frontend.

## Recomendación para clientes

Mantén Home Assistant y Smart Home Suite en una combinación validada primero en laboratorio.

Evita actualizar automáticamente la Suite o Home Assistant en instalaciones productivas si la combinación todavía no fue probada.

## Importante

No instales simultáneamente versiones standalone de paneles ya incluidos en Smart Home Suite.
