import React from 'react';

import { useAsyncState } from '../../hooks/useAsyncState';
import { ajax } from '../../utils/ajax';
import { formatUrl } from '../../utils/queryString';
import type { IR, R, RA, WritableArray } from '../../utils/types';
import { findLastIndex, group, sortFunction } from '../../utils/utils';
import {
  HOUR,
  MILLISECONDS_IN_DAY,
  MINUTE,
} from '../Atoms/Internationalization';
import { CalendarsContext } from '../Contexts/CalendarsContext';
import { ruleMatchers, useVirtualCalendars } from '../PowerTools/AutoComplete';
import { usePref } from '../Preferences/usePref';
import { AuthContext } from '../Contexts/AuthContext';

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

// TEST: test daylight savings time switch and back
/**
 * Fetch the events between the provided dates for all visible calendars,
 * calculate the total durations of all events in a given day for a given
 * calendar, and cache the computations for future use.
 */
export function useEvents(
  startDate: Date | undefined,
  endDate: Date | undefined,
): EventsStore | undefined {
  const eventsStore = React.useRef<RawEventsStore>({});
  // Clear temporary cache when overlay is closed
  const clearCache = startDate === undefined || endDate === undefined;
  if (clearCache) eventsStore.current = {};
  const calendars = React.useContext(CalendarsContext);

  const [ignoreAllDayEvents] = usePref('behavior', 'ignoreAllDayEvents');
  React.useEffect(() => {
    if (ignoreAllDayEvents) eventsStore.current = {};
  }, [ignoreAllDayEvents]);

  const virtualCalendars = useVirtualCalendars();
  const { token } = React.useContext(AuthContext);

  const [durations] = useAsyncState(
    React.useCallback(async () => {
      if (
        token === undefined ||
        eventsStore === undefined ||
        calendars === undefined ||
        startDate === undefined ||
        endDate === undefined
      )
        return undefined;
      await Promise.all(
        calendars.map(async ({ id }) => {
          const daysBetween = getDatesBetween(startDate, endDate);
          const bounds = calculateBounds(
            eventsStore,
            id,
            startDate,
            daysBetween,
          );
          if (bounds === undefined) return;
          const [timeMin, timeMax] = bounds;
          const events = await fetchEvents(id, timeMin, timeMax);
          if (events === undefined) return;

          const guessCalendar = (input: string): string | undefined =>
            virtualCalendars.find(
              ({ calendarId, rule, value }) =>
                calendarId === id && ruleMatchers[rule](input, value),
            )?.virtualCalendar;

          const durations = group(
            events.map(({ summary, start, end }) => {
              if (
                ignoreAllDayEvents &&
                // Event does not have start/end time
                (start.dateTime === undefined ||
                  end.dateTime === undefined ||
                  // Event lasts more than one day
                  start.dateTime.split('T')[0] !== end.dateTime.split('T')[0])
              )
                return ['', {}];
              const dates = resolveEventDates(timeMin, timeMax, start, end);
              if (dates === undefined) return ['', {}];
              const [startDate, endDate] = dates;
              const data = calculateEventDuration(startDate, endDate);
              return [guessCalendar(summary) ?? '', data] as const;
            }),
          );

          /*
           * Need to initialize the cache entries, even if empty so that the
           * code can later detect that this region was already fetched.
           * Thus, need to be careful and only initialize the days for which
           * data was actually fetched
           */
          eventsStore.current[id] ??= {};
          eventsStore.current[id][''] ??= {};
          const fetched = eventsStore.current[id][''];
          daysBetween.forEach((date) => {
            fetched[date] ??= blankHours();
          });

          durations.forEach(([virtualCalendar, durations]) => {
            eventsStore.current[id][virtualCalendar] ??= {};
            const calendarDurations = eventsStore.current[id][virtualCalendar];
            durations.forEach((durations) =>
              Object.entries(durations).forEach(([date, durations]) => {
                calendarDurations[date] ??= blankHours();
                durations.forEach((duration, hour) => {
                  calendarDurations[date].total += duration;
                  calendarDurations[date].hourly[hour] = duration;
                });
              }),
            );
          });
        }),
      );
      return extractData(eventsStore.current, calendars, startDate, endDate);
    }, [
      token,
      calendars,
      startDate,
      endDate,
      ignoreAllDayEvents,
      virtualCalendars,
    ]),
    false,
  );
  return durations;
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
    console.error(error);
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
export const getDatesBetween = (startDate: Date, endDate: Date): RA<string> =>
  Array.from(
    {
      length: countDaysBetween(startDate, endDate),
    },
    (_, index) => {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + index);
      return dateToString(date);
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
  start: CalendarEvent['start'],
  end: CalendarEvent['end'],
): readonly [start: Date, end: Date] | undefined {
  // Date is defined instead of DateTime for multi-day events
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

  if (unboundedStartDate === undefined || unboundedEndDate === undefined)
    return undefined;

  // Multi-date events might begin/end outside of current preview range
  const startDate = new Date(
    Math.max(unboundedStartDate.getTime(), timeMin.getTime()),
  );
  const endDate = new Date(
    Math.min(unboundedEndDate.getTime(), timeMax.getTime()),
  );
  return [startDate, endDate];
}

/**
 * Convert date to dateTime (using midnight in current time zone)
 */
export function dateToDateTime(dateString: string): Date {
  const date = new Date(dateString);
  // FEATURE: time zone support (use calendar time zone)
  date.setHours(24);
  return date;
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
  const daysBetween = getDatesBetween(startDate, endDate);
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

export const exportsForTests = {
  calculateBounds,
  resolveEventDates,
  extractData,
  calculateEventDuration,
};
