# Smart Support module

Migración exacta de **Smart Support Panel V1.1.2**.

- Ruta: `/support`
- Frontend V1.1.2 original byte por byte
- `manager.py`, `const.py`, `sensor.py` y `binary_sensor.py` provenientes del ZIP original
- Stores originales:
  - `.storage/smart_support_panel.config`
  - `.storage/smart_support_panel.session`
- Servicios y WebSocket conservan el namespace `smart_support_panel`

## Dependencia conservada

La lógica V1.1.2 activa/desactiva la cuenta remota mediante los servicios
`homeassistant.enable_user` y `homeassistant.disable_user` registrados por Spook.
La Suite 0.3.0 TEST **no cambia esa lógica**.
