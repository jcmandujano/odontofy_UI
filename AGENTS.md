# Guía para trabajar en Odontofy UI

## Producto y alcance

Odontofy ayuda al médico a gestionar su consulta de forma práctica y amigable. La interfaz debe permitir completar tareas con claridad y pocas acciones. Estamos construyendo un MVP: resolver la necesidad actual sin anticipar funciones futuras.

- Implementar el alcance solicitado. Proponer mejoras adicionales por separado.
- Aprovechar el contexto conocido: no pedir de nuevo paciente, pieza o tratamiento si ya están seleccionados.
- Mostrar primero lo necesario para la tarea; revelar opciones adicionales cuando apliquen.
- Antes de agregar campos obligatorios, pasos, filtros, pestañas, estados o confirmaciones, identificar la necesidad concreta que resuelven. Preferir el flujo más sencillo que conserve las reglas de negocio.
- No simplificar eliminando validaciones necesarias ni ocultando consecuencias financieras.

## Referencias de experiencia

Antes de modificar una interfaz, revisar el módulo equivalente y sus diálogos en `src/app`:

| Tarea | Referencia |
| --- | --- |
| Captura agrupada y secciones desplegables | `features/patients/patient-file` |
| Catálogos: lista sencilla y formulario breve | `features/settings/components/user-concepts` y `shared/dialogs/user-concepts-mgmt` |
| Listado de documentos y acciones directas | `features/patients/informed-consents` |
| Consulta de registros y captura de contenido | `features/patients/evolution-notes` y `shared/dialogs/evolution-note-mgmt-dialog` |
| Captura desde catálogo, cálculos y opciones condicionales | `shared/dialogs/payment-mgmt-dialog` |
| Historial de pagos | `features/patients/patient-payments` |

Estas referencias definen la dirección del producto, no obligan a copiar defectos de accesibilidad, anchos rígidos ni toda la complejidad de funciones añadidas posteriormente.

## Skills y consistencia visual

- Para diseñar, revisar o modificar interfaces, consultar `frontend-design` y `ui-ux-pro-max` cuando estén disponibles. Si falta una herramienta de la skill, comunicar la limitación y continuar con los criterios verificables y las referencias locales.
- Adaptar sus recomendaciones a Odontofy. No introducir otra identidad visual, tipografía, paleta, biblioteca de componentes o animaciones por una recomendación genérica.
- Reutilizar Angular Material, componentes compartidos, iconos y estilos existentes antes de crear alternativas. Revisar `src/vars.scss`, `src/styles.scss` y el componente de referencia.
- Conservar la base de azules, Roboto y Roboto Condensed, campos delineados y tablas sencillas sin elevación.
- Usar `shared/components/no-data-found` para estados vacíos, con texto breve que indique cómo continuar.
- Mantener acciones principales fáciles de localizar, etiquetas en español y verbos concretos. Recortar textos largos en listados cuando corresponda, permitiendo consultar el contenido completo.
- Evitar tarjetas, resúmenes, explicaciones repetidas y controles que no ayuden a completar la tarea.
- En cambios de flujo, describir brevemente la tarea, el recorrido propuesto y los componentes que se reutilizarán antes de implementar; continuar sin pedir aprobación rutinaria.

## Reglas funcionales que la UI debe respetar

- El catálogo de tratamientos es la fuente de los nuevos tratamientos y servicios cobrados; no habilitar captura libre equivalente.
- Un paciente puede tener varios odontogramas. Citas, notas y tratamientos pueden existir sin odontograma.
- Los tratamientos pueden ser independientes o pertenecer a un plan; un hallazgo puede quedar únicamente como referencia clínica.
- Crear o aceptar un plan, asociar tratamientos o completar su estado clínico no genera un cargo. Mantener claras las acciones financieras explícitas.
- No trasladar detalles técnicos al médico, como claves de idempotencia, nombres de tablas o compatibilidad interna.

## Implementación y validación

- Seguir la estructura Angular existente y mantener las reglas de negocio críticas en la API.
- Verificar adaptación a escritorio y móvil, textos sin desborde, foco visible, uso por teclado y nombres accesibles para acciones con iconos.
- Incluir estados de carga, error y vacío sin introducir pasos innecesarios.
- Para cambios de código, ejecutar las comprobaciones pertinentes del `package.json`; usar `npm run check` para la validación integral y comprobar el flujo visual cuando sea posible. Informar qué se verificó y cualquier limitación real.
- Para cambios exclusivamente documentales, revisar contenido, referencias y `git diff --check`; no ejecutar la suite completa sin necesidad.

## Flujo de colaboración

- Respetar los cambios locales del usuario y cualquier instrucción específica de la tarea.
- Al iniciar una entrega, revisar el estado del repositorio y crear una rama desde `origin/main` actualizado. No trabajar directamente en main.
- Al finalizar, revisar el diff, hacer commit y crear o actualizar el PR para que el usuario lo revise. El usuario realiza el merge.
- Si el usuario pide revisar en local o no hacer commit/PR, respetar esa excepción.
- No modificar datos reales para pruebas; usar datos sintéticos en un entorno aislado.
