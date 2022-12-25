import React from 'react';

import { useAsyncState } from '../../hooks/useAsyncState';
import { listen } from '../../utils/events';
import { f } from '../../utils/functools';
import { mappedFind } from '../../utils/utils';
import { awaitElement } from '../Contexts/CalendarsContext';
import { usePref } from '../Preferences/usePref';

const className = 'less-invasive-batch-edit';

type Elements = {
  readonly overlay: HTMLElement;
  readonly submitButton: HTMLElement;
};

export function BetterEditRecurring(): null {
  const [lessInvasiveDialog] = usePref('recurringEvents', 'lessInvasiveDialog');

  /**
   * Find dialog containers
   * Assuming there could be more than one container because:
   * - There could be other unrelated dialogs
   * - Sometimes google calendar lags, and eventually opens up more than on
   *   "Edit Recurring Event" dialogs on top of each other
   */
  const [dialogContainers] = useAsyncState(
    React.useCallback(
      async () =>
        lessInvasiveDialog
          ? awaitElement(() => {
              const containers = Array.from(document.body.children).filter(
                (container) =>
                  container.tagName === 'DIV' &&
                  container.querySelector('iframe') === null &&
                  container.hasAttribute('id') &&
                  !container.hasAttribute('aria-live') &&
                  !container.hasAttribute('aria-hidden')
              );
              return containers.length === 0 ? undefined : containers;
            })
          : undefined,
      [lessInvasiveDialog]
    ),
    false
  );

  const elements = React.useRef<Elements | undefined>(undefined);

  // Listen for dialog open and find the submit button
  React.useEffect(() => {
    if (dialogContainers === undefined) {
      elements.current = undefined;
      return undefined;
    }

    const observer = new MutationObserver((mutationList) => {
      const targets = f.unique(
        mutationList.map(({ target }) => target as HTMLElement)
      );
      const overlays = targets.flatMap((target) =>
        Array.from<HTMLElement>(target.querySelectorAll('[isfullscreen]'))
      );
      const potentialElements = mappedFind(overlays, findElements);
      potentialElements?.overlay.classList.add(className);
      elements.current = potentialElements;
    });

    dialogContainers.forEach((container) =>
      observer.observe(container, { childList: true })
    );

    return () => {
      observer.disconnect();
      elements.current = undefined;
    };
  }, [dialogContainers]);

  // Submit the dialog on click outside
  React.useEffect(
    () =>
      dialogContainers === undefined
        ? undefined
        : listen(document.body, 'mousedown', ({ target }) =>
            target === null ||
            elements.current?.overlay.contains(target as Element) !== false
              ? undefined
              : elements.current?.submitButton.click()
          ),
    [dialogContainers]
  );

  return null;
}

/**
 * Find the three options in the "Edit recurring event" dialog.
 */
function findElements(overlay: HTMLElement): Elements | undefined {
  const options = overlay.querySelectorAll(
    '[role="dialog"] [role="radiogroup"] label'
  );
  // Confirm we are in the correct dialog
  if (options === undefined || options.length !== 3) return undefined;

  const submitButton = overlay.querySelector(
    '[role="dialog"] [role="button"][autofocus]'
  );
  if (submitButton === null) return undefined;

  return {
    overlay,
    submitButton: submitButton as HTMLElement,
  };
}
