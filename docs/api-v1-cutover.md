# Migracion Angular a API v1

## Alcance F11

La aplicacion consume exclusivamente `/api/v1`. `ApiService` recibe rutas relativas
y los servicios de dominio traducen el contrato camelCase a los modelos visuales
existentes. Esta capa evita acoplar componentes a envelopes, metadatos o DTOs HTTP.

Los flujos migrados incluyen identidad y refresh, perfil, pacientes e historial
medico, planes y notas, facturacion, agenda local/Google, plantillas, PDFs privados
y consentimientos firmados.

## Verificacion

```powershell
npm run check
```

El check ejecuta TypeScript, Karma en ChromeHeadless y el build de produccion.

## Snapshot pre-F11

- Rama remota: `snapshot/pre-api-v1-f11-ui-20260822`
- Tag anotado: `ui-pre-api-v1-f11-20260822`
- Commit: `18fefebe917ebc8b483bf3643ee3b02469c0a1f0`

Para inspeccionarlo sin mover ramas:

```powershell
git switch --detach ui-pre-api-v1-f11-20260822
```

Para volver al trabajo actual despues de inspeccionarlo:

```powershell
git switch refactor/api-v1-f11-angular-migration
```

Si F11 ya fue integrado, la recuperacion compartida se hace con PRs de revert:
primero se revierte el merge backend para restaurar v1 y legacy, despues el merge
UI. F11 no agrega migraciones de base de datos.
