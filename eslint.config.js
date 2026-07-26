import { globalIgnores } from 'eslint/config';
import eslintConfig from '@arcgis/eslint-config';

export default [
  globalIgnores(['node_modules/', 'src/dist/', 'backend/.next/']),
  ...eslintConfig,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // TODO: address all of these
      '@typescript-eslint/naming-convention': 'warn',
      '@typescript-eslint/no-unnecessary-condition': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-call': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
    },
  },
  { files: ['**/*.md'], rules: { 'markdown/require-alt-text': 'off' } },
];
