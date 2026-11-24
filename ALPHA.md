# Smart Home Suite · rama ALPHA (1.15.0-alpha.4)

Esta rama prueba el **Modo cliente**: el instalador (administrador) ve todo Home Assistant; el cliente (usuario no administrador) solo ve los paneles que tú decidas.

`main` no se modifica. El CI de producción (`builder.yaml`) solo se dispara con pushes a `main`, así que esta rama no publica imágenes.

## Qué hace

- Oculta de la barra lateral los paneles elegidos a los usuarios **no administradores**.
- Paneles configurables: Home, Resumen, Bitácora, Historial, Mapa, Energía (HA), Multimedia, Tareas, Calendario, Iluminación, Energía avanzada, Automatizaciones y Soporte.
- Por defecto oculta los paneles nativos de HA (Home, Resumen, Historial, Bitácora, Mapa, Energía, Multimedia, Tareas, Calendario) y Automatizaciones; deja Smart Home, Iluminación, Energía avanzada y Soporte.
- **Aterrizaje del cliente** (alpha.4): el cliente abre en Smart Home (configurable). Si intenta entrar a `/history`, `/home/overview` o `/`, se le redirige ahí. Los administradores no se tocan.
- Desactivado por defecto. Se activa en *Configurar* de la integración.
- Si está activo y no existe ningún usuario cliente (activo y no administrador), crea una reparación avisándote.
- **Soporte remoto autorizado por el cliente** (alpha.2): el cliente puede *Permitir*, *Extender* y *Finalizar* el acceso temporal de una cuenta de soporte externa. No puede iniciar sesión como esa cuenta, ni cambiar su ID, límites o verificación.

## Qué NO hace (todavía)

- No es una barrera de seguridad: un usuario no administrador sigue pudiendo llamar APIs de HA. Lo que protege es que sea no administrador (no puede abrir Ajustes ni Herramientas de desarrollo, ni guardar configuración de la Suite).
- No cambia el panel predeterminado de HA (ajuste del sistema desde 2025.12): la redirección es en el navegador y puede verse un parpadeo breve. Pendiente: fijar el valor del sistema/usuario cuando se confirme su forma en tu versión.
- Durante la ventana que el cliente autoriza, la cuenta de soporte es **administrador completa** (no hay un rol reducido). La protección es el límite de horas y que el cliente pueda cerrarla.
- Depende de Spook (`homeassistant.enable_user` / `disable_user`), como antes.
- No hay licencias ni aprovisionamiento por casa.

## Cómo probar (usa una instancia de PRUEBA, no la de un cliente)

La integración usa el mismo dominio `smart_home_suite` que la versión actual, así que **reemplaza** a la instalada. Haz un respaldo de Home Assistant antes.

1. Descomprime `smart_home_suite-1.15.0-alpha.4-custom_component.zip` en la carpeta de configuración de HA (donde está `configuration.yaml`). Debe quedar `config/custom_components/smart_home_suite/manifest.json`.
   - Con el add-on *Samba share* o *File editor/Studio Code Server*; o por SSH.
   - Si ya tenías la Suite instalada, bórrala primero o deja que se sobrescriba.
2. Reinicia Home Assistant completo.
3. Ajustes → Dispositivos y servicios → Smart Home Suite → **Configurar**.
4. Activa **Modo cliente (alpha)**, revisa la lista de paneles ocultos y guarda. La integración se recarga sola.
5. Crea un usuario normal: Ajustes → Personas → Usuarios → Añadir. **No** actives "Administrador".
6. Abre otra sesión (ventana privada) con ese usuario.

### Checklist de aceptación

- [ ] Administrador: ve la barra lateral completa como antes.
- [ ] Cliente: solo ve Smart Home y los paneles que dejaste visibles (no ve Resumen ni Home nativos).
- [ ] Cliente: `/history`, `/logbook`, `/config` no aparecen en la barra lateral y, al abrirlos, lo llevan a Smart Home.
- [ ] Desactivar el modo y guardar: el cliente recupera los paneles (sin reiniciar).
- [ ] Sin usuarios no administradores y modo activo: aparece la reparación "Modo cliente sin cuentas".
- [ ] Reiniciar HA con el modo activo: los paneles siguen ocultos al cliente (también los integrados que cargan tarde).
- [ ] Ajustes → Dispositivos y servicios → Smart Home Suite → Diagnóstico: aparece la sección `client_mode`.
- [ ] Sensor "Versión" muestra `1.15.0-alpha.4` y el atributo `client_mode`.

### Paso recomendado del instalador: panel predeterminado del sistema

Desde HA 2025.12 el panel de inicio es un ajuste del sistema (y cada usuario puede cambiarlo en su perfil). Para que HA aterrice en Smart Home sin redirección ni parpadeo: Ajustes → Paneles de control → Smart Home → ⋮ → **Establecer como predeterminado** (si aparece en la lista). El script de aterrizaje queda como respaldo. Pendiente: automatizar este paso.

### Prueba del aterrizaje del cliente (alpha.4)

Si guardaste opciones antes, entra a *Configurar* y **marca Home y Resumen** en paneles ocultos. Después de reiniciar HA, recarga el navegador del cliente con Ctrl+F5.

- [ ] Cliente abre `/` y `/home/overview`: termina en `/smart-home` (no en `/notfound/0` ni en "Sin acceso").
- [ ] Cliente abre `/history` o `/logbook`: termina en `/smart-home`.
- [ ] Cliente: la barra lateral no muestra Home/Resumen/Historial; sí Smart Home, Perfil y lo que dejaste visible.
- [ ] Administrador: abre `/home/overview` y `/history` sin redirección y ve todo.
- [ ] Modo cliente apagado y guardado: el cliente vuelve a ver Home y no es redirigido (recarga el navegador).
- [ ] Cambiar *Panel de inicio del cliente* a Iluminación: el cliente aterriza ahí.
- [ ] Si algo no redirige, en la consola del navegador **del cliente** ejecuta estas tres líneas y envíame los resultados:
  - `window.__smartHomeClientLanding` (debe ser `true`: el script cargó)
  - `await document.querySelector("home-assistant").hass.callWS({type:"smart_home_suite/client_mode/status"})`
  - `Object.keys(document.querySelector("home-assistant").hass.panels)`
- [ ] Opcional, para el siguiente paso: como administrador, `await document.querySelector("home-assistant").hass.callWS({type:"frontend/get_system_data", key:"core"})` y envíame el resultado.

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
