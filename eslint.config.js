import { globalIgnores } from 'eslint/config';
import eslintConfig from '@arcgis/eslint-config';

export default [
  globalIgnores([
    'node_modules/',
    'src/build/',
    'src/coverage/',
    'src/dist/',
    'src/temp/',
    'backend/.next/',
  ]),
  ...eslintConfig,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  { files: ['**/*.md'], rules: { 'markdown/require-alt-text': 'off' } },
];
