import React from 'react';

import { loadingTimeout } from '../../hooks/useAsyncState';
import { ajax } from '../../utils/ajax';
import { formatUrl } from '../../utils/queryString';
import type { IR, R, RA, WritableArray } from '../../utils/types';
import { findLastIndex, group, sortFunction } from '../../utils/utils';
import {
  formatDisjunction,
  HOUR,
  MILLISECONDS_IN_DAY,
  MINUTE,
} from '../Atoms/Internationalization';
import {
  awaitElement,
  CalendarsContext,
  type CalendarListEntry,
} from '../Contexts/CalendarsContext';
import { ruleMatchers, useVirtualCalendars } from '../PowerTools/AutoComplete';
import { usePref } from '../Preferences/usePref';
import { parseEventsFromDom } from '../DomReading';
import { output } from '../Errors/exceptions';
import { CurrentView } from '../Contexts/CurrentViewContext';
import { useDomMutation } from '../DomReading/useDomMutation';
import { devMode } from '../Contexts/devMode';
import type { ParsedDomEvent } from '../DomReading/types';

export const summedDurations: unique symbol = Symbol('calendarTotal');

export type DayHours = {
  readonly total: number;
  readonly hourly: RA<number>;
};

/* eslint-disable functional/prefer-readonly-type */
export type WritableDayHours = {
  total: number;
  hourly: number[];
};

type RawEventsStore = {
  [CALENDAR_ID in string]: {
    [VIRTUAL_CALENDAR in string]: R<WritableDayHours>;
  };
};
/* eslint-enable functional/prefer-readonly-type */
export type EventsStore = {
  readonly [CALENDAR_ID in string]: {
    readonly [summedDurations]: IR<DayHours>;
  } & {
    readonly [VIRTUAL_CALENDAR in string]: IR<DayHours>;
  };
};
type CalendarEvent = Pick<
  gapi.client.calendar.Event,
  'end' | 'start' | 'summary'
>;

/**
 * Fetch the events between the provided dates for all visible calendars,
 * calculate the total durations of all events in a given day for a given
 * calendar, and cache the computations for future use.
 */
export function useEvents(
  currentView: CurrentView | undefined,
  isOpen: boolean,
  readSource: 'dom' | 'api' | undefined,
  setDomReadingEnabled: (shouldFallback: boolean) => void,
): EventsStore | undefined {
  const eventsStore = React.useRef<RawEventsStore>({});

  /*
   * Clear temporary cache when overlay is closed because the events could be
   * edited while overlay is closed, making this cache stale
   */
  const clearCache = !isOpen || currentView === undefined;
  if (clearCache) eventsStore.current = {};
  const calendars = React.useContext(CalendarsContext);

  const [ignoreAllDayEvents] = usePref('behavior', 'ignoreAllDayEvents');
  const previousIgnoreAllDayEvents = React.useRef(ignoreAllDayEvents);

  const virtualCalendars = useVirtualCalendars();

  const isReadyToRead =
    calendars !== undefined &&
    currentView !== undefined &&
    readSource !== undefined &&
    // Don't make network requests until the overlay is opened
    (isOpen || readSource !== 'api');

  const observeDomMutations = isReadyToRead && readSource === 'dom';
  const bumpCount = useDomMutation(observeDomMutations);

  const [durations, setDurations] = React.useState<EventsStore | undefined>(
    undefined,
  );
  React.useEffect(() => {
    /*
     * If callback changes, state is reset to show the loading screen if
     * new state takes more than 1s to load
     */
    let timeout = setTimeout(() => setDurations(undefined), loadingTimeout);

    const callback = async () => {
      if (!isReadyToRead) return undefined;

      const { firstDay: startDate, lastDay: endDate } = currentView;

      // If this pref changes, force re-compute by clearing the cache
      if (ignoreAllDayEvents !== previousIgnoreAllDayEvents.current) {
        previousIgnoreAllDayEvents.current = ignoreAllDayEvents;
        eventsStore.current = {};
      }

      const guessVirtualCalendar: DomReadPayload['guessVirtualCalendar'] = (
        calendarId,
        input,
      ) =>
        virtualCalendars.find(
          (subcategory) =>
            subcategory.calendarId === calendarId &&
            ruleMatchers[subcategory.rule](input, subcategory.value),
        )?.virtualCalendar;

      const daysBetween = getDatesBetween(startDate, endDate);
      const daysBetweenStrings = daysBetween.map(dateToString);

      if (readSource === 'dom') {
        const pollInterval = 200;
        const limit = 10;
        let allDurations = '' as ReturnType<typeof readDom>;
        /**
         * While moving between time ranges or between different views, because
         * of animations, sometimes columns both for old and new range may be
         * temporary present in the DOM - retry read in chance it gets better.
         */
        await awaitElement(
          () => {
            allDurations = readDom({
              calendars,
              startDate,
              endDate,
              ignoreAllDayEvents,
              daysBetween,
              guessVirtualCalendar,
            });
            return typeof allDurations === 'string' ? undefined : allDurations;
          },
          pollInterval,
          limit,
        );
        if (typeof allDurations === 'string') {
          // Don't fail if, for example, we begun navigating to the search page
          if (destructorCalled) return;
          if (devMode) debugger;
          output.warn(
            `[Calendar Plus] DOM parse error: ${allDurations}. Falling back to retrieving data from the API rather than DOM parsing (slower, but more reliable)`,
          );
          /*
           * Failed to read the DOM. Disabling DOM reading for the rest of the
           * session to be safe
           */
          setDomReadingEnabled(false);
          return;
        }
        allDurations.forEach(([calendarId, durations]) =>
          updateEventStore(
            daysBetweenStrings,
            calendarId,
            eventsStore.current,
            durations,
            true,
          ),
        );
      } else {
        await Promise.all(
          calendars.map(async (calendar) => {
            const bounds = calculateBounds(
              eventsStore,
              calendar.id,
              startDate,
              daysBetweenStrings,
            );
            if (bounds === undefined) return;
            const [timeMin, timeMax] = bounds;

            const events = await fetchEvents(calendar.id, timeMin, timeMax);
            if (events === undefined) return;

            const durations = events.map<DurationsToAdd[number]>(
              ({ summary = '', start, end }) => {
                if (
                  ignoreAllDayEvents &&
                  // Event does not have a start and end time
                  start.dateTime === undefined &&
                  end.dateTime === undefined
                )
                  return ['', {}];
                const dates = resolveEventDates(timeMin, timeMax, start, end);
                if (dates === undefined) return ['', {}];
                const [startDate, endDate] = dates;
                const data = calculateEventDuration(startDate, endDate);
                return [
                  guessVirtualCalendar(calendar.id, summary) ?? '',
                  data,
                ] as const;
              },
            );

            updateEventStore(
              daysBetweenStrings,
              calendar.id,
              eventsStore.current,
              durations,
              false,
            );
          }),
        );
      }

      return extractData(eventsStore.current, calendars, startDate, endDate);
    };

    Promise.resolve(callback())
      .then((newState) =>
        destructorCalled ? undefined : setDurations(newState),
      )
      .catch(output.error)
      .finally(() => clearTimeout(timeout));

    let destructorCalled = false;
    return (): void => {
      destructorCalled = true;
    };
  }, [
    isReadyToRead,
    bumpCount,
    readSource,
    calendars,
    currentView,
    ignoreAllDayEvents,
    virtualCalendars,
  ]);
  return durations;
}

type DomReadPayload = {
  readonly calendars: RA<CalendarListEntry>;
  readonly startDate: Date;
  readonly endDate: Date;
  readonly ignoreAllDayEvents: boolean;
  readonly daysBetween: RA<Date>;
  readonly guessVirtualCalendar: (
    calendarId: string,
    input: string,
  ) => string | undefined;
};

export let domParsedEvents: RA<RA<ParsedDomEvent>> | undefined = undefined;

function readDom({
  calendars,
  startDate,
  endDate,
  ignoreAllDayEvents,
  daysBetween,
  guessVirtualCalendar,
}: DomReadPayload):
  | RA<readonly [string, RA<readonly [string, IR<RA<number>>]>]>
  | string {
  const domParsed = parseEventsFromDom(startDate, endDate, ignoreAllDayEvents);
  if (typeof domParsed === 'string') {
    return domParsed;
  }
  domParsedEvents = domParsed;

  const allDurations = group(
    domParsed.flatMap((column, columnIndex) =>
      column.map((event) => {
        const data = calculateEventDuration(
          timeToDate(event.startTime, daysBetween[columnIndex]),
          timeToDate(event.endTime, daysBetween[columnIndex]),
        );
        return [
          event.calendarId,
          [guessVirtualCalendar(event.calendarId, event.summary) ?? '', data],
        ] as const;
      }),
    ),
  );
  const knownIds = new Set(calendars.map(({ id }) => id));
  const unknownCalendarId = allDurations.find(
    ([calendarId]) => !knownIds.has(calendarId),
  );
  if (unknownCalendarId) {
    return `Incorrectly retrieved event calendar id as "${unknownCalendarId[0]}" (calendar by such ID does not exist). Known calendar IDs: ${formatDisjunction(Array.from(knownIds))}`;
  }

  return allDurations;
}

/** This is the maximum allowed by the API */
const maxResults = 2500;

export const blankHours = (): WritableDayHours => ({
  total: 0,
  // eslint-disable-next-line functional/prefer-readonly-type
  hourly: Array.from({ length: 24 }).fill(0) as number[],
});

async function fetchEvents(
  id: string,
  timeMin: Date,
  timeMax: Date,
  pageToken?: string,
): Promise<RA<CalendarEvent> | undefined> {
  const response = await ajax(
    formatUrl(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
        id,
      )}/events`,
      {
        maxAttendees: (1).toString(),
        maxResults: maxResults.toString(),
        timeMin: timeMin.toJSON(),
        timeMax: timeMax.toJSON(),
        prettyPrint: false.toString(),
        fields:
          'nextPageToken,items(summary,start(dateTime,date),end(dateTime,date))',
        singleEvents: true.toString(),
        ...(typeof pageToken === 'string' ? { pageToken } : {}),
      },
    ),
  ).catch((error) => {
    output.error(error);
    return undefined;
  });
  if (response === undefined) return undefined;
  const results = await response.json();
  const events = results.items as RA<CalendarEvent>;
  const nextPageToken = results.nextPageToken as string | undefined;

  if (typeof nextPageToken === 'string') {
    const newEvents = await fetchEvents(id, timeMin, timeMax, nextPageToken);
    return newEvents === undefined ? undefined : [...events, ...newEvents];
  }
  return events;
}

/**
 * Find the smallest continuous subset of time in the provided range for which
 * events haven't been fetched yet.
 * For example, if events are fetched for the first week of the month, and user
 * then switches to month view, this function will detect that we only need
 * to fetch events starting with the second week of the month.
 */
function calculateBounds(
  eventsStore: React.MutableRefObject<RawEventsStore>,
  id: string,
  startDate: Date,
  daysBetween: RA<string>,
): readonly [timeMin: Date, timeMax: Date] | undefined {
  const durations = eventsStore.current[id]?.[''];
  const firstDayToFetch =
    durations === undefined
      ? 0
      : daysBetween.findIndex((date) => typeof durations[date] !== 'object');
  const lastDayToFetch =
    durations === undefined
      ? daysBetween.length
      : findLastIndex(
          daysBetween,
          (date) => typeof durations[date] !== 'object',
        ) + 1;
  if (firstDayToFetch === -1) return undefined;
  const timeMin = new Date(startDate);
  timeMin.setDate(timeMin.getDate() + firstDayToFetch);
  const timeMax = new Date(startDate);
  timeMax.setDate(timeMax.getDate() + lastDayToFetch);
  return [timeMin, timeMax];
}

export const dateToString = (date: Date): string =>
  `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

/**
 * Return all dates in between two dates (inclusive) as strings
 */
export const getDateStringsBetween = (
  startDate: Date,
  endDate: Date,
): RA<string> => getDatesBetween(startDate, endDate).map(dateToString);

export const getDatesBetween = (startDate: Date, endDate: Date): RA<Date> =>
  Array.from(
    {
      length: countDaysBetween(startDate, endDate),
    },
    (_, index) => {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + index);
      return date;
    },
  );

/**
 * Count number of dates between two dates (inclusive)
 */
export const countDaysBetween = (startDate: Date, endDate: Date): number =>
  Math.round((endDate.getTime() - startDate.getTime()) / MILLISECONDS_IN_DAY) +
  // Count the next day, unless it is midnight
  (isMidnight(endDate) ? 0 : 1);

/**
 * Checks whether date corresponds to midnight in current time zone
 */
export const isMidnight = (date: Date): boolean =>
  date.getHours() === 0 && date.getMinutes() === 0 && date.getSeconds() === 0;

/**
 * Event date may be specified as a date or a datetime
 * Also, event may begin or end outside the bounds of current preview range
 */
function resolveEventDates(
  timeMin: Date,
  timeMax: Date,
  /**
   * Events may start/end in different time zones. Normalize all to be in the
   * local time zone and use that for charting purposes.
   */
  start: CalendarEvent['start'],
  end: CalendarEvent['end'],
): readonly [start: Date, end: Date] | undefined {
  // Date is defined instead of DateTime for all-day or multi-day events
  const unboundedStartDate =
    typeof start.dateTime === 'string'
      ? new Date(start.dateTime)
      : typeof start.date === 'string'
        ? dateToDateTime(start.date)
        : undefined;
  const unboundedEndDate =
    typeof end.dateTime === 'string'
      ? new Date(end.dateTime)
      : typeof end.date === 'string'
        ? dateToDateTime(end.date)
        : undefined;

  // Not sure if this case ever happens
  if (unboundedStartDate === undefined || unboundedEndDate === undefined)
    return undefined;

  // Multi-date events might begin/end outside of current preview range
  const boundedStartDate = new Date(
    Math.max(unboundedStartDate.getTime(), timeMin.getTime()),
  );
  const boundedEndDate = new Date(
    Math.min(unboundedEndDate.getTime(), timeMax.getTime()),
  );
  return [boundedStartDate, boundedEndDate];
}

/**
 * Convert date to dateTime (using midnight between the end of previous day and
 * the start of this date's date in the local time zone)
 */
export function dateToDateTime(dateString: string): Date {
  const date = new Date(dateString);
  date.setHours(24);
  return date;
}

function timeToDate(time: number, baseDate?: Date): Date {
  const date = baseDate ? new Date(baseDate) : new Date();
  date.setHours(Math.floor(time));
  date.setMinutes((time % 1) * 60);
  date.setSeconds(0);
  date.setMilliseconds(0);
  return date;
}

/**
 * Calculate number of minutes between two days, split into 1-hour chunks
 * Handles the case when both dates are on the same day or several days apart
 */
function calculateEventDuration(
  startDate: Date,
  endDate: Date,
): IR<RA<number>> {
  const results: R<WritableArray<number>> = {};
  const startDateString = dateToString(startDate);
  const endDateString = dateToString(endDate);
  const startHour = startDate.getHours();
  const endHour = endDate.getHours();
  const nearestHour = new Date(startDate);

  if (startDateString === endDateString && startHour === endHour) {
    results[startDateString] = [];
    results[startDateString][startHour] =
      endDate.getMinutes() - startDate.getMinutes();
    return results;
  }

  if (startDate.getMinutes() !== 0) {
    results[startDateString] = [];
    results[startDateString][startHour] =
      HOUR / MINUTE - startDate.getMinutes();
    nearestHour.setMinutes(0);
    nearestHour.setHours(nearestHour.getHours() + 1);
  }

  const lastHour = new Date(endDate);
  lastHour.setMinutes(0);

  const localDate = new Date(nearestHour);
  while (localDate < lastHour) {
    const dateString = dateToString(localDate);
    results[dateString] ??= [];
    results[dateString][localDate.getHours()] = HOUR / MINUTE;
    localDate.setHours(localDate.getHours() + 1);
  }

  if (endDate.getMinutes() > 0) {
    results[endDateString] ??= [];
    results[endDateString][endHour] = endDate.getMinutes();
  }

  return results;
}

type DurationsToAdd = RA<
  readonly [string, Readonly<Record<string, RA<number>>>]
>;

// FIXME: add test cases

// FIXME: remove intermediate representations to simplify code:
// wait for all calendars to fetch
// then update eventsStore for each calendar with fetched events for current period:
// nullify the old data
// for each day:
// - find all events that touch that day, and compute how lond they touch that day and what virtual calendar they belong to
function updateEventStore(
  daysBetween: RA<string>,
  calendarId: string,
  eventsStore: RawEventsStore,
  rawDurations: DurationsToAdd,
  reset: boolean,
) {
  const durations = group(rawDurations);

  /*
   * Need to initialize the cache entries, even if empty so that the
   * code can later detect that this region was already fetched.
   * Thus, need to be careful and only initialize the days for which
   * data was actually fetched
   */
  eventsStore[calendarId] ??= {};
  const calendarEvents = eventsStore[calendarId];
  const allVirtualCalendars = new Set([
    '',
    ...Object.keys(calendarEvents),
    ...durations.map(([virtualCalendar]) => virtualCalendar),
  ]);
  allVirtualCalendars.forEach((virtualCalendar) => {
    calendarEvents[virtualCalendar] ??= {};
    const fetched = calendarEvents[virtualCalendar];
    daysBetween.forEach((date) => {
      fetched[date] = (reset ? undefined : fetched[date]) ?? blankHours();
    });
  });

  durations.forEach(([virtualCalendar, daysDurations]) => {
    const calendarDurations = calendarEvents[virtualCalendar];
    daysDurations.forEach((daysDurations) =>
      Object.entries(daysDurations).forEach(([date, durations]) => {
        durations.forEach((duration, hour) => {
          calendarDurations[date].total += duration;
          calendarDurations[date].hourly[hour] = duration;
        });
      }),
    );
  });
}

/**
 * Extract data for the fetched date range for the visible calendars from the
 * events store
 */
function extractData(
  eventsStore: RawEventsStore,
  calendars: Exclude<React.ContextType<typeof CalendarsContext>, undefined>,
  startDate: Date,
  endDate: Date,
): EventsStore {
  const daysBetween = getDateStringsBetween(startDate, endDate);
  return Object.fromEntries(
    calendars.map(({ id }) => {
      const totals: R<WritableDayHours> = Object.fromEntries(
        daysBetween.map((date) => [date, blankHours()]),
      );
      // "eventsStore" won't have an entry for current calendar if fetching failed
      const entries = Object.entries(eventsStore?.[id] ?? {})
        .map(([virtualCalendar, dates]) => {
          let categoryTotal = 0;
          return [
            virtualCalendar,
            Object.fromEntries(
              daysBetween.map((date) => {
                const total = dates[date] ?? blankHours();
                totals[date].total += total.total;
                total.hourly.forEach((minutes, hour) => {
                  totals[date].hourly[hour] += minutes;
                });
                categoryTotal += total.total;
                return [date, total];
              }),
            ),
            categoryTotal,
          ] as const;
        })
        .sort(
          sortFunction(
            ([_label, _durations, categoryTotal]) => categoryTotal,
            true,
          ),
        );
      return [id, Object.fromEntries([...entries, [summedDurations, totals]])];
    }),
  );
}

export const exportsForTests = {
  calculateBounds,
  resolveEventDates,
  extractData,
  calculateEventDuration,
};
