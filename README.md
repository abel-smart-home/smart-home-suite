# Abel Smart Home Suite

Repositorio de distribución de **Smart Home Suite** para Home Assistant OS sin HACS.

## Smart Home Suite 1.3.0 — STABLE

**Smart Home Suite 1.3.0** promueve a estable la versión validada previamente como pre-release y actualiza **Smart Energy Advanced a 1.4.0**.

La actualización conserva Smart Energy Advanced Panel V1.3.1 como frontend base y añade mediante el runtime de la Suite el reordenamiento de secciones y widgets, sin cambiar su `.storage`, WebSocket, entidades ni comportamiento existente.

- Smart Home Suite / Manager: **1.3.0**
- Smart Home: módulo **1.4.0** · Panel **2.0.5** + Native Dashboard Bridge **1.3.0** + Suite Runtime **1.1.0**
- Smart Lighting: **1.0.3**
- Smart Energy Advanced: **1.4.0** · base **1.3.1** + ordering runtime **1.0.0**
- Smart Automations: **1.0.0**
- Smart Support: **1.1.2**

Todos los módulos se instalan bajo `custom_components/smart_home_suite` y se administran desde una sola Config Entry.

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

Recetas iniciales:

- iluminación por amanecer/anochecer;
- apagado de luces por ausencia;
- notificación por potencia elevada;
- notificación por límite de kWh.

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
