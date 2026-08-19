# Smart Home Suite Manager 1.9.1 · STABLE

## Versiones

- Suite / Manager: **1.9.1**
- Smart Home: **1.4.0**
- Smart Lighting: **1.4.1**
- Smart Energy Advanced: **1.4.0**
- Smart Automations: **1.1.1**
- Smart Support: **1.2.0**

## Instalar / actualizar / reparar

1. Actualiza Smart Home Suite Manager a 1.9.1.
2. Selecciona `validate_only` y ejecuta la App.
3. Confirma `VALIDATION_OK`.
4. Selecciona `install_repair`.
5. Mantén `create_backup: true`.
6. Configura `keep_backups` entre 1 y 10.
7. Inicia la App.
8. Confirma:
   - `PAYLOAD_VALIDATION_OK`
   - `STAGED_VALIDATION_OK`
   - `POST_INSTALL_VALIDATION_OK`
   - `INSTALLATION_OK`
9. Reinicia Home Assistant.
10. Realiza recarga completa del navegador/app si conserva recursos antiguos.

## Smart Lighting 1.4.1

### Arquitectura preservada

- frontend base: Smart Lighting Panel V1.0.3;
- layout runtime: `smart-lighting-layout.js` V1.2.0;
- responsive runtime: `smart-lighting-responsive.js` V1.1.0;
- storage: `smart_lighting_panel.config`;
- storage version: 1.

No existe migración.

### Responsive móvil / tablet / PC

El responsive usa el ancho real disponible del panel.

#### Móvil

- conserva el formato móvil;
- usa `columns_mobile`;
- Global Actions conserva sus dos botones ocupando el ancho disponible.

#### Tablet

- usa `columns_tablet`;
- el panel aprovecha más espacio;
- Global Actions usa la misma cuadrícula que los dispositivos;
- los dos botones quedan en las primeras posiciones y alineados a la izquierda.

#### PC

- usa `columns_desktop`;
- el panel puede crecer hasta 1200 px cuando la configuración usa los anchos heredados 520/760;
- Global Actions deja de estirarse a media pantalla;
- redimensionar el navegador cambia dinámicamente el grid.

### Personalización

Se conserva:

- drawer lateral en escritorio;
- pantalla completa en móvil;
- Guardar;
- Cancelar;
- Importar;
- Exportar;
- Restablecer;
- selector de entidades;
- selector visual MDI;
- orden de áreas;
- orden de dispositivos;
- Global Actions;
- colores activo/inactivo;
- navegación.

### Acciones de entidades

Se conservan las acciones configuradas de tap/hold/more-info y el comportamiento existente de luces e interruptores.

## Smart Support 1.2.0

Mantiene el backend/sesión existente y añade presentación configurable, orden de acciones y Color Picker Guard.

Se conservan:

- `smart_support_panel.config`;
- `smart_support_panel.session`;
- servicios/WebSocket;
- temporizador;
- integración con Spook;
- navegación;
- selectores;
- responsive.

## Restaurar

Si una actualización falla:

1. selecciona `restore_latest`;
2. ejecuta la App;
3. confirma `RESTORE_OK`;
4. reinicia Home Assistant;
5. realiza recarga completa del frontend.

## Recomendación para clientes

Mantén Home Assistant y Smart Home Suite en una combinación ya validada en laboratorio.

Evita actualizar automáticamente la Suite o Home Assistant en instalaciones productivas si no se ha probado antes la combinación.

## Importante

No instales simultáneamente versiones standalone de paneles ya incluidos en Smart Home Suite.
