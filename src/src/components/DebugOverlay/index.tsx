import React from 'react';
import { sendRequest } from '../Background/messages';

/**
 * Inspired by:
 * https://60devs.com/hot-reloading-for-chrome-extensions.html
 * https://chrome.google.com/webstore/detail/extensions-reloader/fimgfedafeadlieiabdeeaodndnlbhid
 */
export function DebugOverlay(): JSX.Element {
  return (
    <button
      type="button"
      className="absolute top-0 left-0"
      onClick={() => sendRequest('ReloadExtension', undefined)}
    >
      Reload Extension
    </button>
  );
}
