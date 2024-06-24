import React from 'react';
import { SECOND } from '../Atoms/Internationalization';
import { debounce } from '../../utils/utils';
import { mainElement } from '../Molecules/Portal';
import { setMainChangeListener } from '../Molecules/mainListener';

/**
 * Observe changes to the event container, possibly necessitating a
 * re-read of the DOM.
 * Returns a number that can be put into useEffect's dependency array to
 * re-trigger the useEffect
 */
export function useDomMutation(enabled: boolean): number {
  const [counter, setCounter] = React.useState(0);
  React.useEffect(() => {
    if (!enabled) return;
    let bump: (() => void) | undefined;
    return setMainChangeListener(() => {
      // Don't bump until the grid container is created
      bump ??= mainElement?.querySelector<HTMLElement>('[role="grid"]')
        ? debounce(() => setCounter((counter) => counter + 1), SECOND)
        : undefined;

      bump?.();
    });
  }, [enabled]);
  return counter;
}
