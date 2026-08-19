# Smart Home Suite Manager 1.10.0 · PRE-RELEASE

Último release estable: **1.9.1**.

## Versiones

- Suite / Manager: **1.10.0**
- Smart Home: **1.4.0**
- Smart Lighting: **1.4.1**
- Smart Energy Advanced: **1.4.0**
- Smart Automations: **1.2.0**
- Smart Support: **1.2.0**

## Smart Automations 1.2.0

### Arquitectura preservada

- base: Smart Automations Panel V1.0.0;
- layout runtime: V1.0.0;
- Color Picker Guard runtime: V1.0.0;
- responsive runtime nuevo: V1.0.0;
- storage: `smart_automations.config`;
- storage version: 1.

### Responsive

#### Móvil

- conserva el comportamiento actual;
- usa `columns_mobile`;
- el panel no excede el ancho disponible.

#### Tablet

- si `panel_max_width` continúa en 520, el panel puede expandirse;
- usa `columns_tablet`;
- el grid responde al ancho real disponible.

#### PC

- si el ancho heredado es 520, el panel puede crecer hasta 1000 px;
- usa `columns_desktop`;
- redimensionar la ventana reorganiza dinámicamente las tarjetas.

#### Ancho personalizado

Un `panel_max_width` distinto de 520 se respeta exactamente y no entra al modo adaptativo automático.

### Resumen y tarjetas

- `.summary` permanece fuera del grid y a ancho completo;
- `.cards` usa las columnas existentes;
- una categoría con menos tarjetas que columnas deja libres las celdas restantes;
- las tarjetas permanecen alineadas desde la izquierda.

### Contrato nativo

No cambia:

- creación de automations nativas;
- actualización;
- eliminación;
- toggle on/off;
- REST `config/automation/config/*`;
- recipes;
- validación de parámetros;
- `automation_id`;
- hashes de configuración;
- detección de cambios externos.

### Personalización

No cambia:

- Guardar;
- Cancelar;
- Importar;
- Exportar;
- Restablecer;
- selector de entidades;
- selector MDI;
- orden de categorías;
- orden dentro de categorías;
- apariencia por tarjeta;
- navegación;
- Color Picker Guard.

## Instalar / actualizar / reparar

1. Actualiza Manager a 1.10.0.
2. Ejecuta `validate_only`.
3. Confirma `VALIDATION_OK`.
4. Ejecuta `install_repair` con `create_backup: true`.
5. Confirma validaciones y `INSTALLATION_OK`.
6. Reinicia Home Assistant.
7. Realiza recarga completa del frontend.

## Restaurar

Selecciona `restore_latest`, ejecuta, confirma `RESTORE_OK` y reinicia Home Assistant.

## Importante

Este release debe permanecer como pre-release hasta validar Smart Automations en móvil, tablet y PC y comprobar también las operaciones nativas de automatización.
