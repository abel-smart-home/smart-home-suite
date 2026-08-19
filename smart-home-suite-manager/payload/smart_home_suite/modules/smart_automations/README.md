# Smart Automations 1.3.0 · STABLE

Versión validada en Home Assistant OS y promovida desde el mismo payload pre-release.

## Arquitectura

Cadena preservada:

1. Smart Automations Panel V1.0.0
2. `smart-automations-layout.js` V1.0.0
3. `smart-automations-runtime.js` V1.0.0
4. `smart-automations-responsive.js` V1.0.0
5. `smart-automations-alert-control.js` V1.0.0

## Alert Control

Sólo extiende:

- `high_power`
- `energy_limit`

Funciones:

- 1/2 avisos por evento;
- segundo aviso configurable;
- horario opcional;
- rangos nocturnos que cruzan medianoche;
- descarte absoluto fuera de horario;
- comprobación de horario también para el segundo aviso;
- rearme controlado/histéresis;
- umbral de rearme configurable.

No crea helpers.

## Compatibilidad

- `.storage`: `smart_automations.config`
- Storage version: 1
- WebSocket: sin cambios
- REST nativo: mismo endpoint de Home Assistant
- Home Assistant sigue ejecutando la automatización
- Iluminación/Presencia no cambian
- ordering/personalización/Color Picker Guard/responsive no cambian

## Automatizaciones existentes

No se migran automáticamente.

Abrir y Guardar una automatización de energía aplica la nueva receta.

## Reinicios

Las esperas son nativas. Reiniciar Home Assistant o recargar automatizaciones puede cancelar `for`/`wait_for_trigger`; no se añade estado persistente auxiliar.

## Estado

**STABLE**
