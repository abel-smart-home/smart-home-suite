# Abel Smart Home Suite

Repositorio de distribución de **Smart Home Suite** para Home Assistant OS sin HACS.

## Smart Home Suite 1.7.1 — PRE-RELEASE

**Último release estable:** Smart Home Suite **1.6.0**.

Smart Home Suite 1.7.1 corrige el comportamiento del selector nativo de colores de **Smart Automations 1.1.1**.

La funcionalidad de 1.7.0 se conserva:

- orden de categorías;
- orden de automatizaciones dentro de cada categoría;
- apariencia de categorías;
- personalización visual por tarjeta.

### Corrección 1.7.1

En 1.7.0 los campos `input[type="color"]` heredaban el preview por `input` del panel base. El panel se rerenderizaba mientras el selector de color del navegador seguía abierto, destruyendo el control activo y cerrando prematuramente la ventana de colores.

1.7.1 añade `smart-automations-runtime.js` V1.0.0:

- durante `input` del selector de color actualiza solamente la copia temporal;
- no rerenderiza mientras el picker está abierto;
- el evento normal `change` realiza el preview al finalizar la selección;
- Guardar persiste;
- Cancelar descarta;
- todos los demás controles conservan su preview existente.

Versiones:

- Smart Home Suite / Manager: **1.7.1**
- Smart Home: **1.4.0**
- Smart Lighting: **1.3.0**
- Smart Energy Advanced: **1.4.0**
- Smart Automations: **1.1.1** · base 1.0.0 + layout 1.0.0 + color-picker guard 1.0.0
- Smart Support: **1.1.2**

No cambia `.storage`, automatizaciones nativas, recetas, navegación, selectores, responsive ni aislamiento de módulos.

Esta versión continúa como **PRE-RELEASE** hasta validar el arreglo en Home Assistant OS real.
