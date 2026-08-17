# Abel Smart Home Suite

Repositorio de distribución de **Smart Home Suite** para Home Assistant OS sin HACS.

## Smart Home Suite 1.0.0

**Smart Home Suite 1.0.0** es la primera línea base estable de la Suite.

- Smart Home Suite / Manager: **1.0.0**
- Smart Home: Panel **2.0.5** + Native Dashboard Bridge **1.3.0**
- Smart Lighting: **1.0.3**
- Smart Energy Advanced: **1.3.0**
- Smart Support: **1.1.2**

Todos los módulos se instalan bajo `custom_components/smart_home_suite`.
Los frontends productivos conservan sus versiones previamente validadas.

## Distribución

La Suite se distribuye mediante:

1. Repositorio de Home Assistant Apps.
2. **Smart Home Suite Manager**.
3. Imágenes multi-arquitectura publicadas en GHCR.
4. Instalación automática de la integración dentro de `custom_components`.

No requiere HACS.

## Robustez

Smart Home Suite incluye:

- instalación mediante staging;
- validación antes y después del reemplazo;
- rollback automático;
- backups verificados;
- restauración del último backup;
- `validate_only` para validar sin modificar la instalación;
- validación CI antes de construir imágenes;
- aislamiento de fallos entre módulos;
- Home Assistant Repairs;
- diagnósticos descargables;
- sensor de versión y sensor de salud de la Suite.

## Smart Support

Smart Support continúa utilizando las acciones:

- `homeassistant.enable_user`
- `homeassistant.disable_user`

proporcionadas actualmente por **Spook**.

La versión 1.0.0 supervisa esta dependencia sin sustituirla ni utilizar APIs
internas de autenticación de Home Assistant. Si Smart Support está configurado
y las acciones dejan de estar disponibles:

- se genera un aviso en **Ajustes → Reparaciones**;
- `binary_sensor.smart_home_suite_health` refleja el problema;
- los diagnósticos indican qué acción falta;
- los demás módulos continúan funcionando;
- el aviso se elimina automáticamente cuando el proveedor vuelve a estar listo.

Si Smart Support no tiene un usuario configurado o está deshabilitado, la
dependencia no se considera requerida y no se genera un aviso innecesario.

## Instalación

Agregar el repositorio:

`https://github.com/abel-smart-home/smart-home-suite`

Instalar **Smart Home Suite Manager** y ejecutar:

`install_repair`

Una instalación correcta termina en:

`INSTALLATION_OK`

Después reiniciar Home Assistant.
