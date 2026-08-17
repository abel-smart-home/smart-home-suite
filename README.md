# Abel Smart Home Suite

Repositorio de distribución de **Smart Home Suite** para Home Assistant OS sin HACS.

## Smart Home Suite 1.1.0

**Smart Home Suite 1.1.0** incorpora Smart Automations como quinto módulo oficial de la Suite.

- Smart Home Suite / Manager: **1.1.0**
- Smart Home: Panel **2.0.5** + Native Dashboard Bridge **1.3.0**
- Smart Lighting: **1.0.3**
- Smart Energy Advanced: **1.3.1**
- Smart Automations: **1.0.0**
- Smart Support: **1.1.2**

Todos los módulos se instalan bajo `custom_components/smart_home_suite` y se administran desde una sola Config Entry.

## Smart Automations

Smart Automations ofrece una interfaz sencilla para automatizaciones frecuentes sin crear un motor paralelo. Home Assistant conserva la ejecución y las automatizaciones generadas son nativas.

Recetas iniciales:

- iluminación por amanecer/anochecer;
- apagado de luces por ausencia;
- notificación por potencia elevada;
- notificación por límite de kWh.

El panel incluye editor responsive, Guardar/Cancelar, Importar/Exportar/Restablecer, selector de entidades e iconos MDI, navegación configurable, persistencia propia y vista previa visual en tiempo real durante la personalización.

## Distribución

La Suite se distribuye mediante:

1. Repositorio de Home Assistant Apps.
2. **Smart Home Suite Manager**.
3. Imágenes multi-arquitectura publicadas en GHCR.
4. Instalación automática de la integración dentro de `custom_components`.

No requiere HACS.

## Robustez

Smart Home Suite incluye instalación mediante staging, validación previa/posterior, rollback automático, backups verificados, restauración, `validate_only`, validación CI, aislamiento de fallos entre módulos, Home Assistant Repairs y diagnósticos descargables.

## Smart Support

Smart Support continúa utilizando las acciones `homeassistant.enable_user` y `homeassistant.disable_user` proporcionadas actualmente por Spook. La Suite supervisa esa dependencia sin sustituirla ni utilizar APIs internas de autenticación.

## Instalación

Agregar el repositorio:

`https://github.com/abel-smart-home/smart-home-suite`

Instalar **Smart Home Suite Manager** y ejecutar:

`install_repair`

Una instalación correcta termina en:

`INSTALLATION_OK`

Después reiniciar Home Assistant.
