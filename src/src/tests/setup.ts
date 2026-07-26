/**
 * Setup file. This runs for each test file
 */

import '@testing-library/jest-dom/vitest';
import './__mocks__/chrome';

import { configure } from '@testing-library/dom';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, beforeEach, vi } from 'vitest';

type ReactActEnvironment = typeof globalThis & {
  IS_REACT_ACT_ENVIRONMENT?: boolean;
};

const reactActEnvironment = globalThis as ReactActEnvironment;
const previousReactActEnvironment =
  reactActEnvironment.IS_REACT_ACT_ENVIRONMENT;

beforeAll(() => {
  reactActEnvironment.IS_REACT_ACT_ENVIRONMENT = true;
});

afterAll(() => {
  reactActEnvironment.IS_REACT_ACT_ENVIRONMENT = previousReactActEnvironment;
});

// Fail a test if it calls console.error or console.warn
beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation((...messages) => {
    throw new Error(messages.join(' '));
  });
  vi.spyOn(console, 'warn').mockImplementation((...messages) => {
    throw new Error(messages.join(' '));
  });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

configure({
  throwSuggestions: true,
});
