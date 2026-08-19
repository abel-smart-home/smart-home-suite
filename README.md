# Abel Smart Home Suite

Repositorio de distribución de **Smart Home Suite** para Home Assistant OS sin HACS.

## Smart Home Suite 1.14.0 — STABLE

**Último release estable:** Smart Home Suite **1.14.0**.

Smart Home Suite 1.14.0 incorpora como estable la nueva arquitectura de
**Smart Home Panel V3 nativo**, validada tanto mediante actualización desde
Suite 1.13.0 como mediante instalación limpia.

La versión estable utiliza:

- `smart-home-panel-v3.js` **V3.1.0** como panel frontend activo;
- `smart-home-native-v3.js` **V1.0.0** como bridge del dashboard;
- Smart Home Panel V2.0.5 como fallback funcional;
- Suite Runtime V1.1.0;
- Narrow Render Guard V1.0.0;
- Card Layout V1.0.0;
- `layout_v3` schema 1 compatible con Suite 1.13.0.

No existe migración de `.storage`.

### Versiones estables

- Smart Home Suite / Manager: **1.14.0**
- Smart Home module: **1.6.0**
- Smart Home Panel V3: **3.1.0**
- Native V3 Bridge: **1.0.0**
- Smart Home fallback V2: **2.0.5**
- Suite Runtime: **1.1.0**
- Card Layout Runtime: **1.0.0**
- Smart Lighting: **1.4.1**
- Smart Energy Advanced: **1.5.3**
- Smart Automations: **1.3.0**
- Smart Support: **1.2.0**

## Smart Home 1.6.0

### Arquitectura estable

```text
Backend smart_home_panel V2.0.5
        │
        ├── smart-home-panel.js V2.0.5
        │       fallback intacto
        │
        └── smart-home-panel-v3.js V3.1.0
                panel activo
                ↑
        Runtime V1.1.0 + Card Layout V1.0.0

Native Dashboard Bridge V1.3.0
        │
        └── smart-home-native-v3.js V1.0.0
                └── <smart-home-dashboard-card-v3>
                        └── <smart-home-panel-v3>
```

`smart-home-layout-v3.js` V1.0.0 introducido durante la prueba de Suite 1.13.0
permanece empaquetado como artefacto de compatibilidad/histórico, pero
**no es el frontend activo de `/smart-home`**.

Esto permite que futuras modificaciones de Smart Home se implementen
directamente sobre la clase `SmartHomePanelV3`, evitando acumular parches sobre
el prototipo del panel V2.

## Funcionalidad preservada

Smart Home V3 conserva:

- backend existente;
- `.storage`;
- WebSocket;
- entidades;
- costo mensual;
- temporada;
- tarifa;
- tacómetro;
- navegación;
- selector de entidades;
- selector MDI visual + entrada manual;
- tap;
- hold;
- more-info;
- toggle;
- navigate;
- URL;
- header de Home Assistant configurable;
- menú móvil por rol;
- Guardar / Cancelar;
- Importar / Exportar / Restablecer;
- tarjetas adicionales `value`, `bar` y `graph`;
- historial de gráficas;
- orden compatible `card_layout.order`;
- Narrow Render Guard.

## Layout V3

El layout estable usa `layout_v3.schema_version = 1`.

### Secciones

Incluye:

- Resumen;
- Consumo;
- Otros;
- creación de secciones;
- duplicación;
- orden configurable;
- mostrar/ocultar;
- encabezado opcional;
- sección vacía opcional;
- título/subtítulo;
- icono MDI;
- colores;
- tamaños;
- alineación;
- fondo/borde/radio/padding;
- superficie opcional de toda la sección;
- superficie opcional solo del encabezado;
- eliminación segura de secciones personalizadas.

### Widgets

Permite:

- mover widgets entre secciones;
- reordenarlos dentro de una sección;
- mostrar/ocultar;
- tamaños Auto / Small / Medium / Large / Full;
- crear widgets adicionales dentro de una sección;
- editar widgets mediante los editores existentes;
- eliminar widgets adicionales.

## Responsive

Default estable:

- ancho real `<700 px`: **1 columna**;
- ancho real `>=700 px`: **4 columnas** para tablet y PC;
- Small: 1 de 4;
- Medium: 2 de 4;
- Large: 3 de 4;
- Full: 4 de 4;
- breakpoint configurable 600–900 px;
- max width configurable 760–1400 px;
- default max width 1100 px;
- `panel_max_width` personalizado distinto de 520 se respeta.

La adaptación utiliza container queries sobre el ancho real del panel.

## Compatibilidad y persistencia

No existe migración.

Suite 1.14.0 lee directamente configuraciones `layout_v3` schema 1 creadas por
Suite 1.13.0.

Abrir el panel no reescribe `.storage`.

Guardar sincroniza `card_layout.order`, por lo que el orden plano compatible se
mantiene disponible para recuperación o rollback.

## Otros módulos estables

### Smart Lighting 1.4.1

- diseño móvil conservado;
- responsive tablet/PC;
- columnas configurables;
- Global Actions alineadas al grid;
- sin migración.

### Smart Energy Advanced 1.5.3

- móvil: 2 columnas;
- tablet/PC: 4 columnas;
- container queries;
- gráfico nativo `power-sources-graph` intacto;
- sin migración.

### Smart Automations 1.3.0

- responsive adaptativo;
- Alert Control V1.0.0;
- Home Assistant continúa como motor de automatizaciones;
- sin helpers obligatorios;
- sin migración.

### Smart Support 1.2.0

- acciones ordenables;
- personalización visual;
- backend/session contract preservado.

## Distribución

Imagen:

`ghcr.io/abel-smart-home/smart-home-suite-manager:1.14.0`

Arquitecturas:

- `amd64`
- `aarch64`

## Instalación / actualización

1. Actualiza Smart Home Suite Manager.
2. Ejecuta `validate_only`.
3. Confirma validación correcta.
4. Cambia a `install_repair`.
5. Mantén `create_backup: true`.
6. Ejecuta el Manager.
7. Reinicia Home Assistant.
8. Realiza una recarga completa del frontend si conserva recursos antiguos.

## Rollback

1. Abre Smart Home Suite Manager.
2. Selecciona `restore_latest`.
3. Ejecuta.
4. Reinicia Home Assistant.
5. Realiza una recarga completa del frontend.

## Política recomendada

Para instalaciones productivas:

1. probar versiones nuevas primero en laboratorio;
2. conservar backup antes de actualizar;
3. desplegar manualmente versiones ya comprobadas;
4. evitar cambios innecesarios en instalaciones estables.
