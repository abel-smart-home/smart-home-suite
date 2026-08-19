# Smart Home Suite Manager 1.9.1

Instala, actualiza, valida, repara y restaura **Smart Home Suite 1.9.1 STABLE** en Home Assistant OS sin HACS.

## Estado

**Stable:** 1.9.1

### Módulos incluidos

- Smart Home 1.4.0
- Smart Lighting 1.4.1
- Smart Energy Advanced 1.4.0
- Smart Automations 1.1.1
- Smart Support 1.2.0

## Smart Lighting 1.4.1

La versión estable incorpora el responsive adaptativo probado en móvil, tablet y PC.

Se mantienen intactos:

- Smart Lighting Panel V1.0.3;
- `smart-lighting-layout.js` V1.2.0;
- `.storage/smart_lighting_panel.config` versión 1;
- WebSocket `smart_lighting_panel/config/*`;
- Personalización;
- navegación;
- selectores;
- tap/hold/more-info;
- ordenamiento;
- Global Actions.

El runtime `smart-lighting-responsive.js` V1.1.0:

- conserva móvil;
- usa `columns_tablet` en tablet;
- usa `columns_desktop` en PC;
- adapta el panel al ancho disponible;
- limita el crecimiento adaptativo a 1200 px para los anchos heredados 520/760;
- alinea Global Actions con la misma cuadrícula de tarjetas en tablet/PC.

## Acciones del Manager

- `install_repair`
- `validate_only`
- `restore_latest`

## Flujo recomendado

### Validar

Selecciona:

`validate_only`

El log debe terminar con:

`VALIDATION_OK`

### Instalar / reparar

Selecciona:

`install_repair`

Recomendado:

- `create_backup: true`
- `keep_backups: 3`

Debes observar:

- `PAYLOAD_VALIDATION_OK`
- `STAGED_VALIDATION_OK`
- `POST_INSTALL_VALIDATION_OK`
- `INSTALLATION_OK`

Después reinicia Home Assistant.

### Restaurar

Selecciona:

`restore_latest`

Debes observar:

`RESTORE_OK`

Después reinicia Home Assistant.

## Distribución

Imagen:

`ghcr.io/abel-smart-home/smart-home-suite-manager:1.9.1`

Arquitecturas:

- `amd64`
- `aarch64`

## Seguridad operativa

El Manager valida el payload antes de sustituir la instalación existente y utiliza reemplazo con rollback/backup para reducir el riesgo de dejar la Suite incompleta.

La configuración persistente de cada módulo permanece separada de los archivos frontend distribuidos por el Manager.
