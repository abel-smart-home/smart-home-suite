# Smart Home Suite Manager 1.3.0

Instala, actualiza, valida, repara y restaura Smart Home Suite en Home Assistant OS sin HACS.

Acciones disponibles:

- `install_repair`
- `validate_only`
- `restore_latest`

Smart Home Suite 1.3.0 mantiene los cinco módulos oficiales y actualiza **Smart Energy Advanced a 1.4.0** mediante una extensión runtime que permite reordenar secciones y widgets sin cambiar su `.storage`, WebSocket ni frontend base V1.3.1.

Esta publicación debe mantenerse como **pre-release** hasta completar el checklist real en HAOS. Una vez validada, puede promoverse el mismo release 1.3.0 a estable sin cambiar el payload.
