# Changelog

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
