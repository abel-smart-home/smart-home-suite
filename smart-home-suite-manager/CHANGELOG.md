# Changelog

## 1.15.0-alpha.2 - 2026-11-22 · ALPHA

- **El cliente puede autorizar el acceso remoto de soporte** (Smart Support 1.3.0), sin poder iniciar sesión como soporte ni cambiar su configuración.
- Con Modo cliente activo y la opción *El cliente puede autorizar soporte remoto* (activada por defecto), un usuario activo que no es administrador puede **iniciar, extender y finalizar** la ventana de acceso temporal de la cuenta de soporte.
- Siguen siendo solo administrador: guardar o restablecer la configuración de Soporte, verificar la cuenta y los servicios `start/extend/stop/verify_support`.
- La cuenta de soporte **no puede iniciar ni extender su propia ventana** (sí puede finalizarla). Aplica a comandos del panel y a servicios.
- Cada inicio, extensión o cierre queda en el registro con el nombre y el ID del usuario que lo pidió.
- El panel Soporte ya no está en la lista de paneles ocultos por defecto del Modo cliente.
- El panel muestra los botones Permitir/Extender/Finalizar a no administradores solo si el backend lo permite (`client_can_authorize`); el resto de botones de administrador siguen ocultos.
- Con el Modo cliente desactivado, o con la opción apagada, el comportamiento es idéntico a 1.14.2 y alpha.1.
- Nueva versión del archivo JS del panel (cache-buster) para que los navegadores no usen el anterior.
- Límite: durante la ventana autorizada la cuenta de soporte es **administrador completa** de Home Assistant. El control es el tiempo (máximo configurable) y el cierre por el cliente, no un permiso reducido.

## 1.15.0-alpha.1 - 2026-11-21 · ALPHA

Rama `alpha`. No se publica en `main` ni se construye con el CI de producción.

- Nuevo **Modo cliente** (`client_mode.py`): oculta paneles de la barra lateral a usuarios que no son administradores.
- Los administradores conservan la interfaz completa de Home Assistant.
- Se configura en Ajustes → Dispositivos y servicios → Smart Home Suite → Configurar.
- Desactivado por defecto: una instalación existente no cambia al actualizar.
- Panel por panel, la restricción se aplica con la API pública de paneles (`require_admin`) y se revierte al desactivar o descargar la Suite.
- Reparación (Repairs) si el modo está activo pero no existe ningún usuario activo que no sea administrador.
- Sin migración de `.storage`; opciones en la config entry, con valores por defecto.
- Módulos Smart Home, Lighting, Energy Advanced, Automations y Support sin cambios funcionales.
- `run.sh` y `validate_release.py` exigen `client_mode.py` desde 1.15; los respaldos 1.14.x siguen siendo restaurables.
- **Corrección en `run.sh`**: `validate_component` no validaba nada (bash ignora `set -e` dentro de funciones llamadas desde `if`/`!`), por lo que un directorio vacío se aceptaba como instalación válida y el rollback automático nunca se activaba. Ahora las comprobaciones corren en un shell nuevo con errexit activo. Verificado: acepta el payload 1.14.2 de `main` y el 1.15 alpha, y rechaza directorios vacíos y payloads incompletos.
- Límite conocido: es ocultamiento de interfaz, no una frontera de seguridad. La protección real es que el cliente sea usuario no administrador.

## 1.14.2 - 2026-09-02 · TEST

- Actualiza **Smart Automations a 1.3.2**.
- Actualiza Alert Control a **V1.1.0**.
- Añade `schedule_outside_behavior`.
- Default `discard`: conserva exactamente el comportamiento de 1.14.1.
- Nuevo `pending`: un evento fuera del horario puede esperar al siguiente inicio.
- La espera compite entre `schedule_start` y el rearme mediante `wait_for_trigger`.
- Si rearma antes del horario, cancela el aviso pendiente.
- Si llega el horario y sigue arriba del límite, envía el primer aviso.
- Si al llegar el horario ya está debajo del límite principal pero aún no alcanzó el rearme, no avisa y conserva el bloqueo hasta el rearme.
- Mantiene 1/2 avisos, segundo aviso, horario y histéresis.
- Mantiene `mode: single` + `max_exceeded: silent` de 1.14.1.
- No crea helpers.
- No migra `.storage`.
- Automatizaciones existentes no se reescriben automáticamente.
- Smart Home V3, Lighting, Energy Advanced y Support sin cambios.
- Publicar como PRE-RELEASE.

## 1.14.1 - 2026-09-02 · TEST

- Smart Automations 1.3.1.
- Alert Control V1.0.1.
- Añade `max_exceeded: silent` a las dos alertas energéticas.
- Mantiene `mode: single` y elimina el warning esperado `Already running`.
- Sin migración de `.storage`.

## 1.14.0 - 2026-08-19 · STABLE

- Smart Home module 1.6.0.
- Smart Home Panel V3.1.0.
- Smart Lighting 1.4.1.
- Smart Energy Advanced 1.5.3.
- Smart Automations 1.3.0.
- Smart Support 1.2.0.
- Payload estable validado.

Historial anterior disponible en releases previos.
