import React from 'react';

import { useId } from '../../hooks/useId';
import { useStorage } from '../../hooks/useStorage';
import { listen } from '../../utils/events';
import type { RA, RR } from '../../utils/types';
import { filterArray } from '../../utils/types';
import type { CalendarListEntry } from '../Contexts/CalendarsContext';
import { CalendarsContext } from '../Contexts/CalendarsContext';
import type { MatchRule, VirtualCalendar } from '../Widgets/VirtualCalendars';
import { matchRules } from '../Widgets/VirtualCalendars';

export function AutoComplete(): JSX.Element {
  const calendars = React.useContext(CalendarsContext);

  const virtualCalendars = useVirtualCalendars();
  const virtualCalendarsRef = React.useRef(virtualCalendars);
  React.useEffect(() => {
    virtualCalendarsRef.current = virtualCalendars;
  }, [virtualCalendars]);

  const [synonyms = []] = useStorage('synonyms');
  const synonymsRef = React.useRef(synonyms);
  React.useEffect(() => {
    synonymsRef.current = synonyms;
  }, [synonyms]);

  const dataListId = useId('autocomplete-list')('');

  React.useEffect(
    () =>
      listen(document.body, 'input', ({ target }) => {
        if (!Array.isArray(calendars)) return;
        const element = target as HTMLInputElement;
        if (!isEventNameInput(element)) return;

        if (!element.hasAttribute('list'))
          element.setAttribute('list', dataListId);

        if (blurListeners.has(element)) return;
        element.addEventListener('blur', handleBlur);
        blurListeners.set(element, handleBlur);

        const guessCalendar = (input: string): string | undefined =>
          virtualCalendarsRef.current.find(({ rule, value }) =>
            ruleMatchers[rule](input, value)
          )?.calendarId;

        function handleBlur(): void {
          element.removeEventListener('blur', blurListeners.get(element)!);
          blurListeners.delete(element);

          const eventName = element.value.trim();
          const guessSynonym = synonymsRef.current.find(({ synonym }) =>
            eventName.startsWith(`${synonym}:`)
          );
          let calendarId = guessSynonym?.calendar;
          if (typeof guessSynonym === 'object')
            element.value = eventName
              .slice(guessSynonym.synonym.length + 1)
              .trim();
          else {
            calendarId = guessCalendar(eventName);
            if (calendarId === undefined) return;
          }

          const parent = findParent(element);
          if (parent === undefined) return;
          const select = findCalendarSelector(parent);
          if (select === undefined) return;

          // Don't change calendar if correct one is already selected
          const currentCalendar = select.querySelector(
            '[aria-selected="true"]'
          )?.textContent;
          if (
            currentCalendar ===
            calendars?.find(({ id }) => id === calendarId)?.summary
          )
            return;

          waitAndClick(parent, select, () => {
            const option = findOption(calendars!, calendarId!, select);
            option.click();
            // The option click is not registering if focusing the input too soon
            setTimeout(() => element.focus(), 200);
          });
        }
      }),
    [calendars, dataListId]
  );

  const eventNames = React.useMemo(
    () =>
      filterArray(
        virtualCalendars.map(({ rule, value }) =>
          rule === 'startsWith'
            ? { label: `${value}*`, value }
            : rule === 'equals'
            ? { label: value, value }
            : undefined
        ) ?? []
      ),
    [virtualCalendars]
  );

  return (
    <datalist id={dataListId}>
      {eventNames.map(({ label, value }, index) => (
        <option key={index} value={value}>
          {label}
        </option>
      ))}
    </datalist>
  );
}

export function useVirtualCalendars(): RA<VirtualCalendar> {
  const [rawVirtualCalendars] = useStorage('virtualCalendars');

  // Sort the rules according to their priority
  return React.useMemo(
    () =>
      Array.isArray(rawVirtualCalendars)
        ? matchRules.flatMap((ruleName) =>
            rawVirtualCalendars.filter(({ rule }) => rule === ruleName)
          )
        : [],
    [rawVirtualCalendars]
  );
}

const blurListeners = new WeakMap<HTMLInputElement, () => void>();

export const ruleMatchers: RR<
  MatchRule,
  (value: string, input: string) => boolean
> = {
  equals: (value, input) => value === input,
  endsWith: (value, input) => value.endsWith(input),
  startsWith: (value, input) => value.startsWith(input),
  contains: (value, input) => value.includes(input),
  regex: (value, input) => new RegExp(input, 'u').test(value),
};

function isEventNameInput(element: HTMLInputElement): boolean {
  if (
    element.tagName !== 'INPUT' ||
    element.type !== 'text' ||
    element.getAttribute('autoComplete') !== 'off' ||
    element.hasAttribute('aria-haspopup') ||
    element.hasAttribute('data-date')
  )
    return false;
  const isInMiniEditor =
    element.hasAttribute('autofocus') && element.getAttribute('value') === '';
  const isInEditor = element.hasAttribute('dir');
  return isInMiniEditor || isInEditor;
}

function findParent(element: HTMLInputElement): HTMLElement | undefined {
  let parent: HTMLElement | undefined = element;
  while (
    parent !== undefined &&
    parent.getAttribute('role') !== 'main' &&
    parent.getAttribute('role') !== 'dialog'
  )
    parent = parent.parentElement ?? undefined;
  return parent;
}

function findCalendarSelector(parent: HTMLElement): HTMLElement | undefined {
  const select = parent.querySelector<HTMLElement>(
    '[role="listbox"]:not([tabindex])[id]'
  );
  if (select === null) {
    console.warn('Unable to find calendar selector box');
    return undefined;
  }
  return select;
}

/**
 * Open the list of calendars and wait for it to be rendered
 */
function waitAndClick(
  parent: HTMLElement,
  select: HTMLElement,
  callback: () => void
): void {
  const calendarsButton = parent.querySelector<HTMLElement>(
    '[data-key="calendar"]'
  );
  const clickable =
    calendarsButton ?? select.querySelector('[role="presentation"]');
  clickable?.click();
  const timeOut = calendarsButton === null ? 200 : 440;

  // Unfortunately, the listbox has JS animation (can't be disabled with CSS)
  setTimeout(callback, timeOut);
}

function findOption(
  calendars: RA<CalendarListEntry>,
  calendarId: string,
  select: HTMLElement
): HTMLElement {
  const options = Array.from(
    select.querySelectorAll<HTMLElement>('[role="option"]')
  );
  const calendar = calendars.find(({ id }) => id === calendarId)!;
  const option = options.find(
    (option) => option.textContent === calendar.summary
  );
  /*
   * User's primary calendar (the first in the list) has name that doesn't
   * match the value in the summary field
   */
  return option ?? options[0];
}
