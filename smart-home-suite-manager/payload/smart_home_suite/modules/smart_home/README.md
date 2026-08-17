# Smart Home module

Arquitectura conservada:

`/smart-home` → dashboard nativo Lovelace → strategy `custom:smart-home`
→ bridge V1.3.0 → `<smart-home-panel>` V2.0.5.

## Fuente exacta

El ZIP de bridge V1.3.0 no contiene `smart-home-panel.js` V2.0.5 por diseño.
Smart Home Suite Manager 0.3.0 captura automáticamente, antes de reemplazar la
Suite:

- `/config/www/smart-home-panel/smart-home-panel.js`
- `/config/custom_components/smart_home_panel/`

La captura solo acepta el frontend cuando contiene `PANEL_VERSION = "2.0.5"`.

Esto evita sustituir el panel validado por una reconstrucción o versión anterior.
