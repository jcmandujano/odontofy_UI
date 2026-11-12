# Reglas de producto compartidas

La fuente de las reglas funcionales de tratamientos, odontogramas, planes, cargos y pagos se mantiene en el repositorio de la API:

- [Reglas de producto en odontofy_node](https://github.com/jcmandujano/odontofy_node/blob/main/docs/product-rules.md).
- En el workspace con ambos proyectos: [documento local de la API](../../odontofy_node/docs/product-rules.md).

Leer ese documento antes del reanálisis o de cambios funcionales en estos módulos. El enlace a main estará disponible cuando se integre el PR de documentación de la API; durante la revisión usar el archivo local o la rama `docs/project-agent-guardrails` de ese repositorio.

Mantener una única versión de las reglas. No copiar aquí su contenido ni convertir una limitación de la UI actual en un requisito de negocio. Si el análisis detecta diferencias entre el comportamiento implementado y las reglas, documentarlas y delimitar su corrección antes de implementar.
