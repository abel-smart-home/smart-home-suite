# Smart Home Suite v1.0.0 — Stable Baseline

Primera línea base estable de **Abel Smart Home Suite** para Home Assistant OS.

Esta versión consolida la infraestructura validada en 0.5.0 y añade supervisión
de la dependencia externa utilizada por Smart Support, sin sustituir su mecanismo
actual de activación/desactivación de usuarios.

## Smart Support dependency supervision

Smart Support continúa utilizando las acciones proporcionadas por Spook:

- `homeassistant.enable_user`
- `homeassistant.disable_user`

Smart Home Suite ahora comprueba su disponibilidad y reacciona de forma segura.

Cuando Smart Support está habilitado y existe un usuario de soporte configurado:

- si ambas acciones están disponibles, el proveedor se considera `ready`;
- si falta alguna acción, se crea un Repair de Home Assistant;
- Suite Health cambia a estado no saludable mientras la dependencia requerida falta;
- los diagnósticos indican individualmente qué acciones están disponibles;
- Smart Home, Smart Lighting y Smart Energy Advanced permanecen aislados y continúan funcionando;
- el Repair se elimina automáticamente cuando las acciones vuelven a estar disponibles.

La dependencia no se marca como requerida si Smart Support está deshabilitado o
no existe todavía un usuario de soporte configurado, evitando avisos innecesarios.

## Seguridad y compatibilidad

- No se modifica la lógica que activa/desactiva el usuario de soporte.
- No se utilizan APIs internas de autenticación de Home Assistant para reemplazar Spook.
- Se conserva la protección contra usar la cuenta propietaria.
- Se conserva la validación de pertenencia al grupo Administradores.
- Se conserva la confirmación del estado real del usuario después de cada cambio.
- Se conserva expiración automática, extensión controlada y cierre configurable al reiniciar.

## Diagnósticos

Los diagnósticos de Smart Home Suite ahora incluyen una sección no sensible de
Smart Support con:

- proveedor de acciones;
- si la dependencia es requerida;
- estado `ready`;
- disponibilidad de `enable_user`;
- disponibilidad de `disable_user`;
- si existe un ID de usuario configurado;
- resultado de las verificaciones de seguridad sin exponer el ID ni el nombre del usuario.

## Suite Health

`binary_sensor.smart_home_suite_health` ahora considera dos niveles:

1. carga correcta de los módulos habilitados;
2. dependencias de runtime que realmente sean necesarias.

Una instalación sin usuario de soporte configurado puede seguir estando saludable
aunque Spook no esté instalado.

## Versionado interno

Los wrappers de módulos consumen ahora la versión central de la Suite en vez de
mantener una copia hard-coded. Esto evita desalineaciones de versión en futuras
actualizaciones. Los cache-busters de los frontends permanecen fijados a la base
0.5.0 porque los archivos visuales no cambiaron, evitando crear recursos Lovelace
duplicados únicamente por una actualización del núcleo.

## Infraestructura conservada de 0.5.0

- validación CI previa a construir;
- `RELEASE_VALIDATION_OK`;
- `CI_VALIDATION_OK`;
- instalación mediante staging;
- rollback automático;
- recuperación de reemplazos interrumpidos;
- backups verificados;
- `validate_only`;
- restauración segura;
- Repairs para fallos de módulos;
- builds `amd64` y `aarch64`;
- manifest multi-arquitectura GHCR.

## Módulos incluidos

- Smart Home Panel 2.0.5
- Smart Home Native Dashboard Bridge 1.3.0
- Smart Lighting 1.0.3
- Smart Energy Advanced 1.3.0
- Smart Support 1.1.2

Los frontends productivos no se modifican en esta versión.

## Instalación

Agregar:

`https://github.com/abel-smart-home/smart-home-suite`

Instalar **Smart Home Suite Manager**, ejecutar:

`install_repair`

Una instalación correcta termina con:

`INSTALLATION_OK`

Después reiniciar Home Assistant.
