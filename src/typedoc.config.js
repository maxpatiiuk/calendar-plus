/** @type {import('typedoc').TypeDocOptions} */
module.exports = {
  entryPoints: [
    './src/components/Core/development.tsx',
    './src/components/Core/index.tsx',
  ],
  // entryPointStrategy: 'expand',
  out: 'docs',
  readme: '../README.md',
  cleanOutputDir: true,
  includeVersion: true,
  excludePrivate: false,
  excludeProtected: false,
  excludeNotDocumented: false,
  excludeInternal: false,
};
