# Smart Home Suite Manager 1.7.1 · STABLE

## Instalar / actualizar / reparar

1. Selecciona `validate_only` si deseas comprobar primero la instalación.
2. Confirma `VALIDATION_OK`.
3. Selecciona `install_repair`.
4. Mantén `create_backup: true`.
5. Inicia la App.
6. Confirma:
   - `PAYLOAD_VALIDATION_OK`
   - `STAGED_VALIDATION_OK`
   - `POST_INSTALL_VALIDATION_OK`
   - `INSTALLATION_OK`
7. Reinicia Home Assistant.
8. Si el navegador/app conserva recursos antiguos, realiza una recarga dura.

## Smart Automations 1.1.1

### Orden

En **Personalización → Orden**:

- las categorías pueden moverse con ↑ / ↓;
- las automatizaciones pueden moverse dentro de su propia categoría;
- las categorías pueden personalizar texto, icono y colores.

### Tarjetas

En **Personalización → Tarjetas** se puede personalizar por automatización:

- título visible;
- texto secundario;
- icono MDI;
- color y tamaño del icono;
- color y tamaño de título/detalle;
- fondo y borde;
- colores Activa/Pausada/No encontrada;
- mostrar/ocultar detalle y estado.

### Selector de colores

El Color Picker Guard V1.0.0 evita un rerender completo mientras el selector nativo está abierto.

Flujo normal:

1. Haz clic en un campo de color.
2. Mueve la barra RGB/tono.
3. Mueve el punto dentro del campo grande las veces necesarias.
4. El selector permanece abierto.
5. Al terminar/hacer clic fuera se aplica el preview.
6. Guardar persiste.
7. Cancelar revierte.

## Compatibilidad

La personalización visual se almacena en `smart_automations.config` y no modifica triggers, conditions ni actions de las automatizaciones nativas.

## Restaurar

Selecciona `restore_latest`, ejecuta la App, confirma `RESTORE_OK` y reinicia Home Assistant.

## Importante

No instales simultáneamente versiones standalone de paneles ya incluidos en Smart Home Suite.
