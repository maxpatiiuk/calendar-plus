/**
 * Setup file. This runs for each test file
 */

import '@testing-library/jest-dom';
import './__mocks__/chrome.ts';

import { configure } from '@testing-library/dom';
import failOnConsole from 'jest-fail-on-console';

// Fail a test if it calls console.error or console.log
failOnConsole();

configure({
  throwSuggestions: true,
});
