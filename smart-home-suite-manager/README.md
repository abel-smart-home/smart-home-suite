# Smart Home Suite Manager 1.5.0

Instala, actualiza, valida, repara y restaura Smart Home Suite en Home Assistant OS sin HACS.

Acciones disponibles:

- `install_repair`
- `validate_only`
- `restore_latest`

Smart Home Suite 1.5.0 mantiene los cinco módulos oficiales y actualiza **Smart Lighting a 1.2.0** mediante `smart-lighting-layout.js` V1.1.0. Se conserva el reordenamiento ya probado y se añaden dos acciones globales opcionales para encender o apagar todas las entidades de iluminación válidas configuradas en el panel.

No cambia `.storage`, WebSocket ni Smart Lighting Panel V1.0.3.

**Smart Home Suite 1.5.0 se publica inicialmente como PRE-RELEASE**. Después de completar `TEST-CHECKLIST-1.5.0.md` sin regresiones puede promoverse el mismo tag a estable.
