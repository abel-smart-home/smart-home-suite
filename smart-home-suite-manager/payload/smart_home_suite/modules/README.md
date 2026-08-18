# Smart Home Suite modules · 1.4.0 PRE-RELEASE

| Módulo | Versión | Ruta |
|---|---:|---|
| Smart Home | módulo 1.4.0 · Panel 2.0.5 + Bridge 1.3.0 + runtime 1.1.0 | `/smart-home` |
| Smart Lighting | 1.1.0 · base 1.0.3 + ordering runtime 1.0.0 | `/lighting` |
| Smart Energy Advanced | 1.4.0 · base 1.3.1 + ordering runtime 1.0.0 | `/energy-advanced` |
| Smart Automations | 1.0.0 | `/smart-automations` |
| Smart Support | 1.1.2 | `/support` |

Los módulos son activables de forma independiente desde las opciones de Smart Home Suite y mantienen aislamiento de ciclo de vida.

Smart Lighting 1.1.0 conserva su frontend base V1.0.3, WebSocket y `.storage`, y añade reordenamiento de áreas y dispositivos mediante una extensión runtime de la Suite.

Suite 1.4.0 debe validarse en HAOS real antes de promover el release a **STABLE**.
