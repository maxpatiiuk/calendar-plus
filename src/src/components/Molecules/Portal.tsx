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
  const element = React.useMemo(() => document.createElement('div'), []);

  React.useEffect(() => {
    const portalId = {};
    portalStack.add(portalId);

    const header = document.querySelector('header');
    if (header === null) throw new Error('Unable to find app header');

    // Nearest parent for header, main content and portal container
    const commonContainer = header.parentElement!;

    const mainContainer = findMainContainer(commonContainer);
    if (mainContainer === undefined)
      throw new Error('Unable to find main container');
    mainContainer.classList.add('hidden');

    if (portalRoot === undefined) {
      portalRoot = document.createElement('div');
      commonContainer.appendChild(portalRoot);
    }
    portalRoot.append(element);

    return (): void => {
      element.remove();
      portalStack.delete(portalId);
      if (portalStack.size === 0) {
        mainContainer.classList.remove('hidden');
      }
    };
  }, [element]);

  return ReactDOM.createPortal(children, element);
}

/**
 * Find container that shows Google Calendar's main content
 */
const findMainContainer = (parent: HTMLElement): Element | undefined =>
  Array.from(parent.children).find(
    (container) => container.querySelector('[aria-label="Side panel"') !== null
  );
