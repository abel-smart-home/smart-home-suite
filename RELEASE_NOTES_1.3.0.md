# Smart Home Suite 1.3.0

## Smart Energy Advanced 1.4.0 · reordenamiento de secciones y widgets

Smart Home Suite 1.3.0 promueve a **estable** el payload 1.3.0 validado previamente como pre-release en Home Assistant OS.

### Novedades

- Añade **Orden de secciones** en Personalización → General.
- Añade **Orden de widgets eléctricos** en Personalización → Datos.
- Los controles ↑ / ↓ muestran el cambio inmediatamente en la vista previa.
- Guardar persiste el nuevo orden.
- Cancelar vuelve al último orden guardado.
- Los widgets se reordenan únicamente dentro de su propia sección.
- Las secciones se pueden mover libremente.
- Los widgets y secciones futuros aparecen automáticamente en los controles de orden.
- El gráfico nativo `power-sources-graph` conserva su implementación y se desplaza junto con Tiempo real.
- La etiqueta visual de Smart Energy Advanced es v1.4.0.

### Compatibilidad

- Conserva `.storage/smart_energy_advanced_panel.config`.
- Conserva `smart_energy_advanced_panel/config/*`.
- Conserva entidades y configuración existentes.
- Conserva navegación, responsive, selector de entidades, selector MDI, tap/hold, Importar/Exportar/Restablecer y tarjeta nativa de energía.
- No requiere migración de configuración.
- Smart Energy Advanced Panel V1.3.1 permanece como frontend base.
- El comportamiento nuevo vive en `smart-energy-advanced-layout.js` V1.0.0.
- Smart Home, Smart Lighting, Smart Automations y Smart Support no reciben cambios funcionales.

### Versiones

- Smart Home Suite / Manager: **1.3.0**
- Smart Energy Advanced: **1.4.0**
- Smart Energy base frontend: **1.3.1**
- Energy ordering runtime: **1.0.0**

### Estado

**STABLE**

La promoción no cambia el payload funcional probado durante el pre-release.
