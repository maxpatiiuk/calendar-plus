/// <reference types="vitest/config" />

import tailwindcss from '@tailwindcss/vite';
import { defineConfig, loadEnv, type BuildEnvironmentOptions } from 'vite';

const environmentDirectory = '../backend';

function createBuild(
  name: 'background' | 'main',
  entry: string,
  emptyOutDir: boolean,
): BuildEnvironmentOptions {
  return {
    target: 'es2024',
    outDir: 'dist',
    emptyOutDir,
    sourcemap: true,
    minify: false,
    lib: {
      entry,
      name: name === 'main' ? 'CalendarPlus' : 'CalendarPlusBackground',
      formats: ['iife'],
      cssFileName: name,
    },
    rolldownOptions: {
      output: {
        entryFileNames: `${name}.js`,
      },
    },
  };
}

export default defineConfig(({ command, mode }) => {
  const environment: Partial<Record<string, string>> = loadEnv(
    mode,
    new URL(environmentDirectory, import.meta.url).pathname,
    '',
  );
  const requiredEnvironmentVariable = (name: string): string => {
    const value = environment[name];
    if (value === undefined) {
      throw new Error(`${mode} ${name} is not defined`);
    }
    return value;
  };

  const extensionEnvironment =
    command === 'build'
      ? {
          'process.env.AUTH_URL': JSON.stringify(
            requiredEnvironmentVariable('AUTH_URL'),
          ),
          'process.env.GOOGLE_CLIENT_ID': JSON.stringify(
            requiredEnvironmentVariable('GOOGLE_CLIENT_ID'),
          ),
        }
      : {};

  return {
    root: import.meta.dirname,
    envDir: environmentDirectory,
    publicDir: false,
    plugins: [tailwindcss()],
    define: {
      ...extensionEnvironment,
      'process.env.NODE_ENV': JSON.stringify(mode),
    },
    builder: {
      async buildApp(builder): Promise<void> {
        await builder.build(builder.environments.main);
        await builder.build(builder.environments.background);
      },
    },
    environments: {
      main: {
        consumer: 'client',
        build: createBuild(
          'main',
          mode === 'development'
            ? 'src/components/Core/development.tsx'
            : 'src/components/Core/index.tsx',
          true,
        ),
      },
      background: {
        consumer: 'client',
        build: createBuild(
          'background',
          'src/components/Background/index.ts',
          false,
        ),
      },
    },
    test: {
      cache: false,
      clearMocks: true,
      environment: 'happy-dom',
      env: {
        TZ: 'America/Chicago',
      },
      setupFiles: ['./src/tests/setup.ts'],
    },
  };
});
