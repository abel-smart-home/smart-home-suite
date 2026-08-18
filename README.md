# Abel Smart Home Suite

Repositorio de distribución de **Smart Home Suite** para Home Assistant OS sin HACS.

## Smart Home Suite 1.7.1 — STABLE

**Último release estable:** Smart Home Suite **1.7.1**.

Smart Home Suite 1.7.1 incorpora como estable la ampliación de **Smart Automations 1.1.1** validada previamente como pre-release en Home Assistant OS.

La funcionalidad validada incluye:

- orden configurable de categorías;
- orden configurable de automatizaciones dentro de cada categoría;
- personalización de texto, icono y colores de categorías;
- personalización visual individual por automatización;
- corrección del selector nativo de colores para evitar cierres prematuros durante la selección.

### Smart Automations 1.1.1

Smart Automations conserva **Smart Automations Panel V1.0.0** como frontend funcional base y utiliza:

- `smart-automations-layout.js` V1.0.0 para ordering y personalización;
- `smart-automations-runtime.js` V1.0.0 con Color Picker Guard V1.0.0.

El Color Picker Guard evita rerenderizar Personalización durante los eventos `input` de `<input type="color">`. La copia de trabajo se actualiza mientras el selector permanece abierto y el preview normal se realiza al finalizar la selección.

Versiones:

- Smart Home Suite / Manager: **1.7.1**
- Smart Home: **1.4.0**
- Smart Lighting: **1.3.0**
- Smart Energy Advanced: **1.4.0**
- Smart Automations: **1.1.1** · base 1.0.0 + layout 1.0.0 + color-picker guard 1.0.0
- Smart Support: **1.1.2**

### Compatibilidad

No cambia:

- `.storage` `smart_automations.config`;
- Storage version 1;
- recetas;
- `RECIPE_VERSION`;
- generación de automatizaciones nativas;
- navegación;
- selectores;
- responsive;
- permisos;
- aislamiento de módulos.

Home Assistant continúa siendo el motor de ejecución de las automatizaciones.

## Distribución

La Suite se distribuye mediante Smart Home Suite Manager e imágenes multi-arquitectura en GHCR.

## Instalación

1. Agrega/actualiza el repositorio.
2. Instala o actualiza **Smart Home Suite Manager 1.7.1**.
3. Opcionalmente ejecuta `validate_only`.
4. Ejecuta `install_repair` con `create_backup: true`.
5. Confirma `INSTALLATION_OK`.
6. Reinicia Home Assistant.
