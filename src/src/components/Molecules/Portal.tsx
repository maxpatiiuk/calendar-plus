import React from 'react';
import ReactDOM from 'react-dom';

import { useAsyncState } from '../../hooks/useAsyncState';
import { awaitElement } from '../Contexts/CalendarsContext';
import { output } from '../Errors/exceptions';

/**
 * A React Portal wrapper
 *
 * @remarks
 * Based on https://blog.logrocket.com/learn-react-portals-by-example/
 *
 * Used when an elements needs to be rendered outside of the bounds of
 * the container that has overflow:hidden
 */
export function usePortal(children: JSX.Element): {
  element: HTMLElement;
  portal: JSX.Element;
} {
  const element = React.useMemo(() => document.createElement('div'), []);
  React.useEffect(() => () => element.remove(), [element]);

  return {
    element,
    portal: (
      <PortalContext.Provider value={element}>
        {ReactDOM.createPortal(children, element)}
      </PortalContext.Provider>
    ),
  };
}

let overlayRoot: HTMLElement | undefined = undefined;
const overlayPortalStack = new Set<unknown>();

export function OverlayPortal({
  children,
}: {
  readonly children: JSX.Element;
}): JSX.Element {
  const { element, portal } = usePortal(children);

  React.useEffect(() => {
    element.className = 'h-full';
    const portalId = {};
    overlayPortalStack.add(portalId);

    const mainContainer = findMainContainer();
    if (mainContainer === undefined)
      return output.throw('Unable to find main container');

    // Hide Google Calendar container when the overlay is shown
    mainContainer.classList.add('hidden');

    // Create a container that would house the React portal
    if (overlayRoot === undefined) {
      overlayRoot = document.createElement('div');
      overlayRoot.className = 'h-full';

      // Nearest parent for both main content and portal container
      const commonContainer = mainContainer.parentElement!;
      commonContainer.append(overlayRoot);
    }
    overlayRoot.append(element);

    return (): void => {
      overlayPortalStack.delete(portalId);
      if (overlayPortalStack.size === 0)
        mainContainer.classList.remove('hidden');
    };
  }, [element]);

  return portal;
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
