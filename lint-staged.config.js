const prettierCommand = `prettier --config prettier.config.js --no-editorconfig --log-level warn --write`;

/**
 * @type {import('lint-staged').Configuration}
 */
export default {
  '*.{ts,tsx,md,json}': [
    `eslint --config eslint.config.js --fix`,
    prettierCommand,
  ],
  '*.{css,scss,js,jsx,mjs,cjs,mdx,yml,yaml,html,vue}': prettierCommand,
};
