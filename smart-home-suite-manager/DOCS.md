# Smart Home Suite Manager 1.12.3 · STABLE

## Versiones

- Suite / Manager: **1.12.3**
- Smart Home: **1.4.0**
- Smart Lighting: **1.4.1**
- Smart Energy Advanced: **1.5.3**
- Smart Automations: **1.3.0**
- Smart Support: **1.2.0**

## Smart Energy Advanced 1.5.3

### Arquitectura preservada

- base: Smart Energy Advanced Panel V1.3.1;
- ordering runtime: `smart-energy-advanced-layout.js` V1.0.0;
- responsive runtime: `smart-energy-advanced-responsive.js` V1.3.0;
- storage: `smart_energy_advanced_panel.config`;
- storage version: 1.

No existe migración.

### Ancho adaptativo

Con `panel_max_width = 520`:

- debajo de 700 px reales no existe expansión automática: móvil conserva el ancho original;
- desde 700 px tablet puede crecer hasta 900 px;
- desde 900 px PC puede crecer hasta 1000 px.

Un `panel_max_width` personalizado distinto de 520 se respeta.

### Móvil

Por debajo de 700 px reales:

- 2 columnas;
- `span:1` ocupa 1 de 2;
- `span:2` ocupa toda la fila;
- `hero` ocupa toda la fila;
- gráfico nativo ocupa todo el ancho.

### Tablet

Desde 700 px reales:

- 4 columnas;
- `span:1` ocupa 1 de 4;
- `span:2` ocupa 2 de 4;
- `hero` ocupa las 4 columnas;
- gráfico nativo ocupa todo el ancho;
- máximo adaptativo 900 px para el ancho heredado.

### PC

Continúa con 4 columnas:

- `span:1` ocupa 1 de 4;
- `span:2` ocupa 2 de 4;
- `hero` ocupa las 4 columnas;
- gráfico nativo ocupa todo el ancho;
- máximo adaptativo 1000 px para el ancho heredado.

### Container queries

La cuadrícula responde al ancho real de `.page`.

Esto permite adaptación automática ante:

- sidebar abierto/cerrado;
- redimensionado del navegador;
- tablet vertical/horizontal;
- diferentes resoluciones de pantalla.

### Gráfico nativo

`power-sources-graph` permanece:

- fuera de `.metric-grid`;
- en light DOM mediante `<slot>`;
- a ancho completo;
- sin modificar sus internals.

### Sin cambios funcionales

Se conserva:

- WebSocket;
- `.storage`;
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

## Instalar / actualizar / reparar

1. Actualiza Smart Home Suite Manager a 1.12.3.
2. Ejecuta `validate_only`.
3. Confirma `VALIDATION_OK`.
4. Selecciona `install_repair`.
5. Mantén `create_backup: true`.
6. Ejecuta.
7. Confirma:
   - `PAYLOAD_VALIDATION_OK`
   - `STAGED_VALIDATION_OK`
   - `POST_INSTALL_VALIDATION_OK`
   - `INSTALLATION_OK`
8. Reinicia Home Assistant.
9. Haz una recarga completa del frontend.

## Restaurar

1. Selecciona `restore_latest`.
2. Ejecuta.
3. Confirma `RESTORE_OK`.
4. Reinicia Home Assistant.
5. Haz una recarga completa del frontend.

## Estado

**Smart Home Suite 1.12.3 es la versión estable actual.**
