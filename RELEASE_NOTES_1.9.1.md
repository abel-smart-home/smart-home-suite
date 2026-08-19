# Smart Home Suite 1.9.1 — STABLE

## Smart Lighting 1.4.1 · responsive móvil / tablet / PC

Smart Home Suite 1.9.1 promueve a **STABLE** el mismo payload validado previamente como pre-release en Home Assistant OS.

No se modifica el código funcional probado.

### Smart Lighting 1.4.1

Smart Lighting conserva:

- Smart Lighting Panel V1.0.3 como frontend base intacto;
- `smart-lighting-layout.js` V1.2.0;
- `smart-lighting-responsive.js` V1.1.0;
- `.storage/smart_lighting_panel.config` versión 1;
- WebSocket `smart_lighting_panel/config/get|save|reset`;
- Personalización, Guardar/Cancelar, Importar/Exportar/Restablecer;
- selector de entidades;
- selector MDI;
- tap/hold/more-info;
- navegación;
- ordenamiento de áreas y dispositivos;
- Global Actions;
- aislamiento de módulos.

### Responsive validado

- **Móvil:** conserva el formato móvil validado y los dos botones de Acciones globales usando el ancho disponible.
- **Tablet:** el panel aprovecha el ancho disponible y usa `columns_tablet`.
- **PC:** usa `columns_desktop` y puede aprovechar hasta 1200 px cuando parte de los anchos heredados 520/760.
- El layout responde también al redimensionado dinámico del navegador.
- Las container queries consideran el ancho real disponible dentro de Home Assistant.

### Acciones globales

En tablet y PC:

- `Apagar todo` y `Encender todo` usan la misma cuadrícula configurable que las tarjetas de dispositivos;
- ocupan las primeras posiciones del grid;
- permanecen alineados a la izquierda;
- ya no se estiran para llenar toda la fila;
- conservan una altura compacta, menor que las tarjetas normales;
- utilizan el mismo `card_gap` del grid de dispositivos.

En móvil conservan el comportamiento previo.

### Persistencia y compatibilidad

No existe migración.

El responsive runtime no escribe configuración automáticamente.

Se mantiene la misma clave:

`smart_lighting_panel.config`

Storage version:

`1`

### Versiones

- Smart Home Suite / Manager: **1.9.1**
- Smart Home: **1.4.0**
- Smart Lighting: **1.4.1**
- Smart Energy Advanced: **1.4.0**
- Smart Automations: **1.1.1**
- Smart Support: **1.2.0**
- Smart Lighting base: **1.0.3**
- Lighting layout runtime: **1.2.0**
- Lighting responsive runtime: **1.1.0**

### Estado

**STABLE**

La promoción a estable no modifica el payload funcional que pasó las pruebas del pre-release.
