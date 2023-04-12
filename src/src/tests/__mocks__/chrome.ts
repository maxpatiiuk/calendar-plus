/**
 * There already is a library "jest-webextension-mock" which provides Chrome
 * Extension API mocks, but it does not support Manifest V3
 *
 * There is also "jest-chrome" but it does not support Jest 29 at the moment
 *
 */
import type { IR, R } from '../../utils/types';

const localData: R<unknown> = {};
const syncData: R<unknown> = {};

Object.defineProperty(globalThis, 'chrome', {
  value: {
    storage: {
      local: {
        get: async (): Promise<unknown> => localData,
        async set(entries: IR<unknown>) {
          Object.entries(entries).forEach(([key, value]) => {
            localData[key] = value;
          });
        },
      },
      sync: {
        get: async (): Promise<unknown> => syncData,
        async set(entries: IR<unknown>) {
          Object.entries(entries).forEach(([key, value]) => {
            syncData[key] = value;
          });
        },
      },
    },
    runtime: {
      getURL: (path: string): string =>
        `chrome-extension://kgbbebdcmdgkbopcffmpgkgcmcoomhmh/${path}`,
    },
  },
});
