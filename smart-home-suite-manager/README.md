# Smart Home Suite Manager 1.13.0

**PRE-RELEASE** para validar Smart Home V3 Layout.

**Último estable:** 1.12.3.

## Módulos

- Smart Home 1.5.0 · Layout V3 3.0.0/runtime 1.0.0
- Smart Lighting 1.4.1
- Smart Energy Advanced 1.5.3
- Smart Automations 1.3.0
- Smart Support 1.2.0

## Smart Home V3

Mantiene intactos Smart Home Panel V2.0.5, Native Dashboard Bridge V1.3.0,
Suite runtime V1.1.0 y Card Layout V1.0.0. El nuevo archivo
`smart-home-layout-v3.js` añade exclusivamente organización/presentación.

### Instalación limpia

Una configuración vacía obtiene en memoria las secciones predeterminadas
Resumen / Consumo / Otros. No se escribe storage hasta Guardar.

### Instalación existente

La configuración anterior se combina con defaults V3 en memoria. Los widgets
existentes y adicionales siguen siendo válidos. Guardar persiste V3 y mantiene
`card_layout.order` sincronizado para rollback.

### Responsive

- móvil: 1 columna;
- tablet/PC: 4 columnas desde 700 px reales por defecto;
- tamaños Auto / Small / Medium / Large / Full;
- container queries;
- ancho adaptativo solo para el valor heredado 520;
- ancho personalizado distinto de 520 se respeta.

### Secciones

Mostrar/ocultar, encabezado, título/subtítulo, icono, selector MDI nativo con
fallback manual, colores, alineación, superficie, orden, duplicación, creación y
eliminación segura de secciones personalizadas.

### Widgets

Mostrar/ocultar, orden, mover entre secciones, tamaño semántico, crear widgets
adicionales y conservar los editores visuales existentes.

## Acciones del Manager

- `install_repair`
- `validate_only`
- `restore_latest`

## Distribución

`ghcr.io/abel-smart-home/smart-home-suite-manager:1.13.0`

Arquitecturas: `amd64`, `aarch64`.
