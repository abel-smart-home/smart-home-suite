# Abel Smart Home Suite

Repositorio de distribución de **Smart Home Suite** para Home Assistant OS sin HACS.

## Smart Home Suite 1.4.0 — PRE-RELEASE

**Smart Home Suite 1.4.0** prepara para laboratorio el reordenamiento de **Smart Lighting 1.1.0**.

La actualización conserva **Smart Lighting Panel V1.0.3** como frontend base y añade `smart-lighting-layout.js` V1.0.0 como extensión runtime de la Suite. El orden de áreas y dispositivos se guarda usando los arrays existentes, sin cambiar `.storage`, WebSocket, entidades ni acciones.

- Smart Home Suite / Manager: **1.4.0**
- Smart Home: módulo **1.4.0** · Panel **2.0.5** + Native Dashboard Bridge **1.3.0** + Suite Runtime **1.1.0**
- Smart Lighting: **1.1.0** · base **1.0.3** + ordering runtime **1.0.0**
- Smart Energy Advanced: **1.4.0** · base **1.3.1** + ordering runtime **1.0.0**
- Smart Automations: **1.0.0**
- Smart Support: **1.1.2**

Todos los módulos se instalan bajo `custom_components/smart_home_suite` y se administran desde una sola Config Entry.

## Smart Lighting 1.1.0

La ampliación de Lighting se aplica mediante `smart-lighting-layout.js` V1.0.0; el frontend base `smart-lighting-panel.js` V1.0.3 permanece sin reconstruir.

Novedades principales:

- orden configurable de las áreas con controles ↑ / ↓;
- orden configurable de luces e interruptores dentro de su propia área;
- vista previa inmediata mientras se edita;
- Guardar persiste el nuevo orden y Cancelar lo descarta;
- áreas y dispositivos futuros aparecen automáticamente en los controles de orden;
- no requiere migración de `.storage`;
- conserva selector de entidades, selector MDI, navegación, responsive, tap/hold, Importar/Exportar/Restablecer y aislamiento del módulo.

## Smart Energy Advanced 1.4.0

La ampliación de Energy Advanced se aplica mediante `smart-energy-advanced-layout.js` V1.0.0; el frontend base `smart-energy-advanced-panel.js` V1.3.1 permanece sin reconstruir.

Novedades principales:

- orden configurable de las secciones;
- orden configurable de widgets dentro de su propia sección;
- vista previa inmediata mientras se edita;
- Guardar persiste el nuevo orden y Cancelar lo descarta;
- widgets y secciones futuros aparecen automáticamente en los controles de orden;
- el gráfico nativo `power-sources-graph` conserva su integración y acompaña a la sección Tiempo real;
- no requiere migración de `.storage`;
- conserva selectores, navegación, responsive, acciones tap/hold, Importar/Exportar/Restablecer y aislamiento del módulo.

## Smart Home 1.4.0

La ampliación de Smart Home se aplica desde el runtime de la Suite; `smart-home-panel.js` V2.0.5 y `smart-home-native.js` V1.3.0 permanecen sin cambios.

Novedades principales:

- orden configurable de las cuatro tarjetas existentes;
- tarjetas adicionales opcionales para otras entidades;
- tipos iniciales: valor, barra de progreso y gráfica de historial;
- selector de entidades existente y selector MDI nativo;
- personalización de tamaño, fondo, borde, radio, padding, colores, iconos, texto, unidad y valor;
- acciones independientes tap/hold: más información, ninguna, navegar, URL y toggle;
- ID estable por tarjeta adicional;
- compatibilidad con configuraciones anteriores: si no existe `card_layout`, se conserva el orden histórico;
- las gráficas consultan el historial mediante WebSocket y usan caché para evitar consultas continuas al Recorder.

Solo las tarjetas participan en el reordenamiento. Encabezado, navegación, avisos, configuración y demás estructura del panel mantienen su posición y comportamiento actuales.

## Smart Automations

Smart Automations ofrece una interfaz sencilla para automatizaciones frecuentes sin crear un motor paralelo. Home Assistant conserva la ejecución y las automatizaciones generadas son nativas.

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

## Instalación de pre-release

Agregar el repositorio:

`https://github.com/abel-smart-home/smart-home-suite`

Instalar o actualizar **Smart Home Suite Manager** y ejecutar primero `validate_only`; después ejecutar `install_repair` con `create_backup: true`.

Una instalación correcta termina en:

`INSTALLATION_OK`

Después reiniciar Home Assistant y completar `TEST-CHECKLIST-1.4.0.md` antes de promover este release a estable.
