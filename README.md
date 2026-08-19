# Abel Smart Home Suite

Repositorio de distribución de **Smart Home Suite** para Home Assistant OS sin HACS.

## Smart Home Suite 1.14.0 — PRE-RELEASE

**Último estable:** 1.12.3.  
**Pre-release anterior:** 1.13.0 — Smart Home Layout V3 prototype.

Suite 1.14.0 convierte el V3 probado en 1.13.0 en un **panel frontend propio**:

`smart-home-panel-v3.js` V3.1.0.

### Versiones

- Suite / Manager: **1.14.0 PRE-RELEASE**
- Smart Home module: **1.6.0**
- Smart Home Panel V3: **3.1.0**
- Smart Home fallback V2: **2.0.5**
- Native V3 Bridge: **1.0.0**
- Suite runtime: **1.1.0**
- Card Layout runtime: **1.0.0**
- Smart Lighting: **1.4.1**
- Smart Energy Advanced: **1.5.3**
- Smart Automations: **1.3.0**
- Smart Support: **1.2.0**

## Arquitectura Smart Home

```text
Backend smart_home_panel V2.0.5
        │
        ├── smart-home-panel.js V2.0.5          fallback intacto
        │
        └── smart-home-panel-v3.js V3.1.0       panel activo
                ↑
        runtime V1.1.0 + Card Layout V1.0.0

Native Dashboard Bridge V1.3.0
        │
        └── smart-home-native-v3.js V1.0.0
                └── monta <smart-home-panel-v3>
```

`smart-home-layout-v3.js` V1.0.0 de Suite 1.13.0 permanece empaquetado por
compatibilidad/historial, pero **ya no es cargado por `/smart-home`**.

V3 deja de modificar el prototipo global del panel V2. Las futuras modificaciones
de secciones, responsive y presentación se realizan directamente en la clase
`SmartHomePanelV3`.

## Funcionalidad preservada

V3 conserva el contrato existente:

- `.storage` y WebSocket;
- costo mensual;
- temporada;
- tarifa;
- tacómetro;
- selectores de entidades;
- selector MDI con campo manual;
- tap/hold/more-info;
- toggle/navigate/url;
- navegación;
- header HA configurable;
- menú móvil por rol;
- Guardar/Cancelar;
- Importar/Exportar/Restablecer;
- tarjetas extra `value`, `bar`, `graph`;
- historial de gráficas;
- orden plano `card_layout.order`;
- Narrow Render Guard.

## Layout V3 nativo

Sigue usando `layout_v3` schema 1, compatible con 1.13.0.

### Secciones

- Resumen;
- Consumo;
- Otros;
- crear, duplicar y reordenar;
- ocultar;
- encabezado opcional;
- sección vacía opcional;
- título/subtítulo;
- icono MDI;
- colores y alineación;
- tamaños;
- superficie de toda la sección opcional;
- superficie solo del encabezado opcional;
- fondo/borde/radio/padding;
- eliminación segura de secciones personalizadas.

### Widgets

- mover entre secciones;
- subir/bajar;
- mostrar/ocultar;
- Auto / Small / Medium / Large / Full;
- crear widget dentro de una sección;
- editar mediante los editores existentes;
- eliminar widgets extra.

### Responsive

- móvil: 1 columna;
- tablet/PC: 4 columnas desde 700 px reales por defecto;
- container queries;
- breakpoint configurable 600–900;
- max width configurable 760–1400;
- default 1100;
- `panel_max_width` personalizado distinto de 520 se respeta.

## Compatibilidad 1.13.0

No existe migración.

El V3 nativo lee directamente `layout_v3` schema 1 guardado por 1.13.0.
Actualizar o abrir el panel no escribe `.storage`.
Solo Guardar persiste cambios y sincroniza `card_layout.order`.

## Distribución

Imagen esperada:

`ghcr.io/abel-smart-home/smart-home-suite-manager:1.14.0`

Arquitecturas: `amd64`, `aarch64`.

Mantén 1.12.3 como Stable y publica 1.14.0 como pre-release hasta validar
actualización desde 1.13.0 e instalación limpia.
