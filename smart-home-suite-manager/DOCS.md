# Smart Home Suite Manager 0.1.0

## Acciones

### Instalar / reparar

Selecciona `install_repair`, inicia la App una vez y revisa el registro.

Un resultado correcto termina con:

`INSTALLATION_OK`

Después reinicia Home Assistant.

### Restaurar último respaldo

Selecciona `restore_latest`, inicia la App una vez y revisa el registro.

Un resultado correcto termina con:

`RESTORE_OK`

Después reinicia Home Assistant.

## Seguridad de reemplazo

Antes de activar el nuevo componente, el Manager prepara y valida una copia temporal. La sustitución se hace dentro de `custom_components`, conservando temporalmente la versión previa para poder volver atrás si falla el cambio de carpeta.

Cuando `create_backup` está activo, también se crea un archivo `.tar.gz` persistente dentro de los datos de la App.
