/**
 * WebPack config for development and production
 */

const path = require('path');

const outputPath = path.resolve(__dirname, 'dist');

module.exports = (_env, argv) =>
  /** @type { import('webpack').Configuration } */ ({
    module: {
      rules: [
        {
          test: /\.(png|gif|jpg|jpeg|svg)$/,
          type: 'asset',
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader', 'postcss-loader'],
        },
        {
          test: /\.[tj]sx?$/,
          exclude: /(node_modules)/,
          use: [
            {
              loader: 'babel-loader?+cacheDirectory',
              options: {
                presets: [
                  [
                    '@babel/preset-env',
                    {
                      useBuiltIns: 'usage',
                      corejs: {
                        version: '3.23.4',
                        proposals: true,
                      },
                      bugfixes: true,
                      // See "browserslist" section of package.json
                      browserslistEnv: argv.mode,
                    },
                  ],
                  ['@babel/preset-react'],
                  ['@babel/preset-typescript'],
                ],
              },
            },
          ],
        },
      ],
    },
    resolve: {
      extensions: ['.ts', '.tsx'],
      symlinks: false,
    },
    // Set appropriate process.env.NODE_ENV
    mode: argv.mode,
    // User recommended source map types appropriate for each mode
    devtool: argv.mode === 'development' ? 'eval-source-map' : 'source-map',
    entry: {
      main: './src/index.tsx',
    },
    output: {
      path: outputPath,
      clean: true,
      publicPath: '/public/',
      filename: '[name].[contenthash].bundle.js',
      environment: {
        arrowFunction: true,
        const: true,
        destructuring: true,
        bigIntLiteral: true,
        forOf: true,
        dynamicImport: true,
        module: true,
      },
    },
    watchOptions: {
      ignored: '/node_modules/',
    },
    performance: {
      // Disable bundle size warnings for bundles <2 MB
      maxEntrypointSize: 2 * 1024 * 1024,
      maxAssetSize: 2 * 1024 * 1024,
    },
    stats: {
      env: true,
      outputPath: true,
      warnings: true,
      errors: true,
      errorDetails: true,
      errorStack: true,
      moduleTrace: true,
      timings: true,
    },
  });
