/**
 * There already is a library "jest-webextension-mock" which provides Chrome
 * Extension API mocks, but it does not support Manifest V3
 *
 * There is also "jest-chrome" but it does not support Jest 29 at the moment
 *
 */
import type { IR, R } from '../../utils/types';

const data: R<unknown> = {};

Object.defineProperty(globalThis, 'chrome', {
  value: {
    storage: {
      local: {
        async get(key: string): Promise<unknown> {
          return data[key];
        },
        async set(entries: IR<unknown>) {
          Object.entries(entries).forEach(([key, value]) => {
            data[key] = value;
          });
        },
      },
    },
  },
});
