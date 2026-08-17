# Abel Smart Home Suite

Repositorio de Home Assistant Apps para instalar y mantener **Smart Home Suite** sin HACS.

> Estado: **0.1.0 / infraestructura inicial**. Esta versión instala una integración mínima de prueba. Los paneles reales se incorporarán después de validar el proceso completo de instalación.

## Objetivo

- Un solo repositorio para HAOS.
- Un solo **Smart Home Suite Manager**.
- Instalación/reparación automática de `/config/custom_components/smart_home_suite`.
- Sin copiar archivos uno por uno con File Editor.
- Preparado para módulos/paneles futuros.
- Backup del componente anterior antes de reemplazarlo.

## Añadir a Home Assistant OS

En Home Assistant:

1. Ajustes → Apps → App Store.
2. Menú de repositorios.
3. Agregar:

   `https://github.com/abel-smart-home/smart-home-suite`

4. Recargar el App Store.
5. Instalar **Smart Home Suite Manager**.

## Primera prueba 0.1.0

1. Verificar que GitHub Actions terminó correctamente y que la imagen publicada es accesible.
2. Instalar Smart Home Suite Manager.
3. En Configuración del Manager dejar `Instalar / reparar`.
4. Iniciar el Manager una vez.
5. Revisar el log. Debe terminar con `INSTALLATION_OK`.
6. Reiniciar Home Assistant.
7. Ajustes → Dispositivos y servicios → Añadir integración → buscar `Smart Home Suite`.
8. Completar el flujo de configuración.

## Arquitecturas

- amd64
- aarch64

## Versionado

El Manager y el payload de la Suite tienen versionado explícito. En esta etapa ambos usan `0.1.0`.
