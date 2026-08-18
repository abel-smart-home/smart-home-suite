# Smart Home Suite Manager 1.7.1 · PRE-RELEASE

## Instalación

1. Ejecuta `validate_only`.
2. Confirma `VALIDATION_OK`.
3. Ejecuta `install_repair`.
4. Mantén `create_backup: true`.
5. Confirma:
   - `PAYLOAD_VALIDATION_OK`
   - `STAGED_VALIDATION_OK`
   - `POST_INSTALL_VALIDATION_OK`
   - `INSTALLATION_OK`
6. Reinicia Home Assistant.
7. Haz una recarga dura del navegador/app.

## Smart Automations 1.1.1

Conserva todas las funciones de Smart Automations 1.1.0.

### Color Picker Guard

Los selectores de color ya no provocan un rerender completo mientras su ventana nativa está abierta.

Flujo esperado:

1. Haz clic en un campo de color.
2. Mueve la barra RGB/tono.
3. Mueve el punto dentro del campo grande de color tantas veces como quieras.
4. La ventana permanece abierta.
5. Al hacer clic fuera/terminar la selección, se aplica el preview normal.
6. Guardar persiste.
7. Cancelar revierte.

El guard se aplica a cualquier `settings.*` de tipo `color`, incluyendo:

- encabezado;
- apariencia global;
- navegación;
- categorías;
- tarjetas individuales;
- estados Activa/Pausada/No encontrada.

## Restaurar

Usa `restore_latest`, confirma `RESTORE_OK` y reinicia Home Assistant.
