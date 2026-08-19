# Smart Home Suite Manager 1.10.0

Instala, actualiza, valida, repara y restaura **Smart Home Suite 1.10.0 STABLE** en Home Assistant OS sin HACS.

## Estado

**Stable:** 1.10.0

### Módulos incluidos

- Smart Home 1.4.0
- Smart Lighting 1.4.1
- Smart Energy Advanced 1.4.0
- Smart Automations 1.2.0
- Smart Support 1.2.0

## Smart Automations 1.2.0

La versión estable incorpora `smart-automations-responsive.js` V1.0.0 como una capa aislada.

Se mantienen intactos:

- Smart Automations Panel V1.0.0;
- `smart-automations-layout.js` V1.0.0;
- `smart-automations-runtime.js` V1.0.0;
- Color Picker Guard V1.0.0;
- `.storage/smart_automations.config` versión 1;
- REST de automatizaciones nativas;
- recetas;
- validaciones;
- ownership/hash;
- Personalización;
- selectores;
- navegación.

### Responsive

- móvil conserva el layout heredado de 520 px;
- tablet y PC pueden aprovechar hasta 1000 px;
- se respetan las columnas móvil/tablet/PC ya configurables;
- las container queries responden al ancho real disponible;
- el resumen permanece a ancho completo;
- las tarjetas se distribuyen desde la izquierda;
- un ancho máximo personalizado distinto de 520 se respeta.

No requiere migración.

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

`ghcr.io/abel-smart-home/smart-home-suite-manager:1.10.0`

Arquitecturas:

- `amd64`
- `aarch64`

## Seguridad operativa

El Manager valida el payload antes de sustituir la instalación existente y utiliza backup/rollback para reducir el riesgo de dejar la Suite incompleta.

La configuración persistente de los módulos permanece separada de los archivos frontend distribuidos por el Manager.
