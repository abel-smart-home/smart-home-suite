# Smart Energy Advanced module 1.4.0

Smart Energy Advanced 1.4.0 conserva el panel base **V1.3.1** y añade una extensión runtime de Smart Home Suite.

- Ruta: `/energy-advanced`
- Base frontend: `smart-energy-advanced-panel.js` V1.3.1 sin modificar
- Extensión: `smart-energy-advanced-layout.js` V1.0.0
- WebSocket conservado: `smart_energy_advanced_panel/config/*`
- Storage conservado: `.storage/smart_energy_advanced_panel.config`
- Sin migración destructiva
- Las secciones se reordenan usando el array `sections` existente
- Los widgets se reordenan dentro de su sección usando el array `widgets` existente
- Guardar persiste; Cancelar descarta; la vista previa es inmediata
- Los widgets/secciones futuros aparecen automáticamente en los editores de orden
- El gráfico nativo `power-sources-graph` conserva su implementación y acompaña a la sección `realtime`
