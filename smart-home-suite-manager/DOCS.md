# Smart Home Suite Manager 1.12.0 · PRE-RELEASE

Último release estable: **1.11.0**.

## Versiones

- Suite / Manager: **1.12.0**
- Smart Home: **1.4.0**
- Smart Lighting: **1.4.1**
- Smart Energy Advanced: **1.5.0**
- Smart Automations: **1.3.0**
- Smart Support: **1.2.0**

## Smart Energy Advanced 1.5.0

### Arquitectura preservada

- base: Smart Energy Advanced Panel V1.3.1;
- ordering runtime: `smart-energy-advanced-layout.js` V1.0.0;
- responsive runtime: `smart-energy-advanced-responsive.js` V1.0.0;
- storage: `smart_energy_advanced_panel.config`;
- storage version: 1.

No existe migración.

### Ancho adaptativo

Si `panel_max_width` conserva el valor heredado **520**, desde tablet el panel puede crecer progresivamente hasta **1000 px**. Un ancho personalizado distinto de 520 se respeta.

### Móvil / Tablet / PC

- **Móvil:** 2 columnas; `span:2`, `hero` y gráfico nativo a ancho completo.
- **Tablet:** 2 columnas; aprovecha más ancho manteniendo el contrato actual.
- **PC:** desde 900 px reales disponibles, 4 columnas; `span:1` ocupa una, `span:2` ocupa dos, `hero` ocupa cuatro.

Las secciones continúan una debajo de otra y las tarjetas se distribuyen desde la izquierda.

### Container queries

La cuadrícula se decide por el ancho real de `.page`, permitiendo responder a sidebar abierto/cerrado, redimensionado de ventana y rotación de tablet.

### Gráfico nativo

`power-sources-graph` permanece fuera de `.metric-grid`, en light DOM mediante `<slot>`, a ancho completo y sin modificar sus internals.

### Sin cambios funcionales

Se conserva WebSocket, `.storage`, entidades, cálculos, unidades, barras, demo values, tap, hold, more-info, selectores, navegación, Personalización, Guardar/Cancelar, Importar/Exportar/Restablecer y ordenamiento.

## Instalar / probar

1. Actualiza Manager a 1.12.0.
2. Ejecuta `validate_only`.
3. Confirma `VALIDATION_OK`.
4. Ejecuta `install_repair` con `create_backup: true`.
5. Confirma validaciones e `INSTALLATION_OK`.
6. Reinicia Home Assistant.
7. Haz recarga completa del frontend.
8. Sigue `TEST-CHECKLIST-1.12.0.md`.

## Restore

`restore_latest` → `RESTORE_OK` → reiniciar Home Assistant.

## Estado

Mantener como pre-release hasta completar pruebas reales en móvil, tablet y PC.
