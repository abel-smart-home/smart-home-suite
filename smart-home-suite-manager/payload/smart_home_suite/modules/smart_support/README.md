# Smart Support module 1.2.0

Smart Support 1.2.0 parte del frontend validado V1.1.2 y conserva el backend/session manager existente.

- Ruta: `/support`
- Frontend efectivo: V1.2.0
- Backend de soporte remoto: contrato V1.1.2 conservado
- Stores conservados:
  - `.storage/smart_support_panel.config`
  - `.storage/smart_support_panel.session`
- Servicios y WebSocket conservan el namespace `smart_support_panel`

## Cambios V1.2.0

- orden compacto de `actions.buttons` con ↑ / ↓;
- personalización global de la sección de acciones;
- personalización individual de texto, colores, distribución, alineación y tamaños;
- colores con herencia desde Diseño general;
- Color Picker Guard para evitar rerenders durante la interacción con el selector nativo de color.

Los campos nuevos son opcionales dentro del mismo storage. No requiere migración y es compatible con rollback a 1.1.2.

## Dependencia conservada

La lógica activa/desactiva la cuenta remota mediante los servicios `homeassistant.enable_user` y `homeassistant.disable_user` registrados por Spook. V1.2.0 no cambia esa lógica.
