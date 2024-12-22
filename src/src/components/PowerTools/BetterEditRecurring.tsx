import React from 'react';

import { useAsyncState } from '../../hooks/useAsyncState';
import { listen } from '../../utils/events';
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
  const [dialogContainer] = useAsyncState(
    React.useCallback(
      async () =>
        lessInvasiveDialog
          ? awaitElement(
              () =>
                Array.from(document.body.children).find(
                  (container) =>
                    container.tagName === 'DIV' &&
                    container.querySelector('iframe') === null &&
                    container.hasAttribute('id') &&
                    !container.hasAttribute('aria-live') &&
                    !container.hasAttribute('aria-hidden'),
                ) as HTMLElement | undefined,
            )
          : undefined,
      [lessInvasiveDialog],
    ),
    false,
  );

  const elements = React.useRef<Elements | undefined>(undefined);

  // Listen for dialog open and find the submit button
  React.useEffect(() => {
    if (dialogContainer === undefined) {
      elements.current = undefined;
      return undefined;
    }

    const observer = new MutationObserver(() => {
      const pairs = Array.from(
        dialogContainer.querySelectorAll('[role="dialog"]'),
        (dialog) => [dialogContainer, dialog as HTMLElement] as const,
      );

      const potentialElements = mappedFind(pairs, ([dialogContainer, dialog]) =>
        findElements(dialogContainer, dialog),
      );
      potentialElements?.overlay.classList.add(className);

      if (
        potentialElements !== undefined &&
        elements.current?.submitButton?.isConnected
      ) {
        elements.current.submitButton.click();
      }

      elements.current = potentialElements;
    });

    observer.observe(dialogContainer, { childList: true });

    return () => {
      observer.disconnect();
      elements.current = undefined;
    };
  }, [dialogContainer]);

  // Submit the dialog on click outside
  React.useEffect(
    () =>
      dialogContainer === undefined
        ? undefined
        : listen(
            document.body,
            'mousedown',
            ({ target }) =>
              target === null ||
              elements.current?.overlay.contains(target as Element) !== false
                ? undefined
                : elements.current?.submitButton.click(),
            { capture: true, passive: true },
          ),
    [dialogContainer],
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
