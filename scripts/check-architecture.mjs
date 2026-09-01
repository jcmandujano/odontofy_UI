import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const root = process.cwd();
const appRoot = path.join(root, 'src', 'app');
const errors = [];
const httpBoundaryFiles = new Set([
  'src/app/core/interceptors/interceptor.service.ts',
  'src/app/core/services/api.service.ts',
]);
const environmentAccessFiles = new Set([
  ...httpBoundaryFiles,
  'src/app/core/services/feature-flags.service.ts',
]);

const normalize = (value) => value.split(path.sep).join('/');
const relative = (value) => normalize(path.relative(root, value));
const sourceFiles = (directory) => fs.readdirSync(directory, { withFileTypes: true })
  .flatMap((entry) => {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(target);
    return entry.isFile() && entry.name.endsWith('.ts') ? [target] : [];
  });

const report = (file, node, message, sourceFile) => {
  const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
  errors.push(`${relative(file)}:${line + 1} ${message}`);
};

for (const file of sourceFiles(appRoot)) {
  const fileRelative = relative(file);
  const isSpec = fileRelative.endsWith('.spec.ts');
  const sourceFile = ts.createSourceFile(
    file,
    fs.readFileSync(file, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
  );

  const inspect = (node) => {
    if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
      const specifier = node.moduleSpecifier.text;
      const importedNames = node.importClause?.namedBindings && ts.isNamedImports(node.importClause.namedBindings)
        ? node.importClause.namedBindings.elements.map((element) => element.name.text)
        : [];

      if (
        specifier === '@angular/common/http'
        && importedNames.some((name) => name === 'HttpClient' || name === 'HttpBackend')
        && !httpBoundaryFiles.has(fileRelative)
        && !isSpec
      ) {
        report(file, node, 'HttpClient and HttpBackend are restricted to the HTTP boundary', sourceFile);
      }

      if (
        specifier.includes('environments/environment')
        && !environmentAccessFiles.has(fileRelative)
        && !isSpec
      ) {
        report(file, node, 'environment access is restricted to configuration boundaries', sourceFile);
      }

      if (
        specifier.endsWith('/api.service')
        && !fileRelative.startsWith('src/app/core/services/')
        && !fileRelative.startsWith('src/app/core/interceptors/')
        && !isSpec
      ) {
        report(file, node, 'features must depend on domain services, not ApiService', sourceFile);
      }

      if (
        (specifier.includes('api-v1.model') || specifier.includes('api-v1.mapper'))
        && !fileRelative.startsWith('src/app/core/')
      ) {
        report(file, node, 'API v1 DTOs and mappers must remain inside core', sourceFile);
      }
    }

    ts.forEachChild(node, inspect);
  };

  inspect(sourceFile);
}

if (errors.length > 0) {
  console.error('Architecture violations:\n');
  errors.forEach((error) => console.error(`- ${error}`));
  process.exitCode = 1;
} else {
  console.log('Angular architecture boundaries are valid.');
}
