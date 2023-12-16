import React from 'react';
import ReactDOM from 'react-dom';

import { useAsyncState } from '../../hooks/useAsyncState';
import { awaitElement } from '../Contexts/CalendarsContext';

let portalRoot: HTMLElement | undefined = undefined;
const portalStack = new Set<unknown>();

/**
 * A React Portal wrapper
 *
 * @remarks
 * Based on https://blog.logrocket.com/learn-react-portals-by-example/
 *
 * Used when an elements needs to be renreded outside of the bounds of
 * the container that has overflow:hidden
 */
export function Portal({
  children,
}: {
  readonly children: JSX.Element;
}): JSX.Element {
  const element = React.useMemo(() => {
    const element = document.createElement('div');
    element.className = 'h-full';
    return element;
  }, []);

  React.useEffect(() => {
    const portalId = {};
    portalStack.add(portalId);

    const mainContainer = findMainContainer();
    if (mainContainer === undefined)
      throw new Error('Unable to find main container');

    // Hide Google Calendar container when the overlay is shown
    mainContainer.classList.add('hidden');

    // Create a container that would house the React portal
    if (portalRoot === undefined) {
      portalRoot = document.createElement('div');
      portalRoot.className = 'h-full';

      // Nearest parent for both main content and portal container
      const commonContainer = mainContainer.parentElement!;
      commonContainer.append(portalRoot);
    }
    portalRoot.append(element);

    return (): void => {
      element.remove();
      portalStack.delete(portalId);
      if (portalStack.size === 0) mainContainer.classList.remove('hidden');
    };
  }, [element]);

  return (
    <PortalContext.Provider value={element}>
      {ReactDOM.createPortal(children, element)}
    </PortalContext.Provider>
  );
}

/**
 * Find container that shows Google Calendar's main content
 */
export const findMainContainer = (): Element | undefined =>
  document.querySelector('[role="main"]') ?? undefined;

const awaitMainContainer = async (): Promise<HTMLElement | undefined> =>
  awaitElement(() => findMainContainer()?.parentElement ?? undefined);

export function useMainContainer(): HTMLElement | undefined {
  return useAsyncState(awaitMainContainer, false)[0];
}

export const PortalContext = React.createContext<Element | undefined>(
  undefined,
);
PortalContext.displayName = 'PortalContext';
