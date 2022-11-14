import React from 'react';

import { sendRequest } from '../Background/messages';

/**
 * Inspired by:
 * https://60devs.com/hot-reloading-for-chrome-extensions.html
 * https://chrome.google.com/webstore/detail/extensions-reloader/fimgfedafeadlieiabdeeaodndnlbhid
 */
export function DebugOverlay(): JSX.Element {
  return (
    <div className="absolute top-0 left-0">
      <button
        type="button"
        onClick={async (): Promise<void> =>
          sendRequest('ReloadExtension', undefined)
        }
      >
        Reload Extension
      </button>
      <button
        type="button"
        onClick={async (): Promise<void> => {
          await chrome.storage.local.clear();
          await chrome.storage.sync.clear();
          window.location.reload();
        }}
      >
        Clear Storage
      </button>
    </div>
  );
}
