# Smart Home Suite Manager 1.12.3

Instala, valida, repara y restaura **Smart Home Suite 1.12.3 STABLE** en Home Assistant OS sin HACS.

## Estado

**Stable:** 1.12.3

## Módulos incluidos

- Smart Home 1.4.0
- Smart Lighting 1.4.1
- Smart Energy Advanced 1.5.3
- Smart Automations 1.3.0
- Smart Support 1.2.0

## Smart Energy Advanced 1.5.3

La versión estable conserva:

- Smart Energy Advanced Panel V1.3.1;
- ordering runtime V1.0.0;
- responsive runtime V1.3.0;
- `.storage/smart_energy_advanced_panel.config` versión 1;
- WebSocket;
- acciones;
- selectores;
- navegación;
- Personalización;
- gráfico nativo `power-sources-graph`.

### Responsive estable

- `<700 px reales`: 2 columnas;
- `>=700 px reales`: 4 columnas para tablet y PC;
- móvil con ancho heredado 520 no se expande;
- tablet puede crecer hasta 900 px;
- PC hasta 1000 px;
- móvil `span:2` ocupa toda la fila;
- tablet/PC `span:2` ocupa 2 de 4 columnas;
- `hero` permanece a ancho completo;
- gráfico nativo permanece a ancho completo.

No existe migración.

## Acciones del Manager

- `install_repair`
- `validate_only`
- `restore_latest`

## Flujo recomendado

### Validar

Selecciona:

`validate_only`

El log debe finalizar con:

`VALIDATION_OK`

### Instalar / reparar

Selecciona:

`install_repair`

Recomendado:

- `create_backup: true`
- `keep_backups: 3`

Confirma:

- `PAYLOAD_VALIDATION_OK`
- `STAGED_VALIDATION_OK`
- `POST_INSTALL_VALIDATION_OK`
- `INSTALLATION_OK`

Después reinicia Home Assistant.

### Restaurar

Selecciona:

`restore_latest`

Confirma:

`RESTORE_OK`

Después reinicia Home Assistant.

## Distribución

Imagen:

`ghcr.io/abel-smart-home/smart-home-suite-manager:1.12.3`

Arquitecturas:

- `amd64`
- `aarch64`

## Seguridad operativa

El Manager valida el payload antes de reemplazar la instalación y conserva
backup/rollback para reducir el riesgo de dejar la Suite incompleta.

La configuración persistente de cada módulo permanece separada de los archivos
frontend distribuidos por el Manager.
