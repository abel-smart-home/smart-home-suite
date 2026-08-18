# Smart Home Suite modules · 1.5.0 PRE-RELEASE

| Módulo | Versión | Ruta |
|---|---:|---|
| Smart Home | módulo 1.4.0 · Panel 2.0.5 + Bridge 1.3.0 + runtime 1.1.0 | `/smart-home` |
| Smart Lighting | 1.2.0 · base 1.0.3 + layout runtime 1.1.0 | `/lighting` |
| Smart Energy Advanced | 1.4.0 · base 1.3.1 + ordering runtime 1.0.0 | `/energy-advanced` |
| Smart Automations | 1.0.0 | `/smart-automations` |
| Smart Support | 1.1.2 | `/support` |

Los módulos siguen siendo activables de forma independiente y mantienen aislamiento de ciclo de vida.

Smart Lighting 1.2.0 conserva el reordenamiento de áreas/dispositivos y añade acciones globales opcionales para encender/apagar todas las entidades válidas configuradas, sin cambiar su `.storage`, WebSocket ni frontend base V1.0.3.
