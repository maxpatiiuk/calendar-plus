import React from 'react';

import { throttle } from '../../utils/utils';

/**
 * Listen for the changes to events displayed on the page and call a callback
 * when changes are detected.
 */
export function usePageListener(
  mainContainer: HTMLElement | undefined,
  callback: () => void,
): void {
  // Listen for DOM changes
  React.useEffect(() => {
    if (mainContainer === undefined) return undefined;
    const config = { childList: true, subtree: true };
    const observer = new MutationObserver(throttle(callback, 60));
    observer.observe(mainContainer, config);
    return (): void => observer.disconnect();
  }, [mainContainer, callback]);
}
