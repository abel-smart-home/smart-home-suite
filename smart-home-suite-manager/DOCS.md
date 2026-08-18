# Smart Home Suite Manager 1.8.0 · PRE-RELEASE

Último release estable: **1.7.1**.

## Instalar / actualizar / reparar

1. En una instancia laboratorio, actualiza Smart Home Suite Manager a 1.8.0.
2. Selecciona `validate_only` y ejecuta la App.
3. Confirma `VALIDATION_OK`.
4. Selecciona `install_repair`.
5. Mantén `create_backup: true`.
6. Inicia la App.
7. Confirma:
   - `PAYLOAD_VALIDATION_OK`
   - `STAGED_VALIDATION_OK`
   - `POST_INSTALL_VALIDATION_OK`
   - `INSTALLATION_OK`
8. Reinicia Home Assistant.
9. Realiza recarga dura del navegador/app si conserva recursos antiguos.

## Smart Support 1.2.0

### Orden de acciones

En **Soporte → Personalización → Acciones** aparece primero **Orden de acciones**:

- cada fila muestra icono, nombre, tipo, visibilidad y condición de aparición;
- ↑ / ↓ cambia solo el orden de `actions.buttons`;
- la vista previa cambia inmediatamente;
- Guardar persiste;
- Cancelar revierte al último orden guardado.

### Presentación global

Se puede personalizar:

- título y subtítulo;
- alineación del encabezado;
- alineación de botones;
- colores de título/subtítulo;
- fondo, borde, texto y texto secundario de botones;
- grosor de borde;
- tamaños de icono y textos;
- columnas, altura, radio y separación.

Los colores globales pueden quedar en modo **heredado**, manteniendo los valores de Diseño general.

### Personalización por botón

Cada botón conserva su lógica actual y puede ajustar individualmente:

- texto y texto secundario;
- icono e icon color;
- distribución Automática / Vertical / Horizontal;
- alineación Global / Izquierda / Centro / Derecha;
- tamaño de icono, texto y texto secundario;
- fondo, borde, color de texto y color secundario;
- grosor de borde;
- visibilidad, condición, ancho completo, tap/hold y confirmación.

### Selector de colores

El Color Picker Guard actualiza la copia de trabajo durante `input` sin reconstruir el drawer. El preview completo ocurre en `change`, de modo que el selector no parpadea ni se cierra antes de terminar.

## Compatibilidad

No cambia el backend de Smart Support 1.1.2 ni:

- `smart_support_panel.config`;
- `smart_support_panel.session`;
- servicios/WebSocket;
- temporizador de soporte;
- Spook;
- entidades de estado;
- navegación;
- selectores;
- responsive.

No requiere migración.

## Restaurar

Si la prueba falla, selecciona `restore_latest`, ejecuta la App, confirma `RESTORE_OK` y reinicia Home Assistant. También puedes reinstalar el release estable 1.7.1.

## Importante

No instales simultáneamente versiones standalone de paneles ya incluidos en Smart Home Suite.
