import React from 'react';

import { useId } from '../../hooks/useId';
import { useStorage } from '../../hooks/useStorage';
import { listen } from '../../utils/events';
import type { RA, RR } from '../../utils/types';
import { isDefined } from '../../utils/types';
import type { CalendarListEntry } from '../Contexts/CalendarsContext';
import { CalendarsContext } from '../Contexts/CalendarsContext';
import type { MatchRule, VirtualCalendar } from '../Widgets/VirtualCalendars';
import { matchRules } from '../Widgets/VirtualCalendars';
import { Synonym } from '../Widgets/Synonyms';
import { output } from '../Errors/exceptions';
import { usePref } from '../Preferences/usePref';
import { domParsedEvents } from '../EventsStore';

const indicator = document.createElement('div');
indicator.id = 'calendar-plus-autocomplete-indicator';

/**
 * Provide autocomplete for calendar event names and automatically put events
 * into correct calendars based on rules defined by the user
 */
export function AutoComplete({
  durations,
}: {
  durations: unknown;
}): JSX.Element {
  const calendars = React.useContext(CalendarsContext);

  const [autocompleteFromCurrentWeek] = usePref(
    'behavior',
    'autocompleteFromCurrentWeek',
  );

  const virtualCalendars = useVirtualCalendars();
  const virtualCalendarsRef = React.useRef(virtualCalendars);
  virtualCalendarsRef.current = virtualCalendars;

  const [synonyms = []] = useStorage('synonyms');
  const synonymsRef = React.useRef(synonyms);
  React.useEffect(() => {
    synonymsRef.current = synonyms;
  }, [synonyms]);

  const dataListId = useId('autocomplete-list')('');

  const [activeMatch, setActiveMatch] = React.useState<Synonym | undefined>(
    undefined,
  );

  React.useEffect(
    () =>
      listen(document.body, 'input', ({ target }) => {
        if (!Array.isArray(calendars)) return;
        const element = target as HTMLInputElement;
        if (!isEventNameInput(element)) return;

        if (!element.hasAttribute('list'))
          element.setAttribute('list', dataListId);

        const guessCalendar = (input: string): string | undefined =>
          virtualCalendarsRef.current.find(
            ({ rule, value }) =>
              rule === 'equals' && ruleMatchers[rule](input, value),
          )?.calendarId ??
          (autocompleteFromCurrentWeek
            ? autocompleteFromWeek(input)
            : undefined) ??
          virtualCalendarsRef.current.find(
            ({ rule, value }) =>
              rule !== 'equals' && ruleMatchers[rule](input, value),
          )?.calendarId;

        function autocompleteFromWeek(input: string): string | undefined {
          const calendarIds = new Set(
            getCurrentWeekEvents()
              .filter(([summary]) => summary === input)
              .map(([_, calendarId]) => calendarId),
          );
          return calendarIds.size === 1
            ? calendarIds.values().next().value
            : undefined;
        }

        function findMatch(): (Synonym & { eventName: string }) | undefined {
          const eventName = element.value.trim();
          const guessSynonym = synonymsRef.current.find(({ synonym }) =>
            eventName.startsWith(`${synonym}:`),
          );
          if (typeof guessSynonym === 'object')
            return {
              eventName,
              synonym: guessSynonym.synonym + ':',
              calendar: guessSynonym.calendar,
            };
          const guess =
            guessCalendar(eventName) ??
            (eventName.startsWith('.')
              ? guessCalendar(eventName.slice(1))
              : undefined);

          return guess === undefined
            ? undefined
            : {
                eventName,
                calendar: guess,
                synonym: '',
              };
        }

        const match = findMatch();
        setActiveMatch(match);

        // Show autocomplete prediction indicator
        const parent = element.parentElement;
        if (match) {
          const calendar = calendars.find(({ id }) => id === match.calendar);
          indicator.style.background =
            calendar?.backgroundColor ?? 'transparent';
          parent?.append(indicator);
        } else indicator.remove();

        if (blurListeners.has(element)) return;
        element.addEventListener('blur', handleBlur);
        blurListeners.set(element, handleBlur);

        function handleBlur(): void {
          element.removeEventListener('blur', blurListeners.get(element)!);
          blurListeners.delete(element);

          const match = findMatch();
          if (match === undefined) return;
          if (match.synonym.length > 0)
            element.value = match.eventName
              .slice(match.synonym.length)
              .slice()
              .trim();

          if (calendars === undefined)
            output.error('Unable to retrieve calendars');
          const calendar = calendars?.find(({ id }) => id === match.calendar);
          if (calendar === undefined) {
            output.error('Unable to find current calendar');
            return;
          }

          const parent = findParent(element);
          if (parent === undefined) return;

          /**
           * In full-screen editor there will be only 1 such icon.
           * In mini-editor, there will be 3. 1st is used in the
           * collapsed calendar selector. 2nd is used in expanded calendar
           * selector (the one we want). 3rd is used in some sort of read-only
           * UI.
           */
          const calendarIcon = Array.from(
            parent.querySelectorAll<HTMLElement>('.google-material-icons'),
          )
            .filter((icon) => icon.textContent === 'event')
            .slice(0, 2)
            .at(-1);
          const combobox = closestSibling(calendarIcon, '[role="combobox"]');
          if (combobox === undefined) {
            output.error('Unable to find the calendars combobox');
            return;
          }

          // This button does not exist in the full-page editor
          const expandCalendarsButton = findCalendarsButton(parent);
          const alreadyOpened =
            expandCalendarsButton === undefined ||
            expandCalendarsButton.offsetWidth === 0;

          const trigger = expandCalendarsButton ?? combobox;
          // Don't change calendar if correct one is already selected
          if (trigger.textContent === calendar.summary) return;

          clickAndWait(trigger, alreadyOpened, () => {
            const listbox = closestSibling(
              combobox,
              '[role="listbox"]:not([aria-hidden])',
            );

            if (listbox === undefined) {
              output.error('Unable to find the calendars listbox');
              return;
            }
            const option = findOption(calendar, listbox);
            if (option === undefined) {
              output.error('Unable to find the calendar option');
              return;
            }
            option.click();
            // The option click is not registering if focusing the input too soon
            setTimeout(() => element.focus(), 200);
          });
        }
      }),
    [calendars, dataListId, autocompleteFromCurrentWeek],
  );

  const eventNames = React.useMemo(
    () =>
      virtualCalendars
        .map(({ rule, value, calendarId }) =>
          rule === 'startsWith'
            ? { label: `${value}*`, value, calendarId }
            : rule === 'equals'
              ? { label: value, value, calendarId }
              : undefined,
        )
        .filter(isDefined) ?? [],
    [virtualCalendars],
  );

  const activeEventNames = React.useMemo(() => {
    if (activeMatch === undefined || activeMatch.synonym.length === 0)
      return eventNames;
    return eventNames
      .filter(({ calendarId }) => calendarId === activeMatch.calendar)
      .map(({ label, value }) => ({
        label: `${activeMatch.synonym}${label}`,
        value,
      }));
  }, [eventNames, activeMatch]);

  const withInferredAutocomplete = React.useMemo(() => {
    let currentWeekPredictions = autocompleteFromCurrentWeek
      ? getCurrentWeekEvents()
      : [];
    if (activeMatch !== undefined && activeMatch.synonym.length > 0)
      currentWeekPredictions = currentWeekPredictions.filter(
        ([_subject, calendarId]) => calendarId === activeMatch.calendar,
      );

    const existingPredictions = new Set(
      activeEventNames.map(({ value }) => value),
    );
    return [
      ...activeEventNames,
      ...currentWeekPredictions
        .filter(([subject]) => !existingPredictions.has(subject))
        .map(([subject, calendarId]) => ({
          label: subject,
          value: subject,
          calendarId,
        })),
    ];
    // getCurrentWeekEvents() depends on durations
  }, [autocompleteFromCurrentWeek, durations, activeEventNames, activeMatch]);

  return (
    <datalist id={dataListId}>
      {withInferredAutocomplete.map(({ label, value }, index) => (
        <option key={index} value={value}>
          {label}
        </option>
      ))}
    </datalist>
  );
}

function closestSibling(
  initial: HTMLElement | undefined,
  selector: string,
): HTMLElement | undefined {
  let current: HTMLElement | undefined = initial;
  while (current !== undefined) {
    const sibling = current.querySelector<HTMLElement>(selector);
    if (sibling !== null) return sibling;
    current = current.parentElement ?? undefined;
  }
  return undefined;
}

export function useVirtualCalendars(): RA<VirtualCalendar> {
  const [rawVirtualCalendars] = useStorage('virtualCalendars');

  // Sort the rules according to their priority
  return React.useMemo(
    () =>
      Array.isArray(rawVirtualCalendars)
        ? matchRules.flatMap((ruleName) =>
            rawVirtualCalendars.filter(({ rule }) => rule === ruleName),
          )
        : [],
    [rawVirtualCalendars],
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
  const isInEditor = element.hasAttribute('placeholder');
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

function findCalendarsButton(parent: HTMLElement): HTMLElement | undefined {
  const calendarsButton = parent.querySelector<HTMLElement>(
    '[aria-expanded] [data-key="calendar"]',
  );
  if (calendarsButton === null) {
    return undefined;
  }
  return calendarsButton;
}

/**
 * Open the list of calendars and wait for it to be rendered
 */
function clickAndWait(
  target: HTMLElement,
  opened: boolean,
  callback: () => void,
): void {
  target.click();
  // If the listbox was already opened, the animation is shorter
  const timeOut = opened ? 200 : 440;

  // Unfortunately, the listbox has JS animation (can't be disabled with CSS)
  setTimeout(callback, timeOut);
}

function findOption(
  calendar: CalendarListEntry,
  select: HTMLElement,
): HTMLElement {
  const options = Array.from(
    select.querySelectorAll<HTMLElement>('[role="option"]'),
  );

  const option = options.find(
    (option) => option.textContent === calendar.summary,
  );
  /*
   * User's primary calendar (the first in the list) has name that doesn't
   * match the value in the summary field
   */
  return option ?? options[0];
}

// REFACTOR: migrate to Map once https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Iterator/filter is available
let hashKey: typeof domParsedEvents | undefined;
let hashedCurrentWeek: RA<readonly [string, string | undefined]> | undefined;
function getCurrentWeekEvents(): RA<readonly [string, string | undefined]> {
  if (
    (hashKey === domParsedEvents && hashedCurrentWeek !== undefined) ||
    domParsedEvents === undefined
  )
    return hashedCurrentWeek ?? [];

  hashKey = domParsedEvents;
  hashedCurrentWeek = Object.entries(
    domParsedEvents
      .flat()
      .reduce<
        Record<string, string | undefined>
      >((total, { summary, calendarId }) => {
        if (summary in total && total[summary] !== calendarId)
          total[summary] = undefined;
        else total[summary] = calendarId;
        return total;
      }, {}),
  );
  return hashedCurrentWeek;
}
