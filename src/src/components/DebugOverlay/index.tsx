import React from 'react';

import { sendRequest } from '../Background/messages';

/**
 * Used when in development. Adds a button to reload the extension
 */
export function DebugOverlay(): JSX.Element {
  return (
    <div className="absolute top-0 left-0">
      <button
        type="button"
        onClick={(): void =>
          /**
           * Inspired by:
           * https://60devs.com/hot-reloading-for-chrome-extensions.html
           * https://chrome.google.com/webstore/detail/extensions-reloader/fimgfedafeadlieiabdeeaodndnlbhid
           */
          void sendRequest('ReloadExtension', undefined).catch(console.error)
        }
      >
        Reload Extension
      </button>
    </div>
  );
}
