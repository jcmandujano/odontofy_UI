# Guía de interfaz de Odontofy

## Propósito y alcance

Odontofy permite al médico gestionar su consulta con claridad, pocas acciones y captura mínima. Cada pantalla debe hacer evidente su tarea principal y permitir completarla aprovechando el contexto disponible.

Esta guía orienta nuevas interfaces y refactors. Documenta la dirección elegida por el usuario, no certifica que todas las pantallas actuales la cumplan ni autoriza rediseñarlas de una sola vez. Las [reglas de producto](product-rules.md) definen el comportamiento funcional; esta guía define cómo presentarlo.

## Referencias del proyecto

Consultar el componente y su diálogo antes de diseñar una interacción equivalente. Las rutas siguientes parten de `src/app`.

| Necesidad | Referencia | Qué conservar |
| --- | --- | --- |
| Captura extensa agrupada | `features/patients/patient-file` | Campos por tema y antecedentes desplegables; guardar sin un asistente obligatorio. |
| Administrar un catálogo | `features/settings/components/user-concepts`, `shared/dialogs/user-concepts-mgmt` | Lista sencilla y diálogo breve de descripción y costo. |
| Gestionar documentos | `features/patients/informed-consents`, `shared/dialogs/signed-consent-mgmt-dialog` | Acciones explícitas para agregar, imprimir y consultar. |
| Consultar y escribir notas | `features/patients/evolution-notes`, `shared/dialogs/evolution-note-mgmt-dialog` | Listado para consultar, editor para capturar y resumen de texto largo. |
| Registrar servicios e importes | `shared/dialogs/payment-mgmt-dialog` | Selección del catálogo, cálculos automáticos y descuento visible al activarlo. |
| Consultar pagos | `features/patients/patient-payments` | Historial con fechas, importes y acciones por registro. |
| Ausencia de registros | `shared/components/no-data-found` | Componente compartido y orientación breve para continuar. |

Reutilizar el patrón apropiado, no todos los controles del módulo. Las incorporaciones posteriores de planes, cargos o abonos no convierten su complejidad en estándar para otras tareas.

## Base visual

- Revisar `src/vars.scss`, `src/styles.scss` y los estilos del módulo de referencia antes de introducir valores nuevos.
- Conservar Roboto y Roboto Condensed en sus roles existentes. Los títulos de sección de los módulos de referencia usan Roboto Condensed, 26 px y altura de línea de 30 px; los controles y textos siguen las variantes del componente equivalente.
- Reutilizar las variables de color existentes: azul principal `#407DDA`, azul secundario `#6CA6FE`, azul claro `#C0D9FF`, gris de texto `#7A7A7A` y advertencia `#EB5757`. No asumir que todas sus combinaciones tienen contraste suficiente; verificar cada uso y ajustar lo necesario dentro del alcance.
- Usar superficies claras, campos Material delineados y tablas sencillas sin elevación. Bordes, agrupaciones e iconos deben comunicar estructura o acción.
- Reutilizar `.app-primary-action` para acciones principales de creación donde corresponda; actualmente define altura mínima de 44 px y la apariencia compartida. No replicar sus reglas en cada componente ni aumentar especificidad para competir con ellas.
- Tomar espaciado y densidad del módulo equivalente y mantenerlos consistentes dentro del flujo. No establecer otra escala, paleta o tipografía para una feature aislada.
- Evitar tarjetas anidadas, gradientes decorativos, sombras, indicadores y animaciones que no ayuden a la tarea. El odontograma puede conservar su representación dental sin imponerla a los demás módulos.

## Estructura y acciones

- Encabezado con título directo a la izquierda y acción principal identificable a la derecha en escritorio. En móvil permitir que se apilen sin perder orden ni legibilidad.
- Una tarea principal por pantalla o diálogo; puede haber acciones secundarias justificadas, como imprimir un consentimiento.
- Colocar filtros cerca del listado y acciones del registro en su fila o detalle. No añadir filtros por cada campo disponible en la API.
- Reservar pestañas para tareas que realmente necesiten separarse. No representar cada entidad interna como una pestaña obligatoria.
- Mantener el contexto del paciente, odontograma, pieza o plan al abrir y cerrar capturas. Volver debe ser predecible y conservar filtros o selección cuando corresponda.
- Evitar navegar por varios módulos para completar una tarea que puede resolverse desde el contexto actual.

## Listados y textos largos

- Usar tablas Material cuando se comparan registros con los mismos atributos; conservar el lenguaje de `info-table`, encabezados claros, acciones por fila y paginación existente cuando aplique.
- Mostrar columnas necesarias para identificar, comparar y actuar. No exponer todas las propiedades del modelo ni añadir tarjetas de métricas sin una necesidad concreta.
- Separar atributos que se consultan por separado, como hallazgo, superficie y notas. El odontograma conserva dientes arriba y hallazgos debajo; esta guía no añade columnas ni relaciones nuevas.
- Recortar las notas largas de los listados con puntos suspensivos, usando un contenedor acotado. Ofrecer acceso al contenido completo mediante la consulta o edición existente; un tooltip al pasar el cursor no debe ser la única vía.
- Evitar renglones ilimitados y desbordes. No truncar sin alternativa nombres esenciales, importes o acciones necesarias para identificar el registro.
- Mantener formatos consistentes de fecha y moneda. Diferenciar totales e importes por significado, sin duplicarlos como elementos decorativos.

## Formularios y diálogos

- Reutilizar Angular Material y componentes compartidos. Usar etiquetas visibles, valores iniciales útiles y validación junto al campo.
- No pedir información ya conocida. Los importes calculados se muestran como lectura; el servicio se elige desde el catálogo cuando lo requieren las reglas de producto.
- Agrupar campos por tema. Mostrar opciones adicionales al activarlas o cuando sean relevantes, como el descuento; no ocultar información necesaria para decidir una acción financiera.
- Usar un diálogo para una captura breve y acotada; una página o sección para trabajo extenso que requiera contexto. No convertir formularios breves en asistentes de varios pasos.
- Mantener título, contenido y acciones Material reconocibles. Guardar y cancelar deben estar accesibles; durante el guardado mostrar progreso y prevenir envíos repetidos.
- Conservar lo capturado cuando falle una operación recuperable. Explicar qué corregir o cómo reintentar.
- Ajustar el ancho al contenido con un máximo relativo al viewport y desplazamiento vertical interno cuando haga falta. No copiar `40vw` como ancho universal ni permitir diálogos anidados que oculten la tarea.
- Confirmar acciones cuando la consecuencia o pérdida de cambios lo justifique. Evitar confirmaciones rutinarias duplicadas; comunicar claramente las consecuencias financieras y conservar las revisiones requeridas por el flujo vigente.

## Lenguaje y estados

- Escribir en español, con frases breves y verbos concretos: «Agregar tratamiento», «Guardar», «Imprimir consentimiento». Mantener el nombre de la acción en su resultado.
- Diferenciar catálogo, tratamiento del paciente y plan cuando el contexto pueda generar confusión. No mostrar nombres de tablas, claves técnicas, «ítem» o detalles de compatibilidad para explicar la operación al médico.
- Usar `app-no-data-found` para ausencia de registros, con título y siguiente acción útil. Distinguir entre primer uso, búsqueda sin coincidencias y error de carga.
- No mostrar un estado vacío como si la carga hubiera terminado mientras la solicitud sigue en curso.
- Mostrar carga sin bloquear toda la pantalla cuando basta con bloquear la región o acción afectada; conservar el patrón existente cuando el bloqueo global sea necesario.
- Mostrar errores de campo cerca del control y fallos generales en el contexto de la operación. Comunicar restricciones de negocio con una causa comprensible y un siguiente paso posible.
- Evitar párrafos permanentes para explicar dónde hacer una tarea. Si hacen falta, revisar primero las etiquetas, ubicación y jerarquía de las acciones; mantener la ayuda necesaria sobre consecuencias reales.

## Adaptación móvil y accesibilidad

- Verificar el recorrido en escritorio y en una pantalla estrecha, por ejemplo 390 px, además de tamaños intermedios y texto ampliado. La página no debe desbordarse horizontalmente.
- Apilar columnas y acciones cuando no quepan. Si una tabla o representación dental necesita desplazamiento horizontal, limitarlo a su propia región, mantenerlo operable y conservar acceso a sus acciones.
- Conservar etiquetas y acceso al contenido completo al simplificar un listado móvil; no esconder controles esenciales para que quepa.
- Usar botones reales para acciones con iconos, con nombre accesible; los iconos decorativos no deben duplicar el texto para lectores de pantalla.
- Mantener foco visible, orden de tabulación lógico y funcionamiento por teclado. Los diálogos deben gestionar el foco y devolverlo al control de origen cuando sea posible.
- Dar suficiente área de interacción a los controles, especialmente en móvil; tomar los 44 px del botón compartido como referencia práctica sin confundir el tamaño visual del icono con su área pulsable.
- Verificar contraste y no depender solo del color para comunicar estados. Respetar preferencias de movimiento reducido y no exigir hover o arrastre como única forma de operar.
- No reproducir defectos existentes, como iconos con solo un evento de clic, eliminación del contorno de foco o anchos rígidos. Corregirlos dentro del componente intervenido sin ampliar el refactor a módulos ajenos.

## Uso de las skills

- Consultar `frontend-design` para jerarquía, composición, texto y contención visual; adaptar sus propuestas a la identidad existente.
- Consultar `ui-ux-pro-max` para interacción, accesibilidad, responsive y recomendaciones de Angular verificables. Para una inquietud puntual usar una consulta específica, evitando generar otro sistema visual completo.
- Resolver las rutas desde la ubicación instalada de cada skill, sin asumir rutas de otra herramienta o agregar sus scripts a la aplicación.
- Si Python u otra herramienta no está disponible, comunicar la limitación y usar las referencias estáticas pertinentes. No presentar esa revisión como una búsqueda ejecutada ni instalar dependencias ajenas al alcance.
- No guardar recomendaciones generadas sin contrastarlas con el producto. Las skills apoyan las decisiones locales y no justifican funciones, paquetes o cambios de identidad adicionales.

## Revisión antes de entregar

Para cada cambio de interfaz, comprobar lo siguiente dentro de su alcance:

- La tarea principal y su acción se entienden sin una explicación técnica.
- Se identificó y reutilizó un patrón de referencia; cualquier paso, campo o control nuevo resuelve una necesidad concreta.
- Se aprovecha el contexto disponible y se conserva la autonomía de módulos definida en las reglas de producto.
- Funcionan carga, vacío, error, guardado y prevención de envíos repetidos.
- Se puede completar el recorrido con teclado y en móvil, con textos largos y registros reales de ejemplo sintéticos.
- Las consecuencias clínicas y financieras están claras, sin operaciones automáticas nuevas ni pérdida de historial.
- Se revisó el resultado renderizado cuando fue posible y se ejecutaron las comprobaciones pertinentes del repositorio. Distinguir revisión de código, pruebas automatizadas y verificación visual; informar lo que no se pudo verificar.

Este documento por sí solo no requiere ejecutar la aplicación ni modificar componentes. El reanálisis posterior identificará fricciones concretas y dividirá su corrección en entregas pequeñas.
