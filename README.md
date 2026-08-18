# Abel Smart Home Suite

Repositorio de distribución de **Smart Home Suite** para Home Assistant OS sin HACS.

## Smart Home Suite 1.8.0 — PRE-RELEASE

**Último release estable:** Smart Home Suite **1.7.1**.

Smart Home Suite 1.8.0 propone **Smart Support 1.2.0** para validación en Home Assistant OS antes de promoverlo a estable.

### Smart Support 1.2.0

Conserva el backend y el contrato de sesión validados en Smart Support 1.1.2 y amplía únicamente la experiencia visual/configurable del panel:

- nuevo bloque compacto **Orden de acciones** con icono, nombre, tipo, visibilidad y controles ↑ / ↓;
- el orden sigue usando el mismo array `actions.buttons` del `.storage` existente;
- personalización global de título/subtítulo de la sección de acciones;
- alineación global del encabezado y de los botones;
- colores globales heredables para fondo, borde, texto y texto secundario;
- tamaños globales de icono, texto principal y texto secundario;
- personalización individual por botón de distribución, alineación, tamaños, colores, fondo y borde;
- Color Picker Guard para que el selector nativo de color no se cierre por un rerender durante la selección;
- Guardar/Cancelar, Importar/Exportar/Restablecer, selectores, navegación y responsive permanecen intactos.

### Compatibilidad

No cambia:

- `.storage/smart_support_panel.config`;
- `.storage/smart_support_panel.session`;
- servicios y WebSocket `smart_support_panel.*`;
- lógica de Spook `homeassistant.enable_user` / `homeassistant.disable_user`;
- temporizador, inicio, extensión y cierre del soporte;
- navegación, selectores, responsive, permisos y aislamiento de módulos.

No requiere migración de storage. Los campos visuales nuevos son opcionales y un rollback a Smart Support 1.1.2 los ignora.

Versiones propuestas:

- Smart Home Suite / Manager: **1.8.0 PRE-RELEASE**
- Smart Home: **1.4.0**
- Smart Lighting: **1.3.0**
- Smart Energy Advanced: **1.4.0**
- Smart Automations: **1.1.1**
- Smart Support: **1.2.0**

## Distribución

La Suite se distribuye mediante Smart Home Suite Manager e imágenes multi-arquitectura en GHCR.

## Validación recomendada

1. Publica 1.8.0 como **pre-release**.
2. Confirma `Actions → Builder` completamente verde.
3. Actualiza primero una instancia laboratorio.
4. Ejecuta `validate_only` y luego `install_repair` con backup.
5. Prueba Support en escritorio, móvil y una segunda instancia antes de promover el mismo payload a estable.
