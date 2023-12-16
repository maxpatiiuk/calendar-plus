/**
 * Setup file. This runs for each test file
 */

import '@testing-library/jest-dom';
import './__mocks__/chrome';

import { configure } from '@testing-library/dom';
import failOnConsole from 'jest-fail-on-console';

// Fail a test if it calls console.error or console.warn
failOnConsole();

configure({
  throwSuggestions: true,
});
