import React from 'react';
import ReactDOM from 'react-dom';

let portalRoot: HTMLElement | undefined = undefined;
let portalStack = new Set<unknown>();

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
      commonContainer.appendChild(portalRoot);
    }
    portalRoot.append(element);

    return (): void => {
      element.remove();
      portalStack.delete(portalId);
      if (portalStack.size === 0) mainContainer.classList.remove('hidden');
    };
  }, [element]);

  return ReactDOM.createPortal(children, element);
}

/**
 * Find container that shows Google Calendar's main content
 */
const findMainContainer = (): Element | undefined =>
  document.querySelector('[role="main"]') ?? undefined;
