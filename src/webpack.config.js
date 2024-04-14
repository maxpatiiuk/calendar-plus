/**
 * WebPack config for development and production
 */

import path from 'path';
import webpack from 'webpack';
import {
  developmentAuthUrl,
  productionAuthUrl,
  googleClientId,
} from '../auth-backend/config.js';
import { fileURLToPath } from 'url';

const outputPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  'dist',
);

function ensureDefined(value, error) {
  if (value === undefined) throw new Error(error);
  return value;
}

export default (_env, argv) =>
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
                        version: '3.25.2',
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
      extensions: ['.ts', '.tsx', '.js'],
      symlinks: false,
    },
    // Set appropriate process.env.NODE_ENV
    mode: argv.mode,
    /*
     * User recommended source map type in production
     * Can't use the recommended "eval-source-map" in development due to
     * https://stackoverflow.com/questions/48047150/chrome-extension-compiled-by-webpack-throws-unsafe-eval-error
     */
    devtool:
      argv.mode === 'development' ? 'cheap-module-source-map' : 'source-map',
    entry: {
      main:
        argv.mode === 'development'
          ? './src/components/Core/development.tsx'
          : './src/components/Core/index.tsx',
      background: './src/components/Background/index.ts',
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env.AUTH_URL': JSON.stringify(
          ensureDefined(
            argv.mode === 'development'
              ? developmentAuthUrl
              : productionAuthUrl,
            'AUTH_URL is not defined',
          ),
        ),
        'process.env.GOOGLE_CLIENT_ID': JSON.stringify(
          ensureDefined(googleClientId, 'GOOGLE_CLIENT_ID is not defined'),
        ),
      }),
      argv.mode === 'development'
        ? new webpack.optimize.LimitChunkCountPlugin({
            maxChunks: 1,
          })
        : undefined,
    ],
    output: {
      path: outputPath,
      clean: true,
      publicPath: '/public/',
      filename: '[name].bundle.js',
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
    optimization: {
      minimize: false,
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
