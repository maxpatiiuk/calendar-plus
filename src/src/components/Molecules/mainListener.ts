import { mainElementPromise } from './Portal';
import { output } from '../Errors/exceptions';

const mainListeners = new Set<() => void>([]);

export function setMainChangeListener(callback: () => void) {
  mainListeners.add(callback);
  return () => void mainListeners.delete(callback);
}

/**
 * Listen for the changes to events displayed on the page and call a callback
 * when changes are detected.
 */
mainElementPromise.then((main) => {
  if (main === undefined) {
    output.error('Unable to find the main element');
    return;
  }

  const config = { childList: true, subtree: true };
  const observer = new MutationObserver(() =>
    mainListeners.forEach((listener) => listener()),
  );
  observer.observe(main, config);
});
