# Smart Home Suite · rama ALPHA (1.15.0-alpha.2)

Esta rama prueba el **Modo cliente**: el instalador (administrador) ve todo Home Assistant; el cliente (usuario no administrador) solo ve los paneles que tú decidas.

`main` no se modifica. El CI de producción (`builder.yaml`) solo se dispara con pushes a `main`, así que esta rama no publica imágenes.

## Qué hace

- Oculta de la barra lateral los paneles elegidos a los usuarios **no administradores**.
- Paneles configurables: Bitácora, Historial, Mapa, Energía (HA), Multimedia, Tareas, Calendario, Iluminación, Energía avanzada, Automatizaciones y Soporte.
- Por defecto oculta todos menos Smart Home, Iluminación, Energía avanzada y Soporte.
- Desactivado por defecto. Se activa en *Configurar* de la integración.
- Si está activo y no existe ningún usuario cliente (activo y no administrador), crea una reparación avisándote.
- **Soporte remoto autorizado por el cliente** (alpha.2): el cliente puede *Permitir*, *Extender* y *Finalizar* el acceso temporal de una cuenta de soporte externa. No puede iniciar sesión como esa cuenta, ni cambiar su ID, límites o verificación.

## Qué NO hace (todavía)

- No es una barrera de seguridad: un usuario no administrador sigue pudiendo llamar APIs de HA. Lo que protege es que sea no administrador (no puede abrir Ajustes ni Herramientas de desarrollo, ni guardar configuración de la Suite).
- No fija el panel de inicio del cliente: en cada dispositivo, Perfil → Panel predeterminado → Smart Home.
- Durante la ventana que el cliente autoriza, la cuenta de soporte es **administrador completa** (no hay un rol reducido). La protección es el límite de horas y que el cliente pueda cerrarla.
- Depende de Spook (`homeassistant.enable_user` / `disable_user`), como antes.
- No hay licencias ni aprovisionamiento por casa.

## Cómo probar (usa una instancia de PRUEBA, no la de un cliente)

La integración usa el mismo dominio `smart_home_suite` que la versión actual, así que **reemplaza** a la instalada. Haz un respaldo de Home Assistant antes.

1. Descomprime `smart_home_suite-1.15.0-alpha.2-custom_component.zip` en la carpeta de configuración de HA (donde está `configuration.yaml`). Debe quedar `config/custom_components/smart_home_suite/manifest.json`.
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
- [ ] Sensor "Versión" muestra `1.15.0-alpha.2` y el atributo `client_mode`.

### Prueba específica de soporte remoto (alpha.2)

Requiere Spook instalado y una cuenta de soporte **administradora, no propietaria**, configurada en el panel Soporte (como en 1.14.x).

- [ ] Cliente: ve el panel Soporte con *Permitir soporte*; no ve el engranaje de personalización.
- [ ] Cliente pulsa *Permitir soporte*: la cuenta de soporte se activa y aparece la cuenta regresiva; en el registro de HA aparece `Remote support start requested by <cliente>`.
- [ ] Cliente pulsa *Extender* y luego *Finalizar*: la cuenta de soporte se desactiva.
- [ ] La cuenta de soporte (con sesión abierta durante la ventana) intenta *Extender* o iniciar otra ventana: rechazado. *Finalizar*: permitido.
- [ ] Cliente intenta guardar configuración o verificar desde la consola del navegador (`callWS` de `smart_support_panel/config/save`): `unauthorized`.
- [ ] Desactiva *El cliente puede autorizar soporte remoto*, guarda y recarga el navegador del cliente: los botones desaparecen.
- [ ] Reiniciar HA con la ventana abierta: la cuenta de soporte queda desactivada (`close_on_restart`, como antes).

## Volver atrás

- Desactiva el Modo cliente en *Configurar* (revierte los paneles al instante), o
- restaura la Suite 1.14.2 desde el add-on Manager (`restore_latest`) o reinstálala desde `main`, y reinicia.

## Notas para desarrollo

- Validación local: `python3 smart-home-suite-manager/scripts/validate_release.py`.
- La lógica de `client_mode.py` se probó contra un simulador de la API de paneles de HA, **no** contra un Home Assistant real: el punto 4 de la checklist es la prueba que falta.
- Corrección incluida en `run.sh`: la validación previa a instalar/restaurar era un no-op (ver CHANGELOG). Aplica solo al add-on Manager; el zip de custom_component no la usa. Si instalas con el add-on desde esta rama, ahora sí rechazará payloads incompletos.
- Hallazgo ajeno a esta rama: varios módulos hacen `hass.data["frontend_panels"].get(path, {}).get("component_name")`, pero ese diccionario guarda objetos `Panel`, no diccionarios. Solo falla si el panel ya existe al hacer setup. No se tocó para no alterar módulos validados.
