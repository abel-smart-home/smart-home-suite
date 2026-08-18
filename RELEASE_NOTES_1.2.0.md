# Smart Home Suite 1.2.0 — Smart Home Configurable Cards

Versión estable promovida después de completar la validación de Smart Home Suite 1.2.0 en HAOS de laboratorio.

## Base verificada

- Último release estable de referencia: `v1.0.0`.
- Desarrollo tomado desde `main` después de Suite 1.1.1.
- `main` de referencia al iniciar este cambio: `022dba25f6456e0bcc4538fe53aab1a1f2283e5c`.
- Smart Home Panel V2.0.5 permanece sin modificar.
- Smart Home Native Dashboard Bridge V1.3.0 permanece sin modificar.
- Se conserva el runtime guard V1.0.0 que estabiliza el selector MDI.

## Versiones

- Smart Home Suite / Manager: **1.2.0**
- Smart Home module: **1.4.0**
- Smart Home Panel: **2.0.5**
- Native Dashboard Bridge: **1.3.0**
- Suite Runtime: **1.1.0**
- Narrow render guard: **1.0.0**
- Configurable Cards Runtime: **1.0.0**
- Smart Lighting: **1.0.3**
- Smart Energy Advanced: **1.3.1**
- Smart Automations: **1.0.0**
- Smart Support: **1.1.2**

## Smart Home — novedades

- Las cuatro tarjetas existentes pueden cambiar de posición dentro del bloque de tarjetas.
- Encabezado, navegación, avisos y resto de la estructura no se reordenan.
- Se pueden agregar tarjetas opcionales para otras entidades.
- Tipos iniciales de tarjetas adicionales:
  - valor;
  - barra de progreso;
  - gráfica de historial.
- Cada tarjeta adicional tiene ID estable.
- Selector de entidades integrado.
- Selector visual MDI nativo conservado.
- Configuración de título, icono, prefijo, unidad, decimales, multiplicador y offset.
- Configuración de tamaño, fondo, borde, radio, padding, alineación y colores.
- Acciones independientes tap/hold: `more-info`, `none`, `navigate`, `url`, `toggle`.
- Las gráficas usan `history/history_during_period` y caché para evitar consultas continuas al Recorder.

## Compatibilidad

Una configuración 1.1.1 sin `card_layout` ni `extra_cards` mantiene el orden histórico:

1. Costo mensual
2. Temporada
3. Rango de tarifa
4. Consumo actual / Tacómetro

No se modifica la estructura existente de `monthly_cost`, `season`, `tariff` ni `power`.
El backend existente continúa guardando el diccionario completo de configuración en `.storage`.

## Instalación / actualización

1. Crear backup de Home Assistant.
2. Actualizar Smart Home Suite Manager a 1.2.0.
3. Ejecutar `validate_only` si se desea comprobar primero el payload.
4. Ejecutar `install_repair` con `create_backup: true`.
5. Confirmar `INSTALLATION_OK`.
6. Reiniciar Home Assistant.
7. Verificar Smart Home y las tarjetas configurables después del reinicio.

## Rollback

Si aparece una regresión, ejecutar `restore_latest` desde Smart Home Suite Manager y reiniciar Home Assistant.

## Estado

**STABLE**

Smart Home Suite 1.2.0 conserva el mismo código funcional validado durante el pre-release. La promoción a estable no modifica runtimes, almacenamiento, entidades ni configuración persistida.
