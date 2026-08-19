# Abel Smart Home Suite

Repositorio de distribución de **Smart Home Suite** para Home Assistant OS sin HACS.

## Smart Home Suite 1.12.0 — PRE-RELEASE

**Último release estable:** Smart Home Suite **1.11.0**.

Smart Home Suite 1.12.0 introduce la primera prueba responsive de **Smart Energy Advanced 1.5.0**, siguiendo el patrón aislado ya validado en Smart Lighting y Smart Automations.

### Versiones

- Smart Home Suite / Manager: **1.12.0 PRE-RELEASE**
- Smart Home: **1.4.0**
- Smart Lighting: **1.4.1**
- Smart Energy Advanced: **1.5.0**
- Smart Automations: **1.3.0**
- Smart Support: **1.2.0**

## Smart Energy Advanced 1.5.0

Arquitectura preservada:

- Smart Energy Advanced Panel V1.3.1;
- `smart-energy-advanced-layout.js` V1.0.0;
- nuevo `smart-energy-advanced-responsive.js` V1.0.0;
- `.storage/smart_energy_advanced_panel.config` versión 1;
- WebSocket y acciones existentes;
- tarjeta oficial `power-sources-graph`.

### Primera prueba responsive

El cambio se limita a presentación:

- ancho heredado 520 px conserva móvil;
- tablet/PC pueden aprovechar hasta 1000 px;
- móvil: **2 columnas**;
- tablet: **2 columnas**;
- PC: **4 columnas**;
- `span:1` se conserva;
- `span:2` sigue ocupando toda la fila en móvil/tablet y ocupa 2 de 4 columnas en PC;
- widgets `hero` permanecen a ancho completo;
- el gráfico nativo permanece a ancho completo;
- secciones continúan una debajo de otra;
- tarjetas se distribuyen desde la izquierda;
- un `panel_max_width` personalizado distinto de 520 se respeta.

No existe migración y el responsive runtime no escribe configuración.

## Smart Automations 1.3.0

Permanece sin cambios funcionales respecto al release estable 1.11.0, incluido Alert Control V1.0.0 para Consumo elevado y Límite de kWh.

## Smart Lighting 1.4.1

Permanece estable con responsive móvil/tablet/PC y Global Actions alineadas al grid en tablet/PC.

## Distribución

Imagen esperada:

`ghcr.io/abel-smart-home/smart-home-suite-manager:1.12.0`

Arquitecturas:

- `amd64`
- `aarch64`

## Validación recomendada

1. Publica `v1.12.0` como pre-release.
2. Confirma Actions → Builder completamente verde.
3. Actualiza primero una instancia laboratorio.
4. Ejecuta `validate_only`.
5. Ejecuta `install_repair` con backup.
6. Prueba Energy Advanced en móvil, tablet y PC.
7. Verifica acciones, selectores, editor, ordenamiento y gráfico nativo.
8. Solo después de completar el checklist decidir si se hace otra prueba o se promueve el mismo payload a estable.

## Rollback

Si la prueba falla, usa `restore_latest` desde Smart Home Suite Manager y reinicia Home Assistant.

## Importante

No instales simultáneamente versiones standalone de paneles ya incluidos en Smart Home Suite.
