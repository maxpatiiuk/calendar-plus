import React from 'react';

import { useAsyncState } from '../../hooks/useAsyncState';
import { listen } from '../../utils/events';
import { mappedFind } from '../../utils/utils';
import { awaitElement } from '../Contexts/CalendarsContext';
import { usePref } from '../Preferences/usePref';
import { CurrentViewContext } from '../Contexts/CurrentViewContext';

const shiftTimeout = 10 * 1000;

/**
 * Less invasive "Edit Recurring Event" dialog. Optimized for speed for power
 * users
 */
export function BetterEditRecurring(): null {
  const [lessInvasiveDialog] = usePref('recurringEvents', 'lessInvasiveDialog');
  const currentView = React.useContext(CurrentViewContext);
  const isInEventsView = React.useRef(false);
  isInEventsView.current = currentView !== undefined;
  const shiftTimeoutRef = React.useRef<number | undefined>(undefined);

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

  // Listen for dialog open and find the submit button
  React.useEffect(() => {
    if (dialogContainer === undefined) {
      return;
    }

    const observer = new MutationObserver(() => {
      if (hasShiftKey.current || !isInEventsView.current) return;

      const pairs = Array.from(
        dialogContainer.querySelectorAll('[role="dialog"]'),
        (dialog) => [dialogContainer, dialog as HTMLElement] as const,
      );

      const submitButton = mappedFind(pairs, ([dialogContainer, dialog]) =>
        findSubmitButton(dialogContainer, dialog),
      );

      submitButton?.click();
    });

    observer.observe(dialogContainer, { childList: true });

    return () => {
      observer.disconnect();
    };
  }, [dialogContainer]);

  const hasShiftKey = React.useRef(false);
  React.useEffect(
    () =>
      lessInvasiveDialog
        ? listen(document.body, 'keydown', (event) => {
            if (event.key === 'Shift') {
              hasShiftKey.current = true;
              clearTimeout(shiftTimeoutRef.current);
              // Detecting all the cases where keyup never fires is tricky and
              // requires multiple listeners. Using timeout to keep it simple
              shiftTimeoutRef.current = window.setTimeout(() => {
                hasShiftKey.current = false;
              }, shiftTimeout);
            }
          })
        : undefined,
    [lessInvasiveDialog],
  );
  React.useEffect(
    () =>
      lessInvasiveDialog
        ? listen(document.body, 'keyup', (event) => {
            if (event.key === 'Shift') {
              hasShiftKey.current = false;
              clearTimeout(shiftTimeoutRef.current);
            }
          })
        : undefined,
    [lessInvasiveDialog],
  );

  return null;
}

/**
 * Ensure we are in the "Edit recurring event" dialog and find the submit
 * button.
 */
function findSubmitButton(
  dialogContainer: HTMLElement,
  dialog: HTMLElement,
): HTMLElement | undefined {
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

  return submitButton as HTMLElement;
}
