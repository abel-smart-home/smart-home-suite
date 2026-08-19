# Abel Smart Home Suite

Repositorio de distribución de **Smart Home Suite** para Home Assistant OS sin HACS.

## Smart Home Suite 1.12.3 — STABLE

**Último release estable:** Smart Home Suite **1.12.3**.

Smart Home Suite 1.12.3 incorpora como estable el responsive validado de
**Smart Energy Advanced 1.5.3**, manteniendo intacto el panel base,
el ordering runtime, la persistencia y el gráfico nativo de Home Assistant.

### Versiones

- Smart Home Suite / Manager: **1.12.3**
- Smart Home: **1.4.0**
- Smart Lighting: **1.4.1**
- Smart Energy Advanced: **1.5.3**
- Smart Automations: **1.3.0**
- Smart Support: **1.2.0**

## Smart Energy Advanced 1.5.3

Arquitectura estable:

- Smart Energy Advanced Panel V1.3.1;
- `smart-energy-advanced-layout.js` V1.0.0;
- `smart-energy-advanced-responsive.js` V1.3.0;
- `.storage/smart_energy_advanced_panel.config` versión 1;
- WebSocket y acciones existentes;
- tarjeta oficial `power-sources-graph`.

### Responsive móvil / tablet / PC

La versión estable conserva el diseño móvil validado y utiliza cuatro columnas
en tablet y PC cuando el panel dispone del ancho suficiente.

Reglas:

- ancho real `<700 px`: **2 columnas**;
- ancho real `>=700 px`: **4 columnas** para tablet y PC;
- con `panel_max_width = 520`, móvil conserva el ancho heredado sin expansión;
- tablet puede crecer hasta **900 px**;
- PC puede crecer hasta **1000 px**;
- `span:1` ocupa 1 columna;
- en móvil, `span:2` ocupa toda la fila;
- en tablet/PC, `span:2` ocupa 2 de 4 columnas;
- widgets `hero` permanecen a ancho completo;
- `power-sources-graph` permanece a ancho completo;
- secciones continúan una debajo de otra;
- tarjetas se distribuyen desde la izquierda;
- un `panel_max_width` personalizado distinto de 520 se respeta.

La adaptación usa container queries sobre el ancho real del panel, por lo que
responde a cambios de tamaño, orientación y sidebar sin identificar el tipo
de dispositivo.

### Persistencia y compatibilidad

No existe migración.

El responsive runtime no escribe configuración.

Se conserva:

- `.storage/smart_energy_advanced_panel.config` versión 1;
- WebSocket;
- entidades;
- cálculos;
- unidades;
- decimales;
- barras;
- demo values;
- tap;
- hold;
- more-info;
- selector de entidades;
- selector MDI;
- navegación;
- Personalización;
- Guardar/Cancelar;
- Importar/Exportar/Restablecer;
- orden de secciones;
- orden de widgets.

### Gráfico nativo

`power-sources-graph` continúa fuera de `.metric-grid`, proyectado a ancho
completo y sin modificar sus internals.

## Smart Automations 1.3.0

Permanece estable con:

- responsive adaptativo móvil/tablet/PC;
- Alert Control V1.0.0;
- 1 o 2 avisos configurables;
- horario opcional;
- segundo aviso con revalidación;
- rearme/histéresis opcional;
- Home Assistant como motor nativo;
- `.storage` sin migración.

## Smart Lighting 1.4.1

Permanece estable con:

- responsive móvil/tablet/PC;
- columnas configurables;
- Global Actions alineadas al grid en tablet/PC;
- `.storage` sin migración.

## Distribución

Imagen:

`ghcr.io/abel-smart-home/smart-home-suite-manager:1.12.3`

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
9. Realiza una recarga completa del frontend si conserva recursos anteriores.

## Rollback

1. Abre Smart Home Suite Manager.
2. Selecciona `restore_latest`.
3. Ejecuta.
4. Confirma `RESTORE_OK`.
5. Reinicia Home Assistant.
6. Realiza una recarga completa del frontend.

## Política recomendada

Para instalaciones productivas:

1. validar primero nuevas versiones en laboratorio;
2. conservar backup antes de actualizar;
3. desplegar manualmente una combinación ya comprobada;
4. evitar cambios innecesarios en sistemas que funcionan correctamente.

## Importante

No instales simultáneamente versiones standalone de paneles ya incluidos en Smart Home Suite.
