# Smart Home Suite Manager 1.4.0

Instala, actualiza, valida, repara y restaura Smart Home Suite en Home Assistant OS sin HACS.

Acciones disponibles:

- `install_repair`
- `validate_only`
- `restore_latest`

Smart Home Suite 1.4.0 mantiene los cinco módulos oficiales, conserva Smart Energy Advanced 1.4.0 y actualiza **Smart Lighting a 1.1.0** mediante una extensión runtime que permite reordenar áreas y dispositivos sin cambiar su `.storage`, WebSocket ni frontend base V1.0.3.

**Smart Home Suite 1.4.0 se publica inicialmente como PRE-RELEASE** para validación en Home Assistant OS real. Después de completar `TEST-CHECKLIST-1.4.0.md` sin regresiones puede promoverse el mismo tag a estable.
