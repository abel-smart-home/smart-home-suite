# Smart Automations 1.0.0

Módulo oficial de Smart Home Suite para crear y administrar automatizaciones sencillas mediante una interfaz orientada al usuario común. Home Assistant continúa siendo el motor de ejecución: las automatizaciones generadas son automatizaciones nativas.

## Recetas iniciales

- encender/apagar una o varias luces al amanecer o anochecer;
- apagar luces cuando las personas/dispositivos seleccionados están fuera de casa;
- notificación por potencia elevada configurable en W;
- notificación al alcanzar/cruzar un límite configurable de kWh.

Entidades de energía recomendadas/validadas durante el piloto:

- `sensor.power_record_ciclo_kwh_mes_facturado`
- `sensor.power_record_ciclo_kwh_diario_facturado`

## Panel Standard

- editor lateral en escritorio y adaptable a móvil;
- Guardar/Cancelar con copia de trabajo;
- vista previa visual en tiempo real sin autosave;
- Importar/Exportar/Restablecer;
- selector de entidades e iconos MDI;
- navegación configurable;
- ancho, columnas, gaps, tamaños, radios, colores y tipografía configurables;
- persistencia propia en `smart_automations.config`;
- aislamiento como módulo de Smart Home Suite;
- versión y estado disponibles en diagnósticos de la Suite.

La clave de almacenamiento se mantiene desde el piloto 0.1.x para permitir actualización sin perder la configuración existente.
