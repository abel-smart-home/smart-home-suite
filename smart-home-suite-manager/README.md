# Smart Home Suite Manager 1.7.1

Instala, actualiza, valida, repara y restaura Smart Home Suite en Home Assistant OS sin HACS.

Smart Home Suite 1.7.1 actualiza **Smart Automations a 1.1.1** y añade un guard específico para los selectores nativos de color.

- Smart Automations Panel V1.0.0: intacto.
- Layout runtime V1.0.0: intacto.
- Color Picker Guard V1.0.0: nuevo.
- `.storage`: sin cambios.
- Automatizaciones nativas: sin cambios.

El guard evita el rerender completo durante eventos `input` de `<input type="color">`; el preview normal ocurre en `change`.

**Estado: PRE-RELEASE.**
Último release estable: **1.6.0**.
