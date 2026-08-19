# Abel Smart Home Suite

Repositorio de distribución de **Smart Home Suite** para Home Assistant OS sin HACS.

## Smart Home Suite 1.9.1 — STABLE

**Último release estable:** Smart Home Suite **1.9.1**.

Smart Home Suite 1.9.1 consolida el responsive adaptativo de **Smart Lighting 1.4.1** para móvil, tablet y PC, manteniendo intacta la configuración existente y el frontend base validado.

### Versiones

- Smart Home Suite / Manager: **1.9.1**
- Smart Home: **1.4.0**
- Smart Lighting: **1.4.1**
- Smart Energy Advanced: **1.4.0**
- Smart Automations: **1.1.1**
- Smart Support: **1.2.0**

### Smart Lighting 1.4.1

Smart Lighting conserva:

- Smart Lighting Panel V1.0.3 como frontend base;
- `smart-lighting-layout.js` V1.2.0;
- `smart-lighting-responsive.js` V1.1.0;
- `.storage/smart_lighting_panel.config` versión 1;
- Personalización, Guardar/Cancelar e Importar/Exportar/Restablecer;
- selector de entidades y selector MDI;
- tap, hold y more-info;
- navegación;
- ordenamiento de áreas y dispositivos;
- Global Actions;
- aislamiento del módulo.

#### Responsive

- **Móvil:** conserva el diseño móvil validado.
- **Tablet:** usa `columns_tablet`.
- **PC:** usa `columns_desktop`.
- El panel responde al redimensionado dinámico del navegador.
- Las configuraciones heredadas con ancho máximo 520/760 px pueden aprovechar progresivamente hasta 1200 px.
- Las container queries responden al ancho real disponible dentro de Home Assistant.

#### Acciones globales

En tablet y PC:

- `Apagar todo` y `Encender todo` usan la misma cuadrícula que las tarjetas;
- ocupan las primeras posiciones del grid;
- permanecen alineados a la izquierda;
- ya no se estiran para llenar toda la fila;
- conservan una altura compacta;
- usan el mismo `card_gap` configurado para las tarjetas.

En móvil conservan el comportamiento previamente validado.

### Compatibilidad

No existe migración de `.storage`.

La configuración de Smart Lighting sigue usando:

`smart_lighting_panel.config`

Storage version:

`1`

El runtime responsive no escribe configuración automáticamente.

## Distribución

La Suite se distribuye mediante **Smart Home Suite Manager** e imágenes multi-arquitectura publicadas en GHCR:

`ghcr.io/abel-smart-home/smart-home-suite-manager`

## Política de actualización recomendada

Para instalaciones de clientes:

1. validar primero nuevas versiones de Home Assistant y Smart Home Suite en una instancia laboratorio;
2. mantener la Suite y Home Assistant en versiones certificadas;
3. actualizar manualmente después de las pruebas;
4. mantener siempre backup antes de `install_repair`.

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
5. reinicia Home Assistant.

## Importante

No instales simultáneamente versiones standalone de paneles ya incluidos en Smart Home Suite.
