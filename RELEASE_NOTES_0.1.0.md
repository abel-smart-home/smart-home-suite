# Smart Home Suite 0.1.0 — Initial Infrastructure

Primera versión de infraestructura de **Abel Smart Home Suite** para Home Assistant OS.

## Incluye

- Repositorio compatible con Home Assistant Apps.
- Smart Home Suite Manager para `amd64` y `aarch64`.
- Instalación y reparación automática de la integración `smart_home_suite` sin HACS.
- Acceso de escritura exclusivamente a la configuración de Home Assistant mediante el mapeo oficial `homeassistant_config`.
- Reemplazo preparado y validado antes de activar el nuevo componente.
- Backup configurable de la integración existente.
- Restauración del respaldo más reciente.
- Integración mínima Smart Home Suite con Config Flow para validar el ciclo completo.
- GitHub Actions para construir y publicar imagen multi-arquitectura en GHCR.

## Importante

Esta versión **todavía no contiene los paneles productivos**. Su objetivo es validar instalación, actualización y recuperación antes de migrar Smart Home, Advanced Energy, Smart Lighting y Remote Support.

## Prueba esperada

Después de instalar y ejecutar Smart Home Suite Manager, el log debe terminar en `INSTALLATION_OK`. Tras reiniciar Home Assistant debe aparecer `Smart Home Suite` en Ajustes → Dispositivos y servicios → Añadir integración.
