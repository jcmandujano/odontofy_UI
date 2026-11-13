# Etapa 3: pagos desde catálogo

La especificación funcional, migración, restricciones y guía de prueba se mantienen en [el documento de API](https://github.com/jcmandujano/odontofy_node/blob/main/docs/mvp-catalog-payments-stage-3.md), disponible también [en el workspace local](../../odontofy_node/docs/mvp-catalog-payments-stage-3.md).

Durante la revisión usar la rama `feat/mvp-catalog-payments-stage-3` de API. Aplicar su migración y desplegar API antes de la UI.

El recorrido nuevo es Agregar pago desde catálogo y Registrar abono sobre el adeudo existente. Movimientos anteriores conserva los cargos y anticipos previos del paciente, cargados bajo demanda. No se requieren tratamientos clínicos ni planes.
