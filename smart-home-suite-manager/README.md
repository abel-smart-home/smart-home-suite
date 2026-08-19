# Smart Home Suite Manager 1.10.0

Instala, actualiza, valida, repara y restaura **Smart Home Suite 1.10.0 PRE-RELEASE** en Home Assistant OS sin HACS.

**Último release estable:** 1.9.1.

## Módulos incluidos

- Smart Home 1.4.0
- Smart Lighting 1.4.1
- Smart Energy Advanced 1.4.0
- Smart Automations 1.2.0
- Smart Support 1.2.0

## Smart Automations 1.2.0

La prueba añade un runtime responsive aislado V1.0.0.

Se mantienen intactos el panel base V1.0.0, layout runtime V1.0.0 y Color Picker Guard V1.0.0.

Responsive:

- móvil conserva el ancho 520 heredado;
- tablet/PC pueden aprovechar hasta 1000 px;
- se respetan las columnas configurables móvil/tablet/PC;
- las columnas responden al ancho real del panel mediante container queries;
- el resumen permanece a ancho completo;
- las tarjetas se distribuyen desde la izquierda;
- anchos máximos personalizados distintos de 520 se respetan.

No cambia `.storage`, recetas ni automatizaciones nativas.

## Acciones del Manager

- `install_repair`
- `validate_only`
- `restore_latest`

## Flujo recomendado

1. Ejecuta `validate_only` y confirma `VALIDATION_OK`.
2. Ejecuta `install_repair` con `create_backup: true`.
3. Confirma:
   - `PAYLOAD_VALIDATION_OK`
   - `STAGED_VALIDATION_OK`
   - `POST_INSTALL_VALIDATION_OK`
   - `INSTALLATION_OK`
4. Reinicia Home Assistant.
5. Haz recarga completa del frontend.

## Distribución

Imagen esperada:

`ghcr.io/abel-smart-home/smart-home-suite-manager:1.10.0`

Arquitecturas:

- `amd64`
- `aarch64`

## Restaurar

Usa `restore_latest`, confirma `RESTORE_OK` y reinicia Home Assistant.
