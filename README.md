# Abel Smart Home Suite

Repositorio de distribución de **Smart Home Suite** para Home Assistant OS sin HACS.

## Versión de prueba actual

- Smart Home Suite / Manager: **0.4.0 TEST**
- Smart Home: Bridge **1.3.0** + base exacta **V2.0.5** capturada de la instalación validada
- Smart Lighting: **1.0.3**
- Smart Energy Advanced: **1.3.0**
- Smart Support: **1.1.2**

Todos los módulos se instalan bajo `custom_components/smart_home_suite`.
Los frontends de Lighting, Energy Advanced, Support y Smart Home Bridge se
conservan byte por byte respecto a sus paquetes fuente.

La 0.4.0 es un candidato de laboratorio. No publicar release hasta completar
`TEST-CHECKLIST-0.4.0.md`.

## Smart Home Suite 0.4.0

Esta fase mejora el núcleo de la Suite sin modificar los paneles productivos:
branding local, diagnósticos, entidades de salud/versión y catálogo central de
módulos preparado para futuras ampliaciones.
