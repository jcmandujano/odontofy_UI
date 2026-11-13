# Etapa 2: expediente, notas y odontograma

## Cambios

- El menú del expediente y su resumen dejan de ofrecer tratamientos del paciente y planes. El resumen ya no consulta planes.
- Las rutas anteriores de listado de tratamientos y detalle de plan llevan al resumen del paciente; el detalle usa `patientId`, no el ID del plan. Si no hay paciente válido, llevan a Pacientes.
- Notas muestra fecha, resumen y acciones, con búsqueda y paginación. El editor conserva fecha y contenido, sin selectores clínicos ni acciones de completar tratamientos.
- La fecha seleccionada se envía como `occurredAt`, compatible con Date y con el adaptador Moment existente. Al editar se omiten las referencias de plan y procedimiento del PATCH, para conservar las anteriores en servidor.
- Odontograma conserva adultos, niños, selección de piezas, hallazgos, notas y ciclo de guardado/archivo existente. Se retiran la creación/asociación de tratamientos y la generación de planes de su componente y plantilla.
- Los hallazgos previamente vinculados conservan sus referencias: se permite editar sus notas y se protegen pieza, condición, superficie y eliminación con un mensaje contextual. Los hallazgos nuevos no tienen esa restricción. No se requiere limpiar la base para consultar estos registros.

No requiere cambios de API ni migraciones. Se mantienen contratos anteriores para compatibilidad. Pagos conserva su operación actual hasta la etapa 3; esta entrega no cambia cargos, anticipos ni saldos.

## Validación

- Arquitectura y tipos de UI, 62 pruebas ChromeHeadless y build de producción aprobados. Se sustituyeron pruebas de funciones de asociación retiradas de la interfaz, conservando pruebas de captura y protección de hallazgos anteriores.
- 83 llamadas de Angular compatibles con OpenAPI.
- Chrome con respuestas HTTP sintéticas: listado y edición de notas, odontograma y enlace antiguo de plan a 1440 y 390 px, sin desborde horizontal ni excepciones. Dos ediciones enviaron contenido y fecha sin borrar referencias. Esta revisión no representa una prueba de persistencia con la API o base real.
- Capturas locales de revisión fuera del repositorio; no se utilizaron datos reales ni se ejecutó SQL.

## Prueba manual

1. Abrir un paciente: comprobar que permanecen ficha, notas, consentimientos, pagos y odontograma; no hay entrada de tratamientos ni tarjeta de plan activo.
2. Crear una nota general, elegir fecha, guardarla, buscarla y editarla. Comprobar fecha y contenido al recargar.
3. Editar una nota histórica asociada: guardar y verificar que conserva sus IDs de relación; no se completan tratamientos.
4. Crear odontogramas adulto y pediátrico, agregar hallazgos y guardar. Consultarlos, editar notas y filtrar por pieza. No deben aparecer acciones de tratamientos o planes, tampoco en vacío.
5. Consultar un hallazgo vinculado anterior: sus datos estructurales están protegidos y sus notas se pueden actualizar.
6. Abrir `/patient-treatment-plans;id=7` y `/treatment-plan-detail;id=99;patientId=7` con IDs sintéticos propios: ambos deben abrir el resumen del paciente 7. Sin paciente válido, volver a Pacientes.
7. Repetir listado, editor y odontograma en móvil y con teclado. Las notas largas se recortan y pueden leerse al editar.
