# Abel Smart Home Suite

Repositorio de distribución de **Smart Home Suite** para Home Assistant OS sin HACS.

## Smart Home Suite 1.13.0 — PRE-RELEASE

**Último release estable:** Smart Home Suite **1.12.3**.

Smart Home Suite 1.13.0 introduce la primera prueba de **Smart Home V3 Layout**:
un dashboard principal por secciones, widgets reordenables y tamaños semánticos,
con responsive nativo mediante container queries.

### Versiones

- Smart Home Suite / Manager: **1.13.0 PRE-RELEASE**
- Smart Home: **1.5.0**
- Smart Home base panel: **2.0.5**
- Smart Home Layout V3: **3.0.0 / runtime 1.0.0**
- Smart Lighting: **1.4.1**
- Smart Energy Advanced: **1.5.3**
- Smart Automations: **1.3.0**
- Smart Support: **1.2.0**

## Smart Home V3

La arquitectura previa permanece disponible debajo de V3:

- Smart Home Panel V2.0.5;
- Native Dashboard Bridge V1.3.0;
- Suite runtime V1.1.0;
- Narrow Render Guard V1.0.0;
- Card Layout runtime V1.0.0;
- nuevo `smart-home-layout-v3.js` V1.0.0.

### Secciones

En una instalación limpia V3 genera en memoria:

1. **Resumen** — Costo mensual, Temporada y Tarifa.
2. **Consumo** — Tacómetro / potencia.
3. **Otros** — widgets adicionales.

Las secciones permiten:

- mostrar/ocultar;
- mostrar/ocultar encabezado;
- mostrar una sección vacía;
- título y subtítulo;
- icono MDI manual + selector visual nativo cuando está disponible;
- colores de icono, título y subtítulo;
- alineación izquierda/centro/derecha;
- fondo/borde opcional del encabezado;
- tamaño de textos/icono;
- radio/padding/borde;
- subir/bajar;
- duplicar una sección creando una copia vacía con el mismo estilo;
- crear nuevas secciones;
- eliminar secciones personalizadas moviendo sus widgets a una sección segura.

Las secciones base se ocultan en lugar de eliminarse para evitar pérdida accidental de estructura.

### Widgets

Todos los widgets actuales continúan usando su configuración existente.
V3 añade organización y tamaño semántico:

- `Auto`;
- `Pequeño`;
- `Mediano`;
- `Grande`;
- `Ancho completo`.

Desde Layout V3 se puede:

- mostrar/ocultar un widget;
- subir/bajar dentro de una sección;
- moverlo a cualquier otra sección;
- cambiar su tamaño semántico;
- crear un widget adicional directamente dentro de una sección;
- saltar a su editor visual existente.

Las tarjetas adicionales actuales `value`, `bar` y `graph` siguen siendo compatibles.

### Responsive

V3 usa el ancho real de `.page`:

- móvil: **1 columna**;
- tablet/PC: **4 columnas** desde 700 px por defecto;
- breakpoint configurable entre 600 y 900 px;
- ancho máximo adaptativo configurable entre 760 y 1400 px;
- valor predeterminado: 1100 px;
- si `design.panel_max_width` es distinto del heredado 520, se respeta.

Tamaños en tablet/PC:

- Pequeño → 1 de 4;
- Mediano → 2 de 4;
- Grande → 3 de 4;
- Full → 4 de 4.

En móvil todos ocupan la fila completa.

Defaults inteligentes:

- Costo mensual → Mediano;
- Temporada → Pequeño;
- Tarifa → Pequeño;
- Tacómetro → Full;
- gráfica adicional → Full;
- valor/barra adicional → Mediano.

### Compatibilidad y rollback

V3 **no migra ni escribe `.storage` automáticamente**.

Actualizar, reiniciar y abrir Smart Home no modifica la configuración guardada.
Solo **Guardar** persiste `layout_v3`.

Al guardar también se sincroniza el orden plano existente `card_layout.order`,
por lo que una versión anterior puede ignorar las claves V3 y seguir leyendo un
orden de tarjetas compatible.

Además, V3 puede desactivarse desde Personalización para volver al layout plano
actual dentro de la misma versión.

## Módulos sin cambios funcionales

- Smart Lighting 1.4.1
- Smart Energy Advanced 1.5.3
- Smart Automations 1.3.0
- Smart Support 1.2.0

## Distribución

Imagen esperada:

`ghcr.io/abel-smart-home/smart-home-suite-manager:1.13.0`

Arquitecturas:

- `amd64`
- `aarch64`

## Prueba recomendada

1. Publica `v1.13.0` como pre-release.
2. Confirma Builder completamente verde.
3. Prueba primero una instalación limpia.
4. Prueba después una actualización desde 1.12.3 con configuración existente.
5. Ejecuta `validate_only`.
6. Ejecuta `install_repair` con backup.
7. Prueba Smart Home en móvil, tablet y PC.
8. Prueba secciones, widgets, Save/Cancel, Import/Export y rollback.
9. Mantén 1.12.3 como Stable hasta completar el checklist.
