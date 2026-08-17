# Changelog

## 1.1.0 - 2026-08-17 · STABLE

- Incorpora **Smart Automations 1.0.0** como quinto módulo oficial de Smart Home Suite.
- Añade panel `/smart-automations` con interfaz simplificada orientada a usuarios comunes.
- Mantiene Home Assistant como motor de ejecución: las automatizaciones creadas son nativas.
- Incluye cuatro recetas iniciales: iluminación por amanecer/anochecer, apagado de luces por ausencia, aviso por potencia elevada y aviso por límite de kWh.
- Valida los sensores `sensor.power_record_ciclo_kwh_mes_facturado` y `sensor.power_record_ciclo_kwh_diario_facturado` como opciones de referencia para límites de energía.
- Añade editor con Guardar/Cancelar, Importar/Exportar/Restablecer y vista previa visual en tiempo real sin autosave.
- Añade personalización responsive completa con ancho base de 520 px, columnas, padding, gaps, radios, colores, tipografía, encabezado y navegación.
- Mantiene selector de entidades e iconos MDI y preservación de foco/scroll durante la edición.
- Elimina el botón global de automatizaciones avanzadas de la experiencia simplificada.
- Conserva la clave `smart_automations.config` utilizada durante el piloto para permitir actualización sin pérdida de configuración.
- Smart Automations se integra al catálogo, opciones, aislamiento, versionado y diagnóstico central de la Suite.
- Actualiza Smart Home Suite Manager e integración a 1.1.0.
- Conserva sin cambios funcionales Smart Home 2.0.5/Bridge 1.3.0, Smart Lighting 1.0.3, Smart Energy Advanced 1.3.1 y Smart Support 1.1.2.

## 1.0.0 - 2026-08-17 · STABLE

- Primera línea base estable de Smart Home Suite.
- Supervisa las acciones `homeassistant.enable_user` y `homeassistant.disable_user` utilizadas por Smart Support.
- Añade Repair automático si Smart Support requiere el proveedor y alguna acción no está disponible.
- El Repair desaparece automáticamente cuando el proveedor vuelve a estar listo o deja de ser requerido.
- Añade estado detallado y no sensible de la dependencia de Smart Support a los diagnósticos.
- Suite Health incorpora dependencias de runtime únicamente cuando realmente son necesarias.
- La pérdida de Spook no descarga ni bloquea Smart Home, Smart Lighting o Smart Energy Advanced.
- Conserva intacto el mecanismo de activación/desactivación de usuario de Smart Support.
- No utiliza APIs internas de autenticación de Home Assistant como reemplazo de Spook.
- Los wrappers de módulos consumen la versión central de la Suite para evitar desalineaciones futuras.
- Conserva los cache-busters de frontend de la base 0.5.0 porque los assets visuales no cambiaron, evitando recursos Lovelace duplicados.
- Conserva sin cambios los frontends productivos.
- El contenedor elimina `__pycache__`/bytecode heredado del payload antes de instalarlo.
- Mantiene instalación con staging, rollback, backups verificados, restore, `validate_only`, Repairs de módulos y CI multi-arquitectura de 0.5.0.

## 0.5.0 - 2026-08-17 · TEST

- Añade validación CI antes de construir cualquier imagen.
- Añade validador de integridad para versiones, módulos, rutas, traducciones y archivos.
- Las compilaciones amd64/aarch64 dependen de que la validación termine correctamente.
- Refuerza `install_repair` con validación previa y posterior.
- Conserva la instalación anterior hasta completar la validación final.
- Restaura automáticamente la versión anterior si falla la validación posterior.
- Detecta y recupera una sustitución interrumpida.
- Verifica la integridad del archivo de backup antes de conservarlo/restaurarlo.
- Añade acción segura `validate_only`.
- Crea un Repair de Home Assistant cuando un módulo habilitado no puede cargar.
- El Repair desaparece automáticamente cuando el módulo se recupera o se deshabilita.
- No modifica los frontends productivos.

## 0.4.0 - 2026-08-17 · TEST

- Añade icono y logo propios a Smart Home Suite Manager.
- Añade branding local a la integración Smart Home Suite (Home Assistant 2026.3+).
- Añade diagnóstico descargable nativo.
- Añade sensor de versión de Suite.
- Añade binary sensor de salud de módulos.
- Centraliza el registro de módulos en `module_catalog.py`.
- El Config Flow y Module Manager consumen el catálogo central.
- Facilita agregar futuros paneles sin duplicar listas en varios archivos.
- No modifica el comportamiento funcional de los cuatro paneles actuales.

## 0.3.3 - 2026-08-17 · TEST

- Smart Home bridge persistido como recurso Lovelace.
- Smart Home deja de depender de una custom dashboard strategy.
- Dashboard Smart Home usa una vista panel normal con la tarjeta del bridge.
- Corrige listener one-shot de Smart Support al recargar la Config Entry.

## 0.3.2 - 2026-08-17 · TEST

- Corrige la carga del backend exacto Smart Home Panel V2.0.5.
- Elimina `importlib.import_module()` dentro del event loop.
- Usa importación relativa de paquete: `from ...legacy import smart_home_panel`.
- Mantiene sin cambios el dashboard storage, frontend V2.0.5 y bridge V1.3.0.
- Mantiene las correcciones de Smart Support introducidas en 0.3.1.

## 0.3.1 - 2026-08-17 · TEST

- Smart Home V2.0.5 ahora está incluido de forma autocontenida.
- Smart Home se crea como dashboard Lovelace storage persistente y visible en Ajustes → Dashboards.
- Eliminada la captura obligatoria desde instalaciones anteriores.
- Smart Support conserva `smart_support_panel.*` y registra descripciones de servicios sin integración separada.
- Limpieza explícita de módulos desactivados para evitar dashboards persistentes huérfanos.

## 0.3.0 - 2026-08-17 · TEST

- Conserva Smart Lighting Panel V1.0.3 exacto.
- Añade Smart Energy Advanced Panel V1.3.0 con frontend exacto.
- Añade Smart Support Panel V1.1.2 con frontend y lógica backend original adaptada al ciclo de vida de la Suite.
- Añade Smart Home Native Bridge V1.3.0 exacto.
- Smart Home captura automáticamente el frontend/backend V2.0.5 existentes antes de migrar.
- Smart Home se registra dinámicamente como dashboard Lovelace nativo `/smart-home`, sin crear un dashboard YAML nuevo.
- Añade selección independiente de los cuatro módulos desde Opciones.
- No publica release hasta completar pruebas reales en HAOS.

## 0.3.0 - 2026-08-17 · TEST correction

- Sustituye el frontend reconstruido de 0.2.0 por el archivo original completo de Smart Lighting Panel V1.0.3.
- Conserva el JavaScript original byte por byte.
- Corrige la clave de `.storage` a `smart_lighting_panel.config`, exactamente igual al componente independiente V1.0.3.
- Mantiene los WebSocket commands originales `smart_lighting_panel/config/get|save|reset`.
- Mantiene Smart Lighting como módulo 1.0.3; el cambio es exclusivamente de empaquetado/integración de Suite.
- Cambia el cache-buster del frontend para evitar reutilizar el JS incorrecto de 0.2.0.

## 0.2.0 - 2026-08-17

- Integra Smart Lighting Panel V1.0.3 como primer módulo de Smart Home Suite.
- Registra `/lighting` automáticamente sin YAML `panel_custom`.
- Sirve el frontend desde la propia integración.
- Añade Module Manager básico y opción activar/desactivar Smart Lighting.
- Conserva el storage key legado `smart_lighting_panel`.
- Mantiene instalación, backup, reparación y restore de Manager 0.1.0.

## 0.1.0 - 2026-08-17

- Infraestructura inicial validada en HAOS amd64.
