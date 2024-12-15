import React from 'react';

import { useAsyncState } from '../../hooks/useAsyncState';
import { listen } from '../../utils/events';
import { f } from '../../utils/functools';
import { mappedFind } from '../../utils/utils';
import { awaitElement } from '../Contexts/CalendarsContext';
import { usePref } from '../Preferences/usePref';

const className = 'less-invasive-edit-recurring';

type Elements = {
  readonly overlay: HTMLElement;
  readonly dialog: HTMLElement;
  readonly submitButton: HTMLElement;
};

/**
 * Less invasive "Edit Recurring Event" dialog. Optimized for speed for power
 * users
 */
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
                  !container.hasAttribute('aria-hidden'),
              );
              return containers.length === 0 ? undefined : containers;
            })
          : undefined,
      [lessInvasiveDialog],
    ),
    false,
  );

  const elements = React.useRef<Elements | undefined>(undefined);

  // Listen for dialog open and find the submit button
  React.useEffect(() => {
    if (dialogContainers === undefined) {
      elements.current = undefined;
      return undefined;
    }

    const observer = new MutationObserver((mutationList) => {
      const dialogContainers = f.unique(
        mutationList.map(({ target }) => target as HTMLElement),
      );
      const pairs = dialogContainers.flatMap((dialogContainer) =>
        Array.from(
          dialogContainer.querySelectorAll('[role="dialog"]'),
          (dialog) => [dialogContainer, dialog as HTMLElement] as const,
        ),
      );
      const potentialElements = mappedFind(pairs, ([dialogContainer, dialog]) =>
        findElements(dialogContainer, dialog),
      );
      potentialElements?.overlay.classList.add(className);
      elements.current = potentialElements;
    });

    dialogContainers.forEach((container) =>
      observer.observe(container, { childList: true }),
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
              : elements.current?.submitButton.click(),
          ),
    [dialogContainers],
  );

  return null;
}

/**
 * Find the three options in the "Edit recurring event" dialog.
 */
function findElements(
  dialogContainer: HTMLElement,
  dialog: HTMLElement,
): Elements | undefined {
  const overlay =
    Array.from(dialogContainer.children).find((child) =>
      child.contains(dialog),
    ) ??
    dialogContainer.firstElementChild ??
    undefined;
  if (overlay === undefined) return;

  const options = dialog.querySelectorAll('[role="radiogroup"] label');
  /*
   * When moving within day, the "All events" option is present. If moving
   * between days, that option is not present
   */
  const optionsCount = [2, 3];
  // Confirm we are in the correct dialog
  if (options === undefined || !optionsCount.includes(options.length)) return;

  const hasInput = !!dialog.querySelector('input[type="number"]');
  // This might be the "Custom recurrence" dialog - false positive.
  if (hasInput) return;

  const submitButton = dialog.querySelector(
    'button[data-mdc-dialog-initial-focus]',
  );
  if (submitButton === null) return;

  return {
    overlay: overlay as HTMLElement,
    dialog,
    submitButton: submitButton as HTMLElement,
  };
}
