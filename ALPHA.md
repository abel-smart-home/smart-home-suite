# Smart Home Suite · rama ALPHA (1.15.0-alpha.1)

Esta rama prueba el **Modo cliente**: el instalador (administrador) ve todo Home Assistant; el cliente (usuario no administrador) solo ve los paneles que tú decidas.

`main` no se modifica. El CI de producción (`builder.yaml`) solo se dispara con pushes a `main`, así que esta rama no publica imágenes.

## Qué hace

- Oculta de la barra lateral los paneles elegidos a los usuarios **no administradores**.
- Paneles configurables: Bitácora, Historial, Mapa, Energía (HA), Multimedia, Tareas, Calendario, Iluminación, Energía avanzada, Automatizaciones y Soporte.
- Por defecto oculta todos menos Smart Home, Iluminación y Energía avanzada.
- Desactivado por defecto. Se activa en *Configurar* de la integración.
- Si está activo y no existe ningún usuario cliente (activo y no administrador), crea una reparación avisándote.

## Qué NO hace (todavía)

- No es una barrera de seguridad: un usuario no administrador sigue pudiendo llamar APIs de HA. Lo que protege es que sea no administrador (no puede abrir Ajustes ni Herramientas de desarrollo, ni guardar configuración de la Suite).
- No fija el panel de inicio del cliente: en cada dispositivo, Perfil → Panel predeterminado → Smart Home.
- El cliente no puede iniciar sesiones de Soporte (esos comandos son solo administrador). Está pendiente decidir si debe poder.
- No hay licencias ni aprovisionamiento por casa.

## Cómo probar (usa una instancia de PRUEBA, no la de un cliente)

La integración usa el mismo dominio `smart_home_suite` que la versión actual, así que **reemplaza** a la instalada. Haz un respaldo de Home Assistant antes.

1. Descomprime `smart_home_suite-1.15.0-alpha.1-custom_component.zip` en la carpeta de configuración de HA (donde está `configuration.yaml`). Debe quedar `config/custom_components/smart_home_suite/manifest.json`.
   - Con el add-on *Samba share* o *File editor/Studio Code Server*; o por SSH.
   - Si ya tenías la Suite instalada, bórrala primero o deja que se sobrescriba.
2. Reinicia Home Assistant completo.
3. Ajustes → Dispositivos y servicios → Smart Home Suite → **Configurar**.
4. Activa **Modo cliente (alpha)**, revisa la lista de paneles ocultos y guarda. La integración se recarga sola.
5. Crea un usuario normal: Ajustes → Personas → Usuarios → Añadir. **No** actives "Administrador".
6. Abre otra sesión (ventana privada) con ese usuario.

### Checklist de aceptación

- [ ] Administrador: ve la barra lateral completa como antes.
- [ ] Cliente: solo ve Resumen, Smart Home y los paneles que dejaste visibles.
- [ ] Cliente: `/history`, `/logbook`, `/config` no aparecen ni abren.
- [ ] Desactivar el modo y guardar: el cliente recupera los paneles (sin reiniciar).
- [ ] Sin usuarios no administradores y modo activo: aparece la reparación "Modo cliente sin cuentas".
- [ ] Reiniciar HA con el modo activo: los paneles siguen ocultos al cliente (también los integrados que cargan tarde).
- [ ] Ajustes → Dispositivos y servicios → Smart Home Suite → Diagnóstico: aparece la sección `client_mode`.
- [ ] Sensor "Versión" muestra `1.15.0-alpha.1` y el atributo `client_mode`.

## Volver atrás

- Desactiva el Modo cliente en *Configurar* (revierte los paneles al instante), o
- restaura la Suite 1.14.2 desde el add-on Manager (`restore_latest`) o reinstálala desde `main`, y reinicia.

## Notas para desarrollo

- Validación local: `python3 smart-home-suite-manager/scripts/validate_release.py`.
- La lógica de `client_mode.py` se probó contra un simulador de la API de paneles de HA, **no** contra un Home Assistant real: el punto 4 de la checklist es la prueba que falta.
- Corrección incluida en `run.sh`: la validación previa a instalar/restaurar era un no-op (ver CHANGELOG). Aplica solo al add-on Manager; el zip de custom_component no la usa. Si instalas con el add-on desde esta rama, ahora sí rechazará payloads incompletos.
- Hallazgo ajeno a esta rama: varios módulos hacen `hass.data["frontend_panels"].get(path, {}).get("component_name")`, pero ese diccionario guarda objetos `Panel`, no diccionarios. Solo falla si el panel ya existe al hacer setup. No se tocó para no alterar módulos validados.
