import React from 'react';

import { useAsyncState } from '../../hooks/useAsyncState';
import { ajax } from '../../utils/ajax';
import { eventListener } from '../../utils/events';
import { formatUrl } from '../../utils/queryString';
import type { IR, R, RA, WritableArray } from '../../utils/types';
import { findLastIndex, group } from '../../utils/utils';
import {
  DAY,
  MILLISECONDS_IN_DAY,
  MINUTE,
  MINUTES_IN_DAY,
} from '../Atoms/Internationalization';
import { CalendarsContext } from '../Contexts/CalendarsContext';
import { ruleMatchers, useVirtualCalendars } from '../PowerTools/AutoComplete';
import { usePref } from '../Preferences/usePref';

export const summedDurations: unique symbol = Symbol('calendarTotal');

/**
 * This is stored in cache
 * The data structure is optimized for storage efficiency
 */
// eslint-disable-next-line functional/prefer-readonly-type
export type RawEventsStore = {
  // eslint-disable-next-line functional/prefer-readonly-type
  [CALENDAR_ID in string]: {
    // eslint-disable-next-line functional/prefer-readonly-type
    [VIRTUAL_CALENDAR in string]: {
      [YEAR in number]?: WritableArray<
        WritableArray<number | null | undefined> | null | undefined
      >;
    };
  };
};
/*
 * This is used by charts when plotting
 * The data structure is optimized for ease of use
 */
export type EventsStore = {
  readonly [CALENDAR_ID in string]: {
    readonly [VIRTUAL_CALENDAR in string]: IR<number>;
  } & {
    readonly [summedDurations]: IR<number>;
  };
};
type CalendarEvent = Pick<
  gapi.client.calendar.Event,
  'end' | 'start' | 'summary'
>;

export const cacheEvents = eventListener<{ readonly changed: undefined }>();

// TEST: test daylight savings time switch and back
/**
 * Fetch the events between the provided dates for all visible calendars,
 * calculate the total durations of all events in a given day for a given
 * calendar, and cache the computations for future use.
 */
export function useEvents(
  eventsStore: React.MutableRefObject<RawEventsStore> | undefined,
  startDate: Date | undefined,
  endDate: Date | undefined
): EventsStore | undefined {
  const calendars = React.useContext(CalendarsContext);

  const [ignoreAllDayEvents] = usePref('behavior', 'ignoreAllDayEvents');
  const previousPrefRef = React.useRef(ignoreAllDayEvents);

  const virtualCalendars = useVirtualCalendars();

  const [durations] = useAsyncState(
    React.useCallback(async () => {
      if (
        eventsStore === undefined ||
        calendars === undefined ||
        startDate === undefined ||
        endDate === undefined
      )
        return undefined;
      if (ignoreAllDayEvents !== previousPrefRef.current) {
        previousPrefRef.current = ignoreAllDayEvents;
        eventsStore.current = {};
        cacheEvents.trigger('changed');
      }
      await Promise.all(
        calendars.map(async ({ id }) => {
          const daysBetween = getDatesBetween(startDate, endDate);
          const bounds = calculateBounds(
            eventsStore,
            id,
            startDate,
            daysBetween
          );
          if (bounds === undefined) return;
          const [timeMin, timeMax] = bounds;
          const response = await ajax(
            formatUrl(
              `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
                id
              )}/events`,
              {
                maxAttendees: (1).toString(),
                // FEATURE: handle pagination (pageToken)
                maxResults: (2500).toString(),
                timeMin: timeMin.toJSON(),
                timeMax: timeMax.toJSON(),
                prettyPrint: false.toString(),
                fields:
                  'items(summary,start(dateTime,date),end(dateTime,date))',
                // FEATURE: set this to True to reduce response size
                singleEvents: true.toString(),
              }
            )
          );
          const results = await response.json();

          const guessCalendar = (input: string): string | undefined =>
            virtualCalendars.find(
              ({ calendarId, rule, value }) =>
                calendarId === id && ruleMatchers[rule](input, value)
            )?.virtualCalendar;

          const events = results.items as RA<CalendarEvent>;
          const durations = group(
            events.map(({ summary, start, end }) => {
              if (
                ignoreAllDayEvents &&
                (start.dateTime === undefined || end.dateTime === undefined)
              )
                return ['', []];
              const dates = resolveEventDates(timeMin, timeMax, start, end);
              if (dates === undefined) return ['', []];
              const [startDate, endDate] = dates;
              const data = calculateEventDuration(startDate, endDate);
              return [guessCalendar(summary) ?? '', data] as const;
            })
          );

          eventsStore.current[id] ??= {};
          durations.map(([virtualCalendar, durations]) => {
            eventsStore.current[id][virtualCalendar] ??= {};
            const years = eventsStore.current[id][virtualCalendar];
            durations.flat().forEach(([{ year, month, day }, duration]) => {
              years[year] ??= [];
              const months = years[year]!;
              const monthsToAdd = month - months.length + 1;
              for (let i = 0; i < monthsToAdd; i++) months.push([]);
              const days = months[month]!;
              const daysToAdd = day - days.length + 1;
              for (let i = 0; i < daysToAdd; i++) days.push(0);
              days[day]! += duration;
            });
          });
        })
      );
      cacheEvents.trigger('changed');
      return extractData(eventsStore.current, calendars, startDate, endDate);
    }, [
      eventsStore,
      calendars,
      startDate,
      endDate,
      ignoreAllDayEvents,
      virtualCalendars,
    ]),
    false
  );
  return durations;
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
  daysBetween: RA<SplitDate>
): readonly [timeMin: Date, timeMax: Date] | undefined {
  const durations = Object.values(eventsStore.current[id] ?? []);
  const firstDayToFetch =
    durations.length === 0
      ? 0
      : daysBetween.findIndex(({ month, year, day }) =>
          durations.some(
            (virtualCalendar) =>
              typeof virtualCalendar[year]?.[month]?.[day] !== 'number'
          )
        );
  const lastDayToFetch =
    durations.length === 0
      ? daysBetween.length
      : findLastIndex(daysBetween, ({ month, year, day }) =>
          durations.some(
            (virtualCalendar) =>
              typeof virtualCalendar[year]?.[month]?.[day] !== 'number'
          )
        ) + 1;
  if (firstDayToFetch === -1) return undefined;
  const timeMin = new Date(startDate);
  timeMin.setDate(timeMin.getDate() + firstDayToFetch);
  const timeMax = new Date(startDate);
  timeMax.setDate(timeMax.getDate() + lastDayToFetch);
  return [timeMin, timeMax];
}

export type SplitDate = {
  readonly year: number;
  // Note, month numbering is 0 based
  readonly month: number;
  readonly day: number;
};

export const splitDate = (date: Date): SplitDate => ({
  year: date.getFullYear(),
  // Note, month numbering is 0 based
  month: date.getMonth(),
  day: date.getDate(),
});

export const dateToString = (date: Date): string =>
  `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

export const splitDateToString = ({ year, month, day }: SplitDate): string =>
  `${year}-${month + 1}-${day}`;

/**
 * Return all dates in between two dates (inclusive) as strings
 */
export const getDatesBetween = (
  startDate: Date,
  endDate: Date
): RA<SplitDate> =>
  Array.from(
    {
      length: countDaysBetween(startDate, endDate),
    },
    (_, index) => {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + index);
      return splitDate(date);
    }
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
  end: CalendarEvent['end']
): readonly [start: Date, end: Date] | undefined {
  // Date is defined instead of DateTime for multi-day events
  const unboundedStartDate =
    typeof start.dateTime === 'string'
      ? new Date(start.dateTime)
      : typeof start.date === 'string'
      ? dateToDateTime(start.date, 'startDate')
      : undefined;
  const unboundedEndDate =
    typeof end.dateTime === 'string'
      ? new Date(end.dateTime)
      : typeof end.date === 'string'
      ? dateToDateTime(end.date, 'endDate')
      : undefined;

  if (unboundedStartDate === undefined || unboundedEndDate === undefined)
    return undefined;

  // Multi-date events might begin/end outside of current preview range
  const startDate = new Date(
    Math.max(unboundedStartDate.getTime(), timeMin.getTime())
  );
  const endDate = new Date(
    Math.min(unboundedEndDate.getTime(), timeMax.getTime())
  );
  return [startDate, endDate];
}

/**
 * Convert date to dateTime (using midnight in current time zone)
 */
export function dateToDateTime(
  dateString: string,
  type: 'endDate' | 'startDate'
): Date {
  const date = new Date(dateString);
  if (type === 'endDate') date.setDate(date.getDate() + 1);
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
  endDate: Date
): EventsStore {
  const daysBetween = getDatesBetween(startDate, endDate).map((components) => ({
    ...components,
    string: splitDateToString(components),
  }));
  return Object.fromEntries(
    calendars.map(({ id }) => {
      const totals: R<number> = Object.fromEntries(
        daysBetween.map(({ string }) => [string, 0])
      );
      const entries = Object.entries(eventsStore[id]).map(
        ([virtualCalendar, dates]) => [
          virtualCalendar,
          Object.fromEntries(
            daysBetween.map((date) => {
              const string = splitDateToString(date);
              const total = dates[date.year]?.[date.month]?.[date.day] ?? 0;
              totals[string] += total;
              return [string, total];
            })
          ),
        ]
      );
      return [id, Object.fromEntries([...entries, [summedDurations, totals]])];
    })
  );
}

/**
 * Calculate number of minutes between two days, split into 24-hour chunks
 * Handles the case when both dates are on the same day
 */
function calculateEventDuration(
  startDate: Date,
  endDate: Date
): RA<readonly [SplitDate, number]> {
  const daySpan = countDaysBetween(startDate, endDate);
  if (Number.isNaN(daySpan)) [];

  if (daySpan === 1) {
    const duration = (endDate.getTime() - startDate.getTime()) / MINUTE;
    return [[splitDate(startDate), duration]] as const;
  } else return calculateInBetweenDurations(startDate, endDate);
}

/**
 * Calculate number of minutes between two dates, split into 24-hour chunks
 * Expects endDate to not be on the same day as startDate
 */
function calculateInBetweenDurations(
  startDate: Date,
  endDate: Date
): RA<readonly [SplitDate, number]> {
  const results: WritableArray<readonly [SplitDate, number]> = [];

  // First Day
  const firstDayStart = new Date(startDate);
  firstDayStart.setHours(0);
  firstDayStart.setMinutes(0);
  firstDayStart.setSeconds(0);
  const firstDayDuration =
    (DAY - (startDate.getTime() - firstDayStart.getTime())) / MINUTE;
  results.push([splitDate(startDate), firstDayDuration]);

  // Full days
  const datesBetween = getDatesBetween(startDate, endDate).slice(
    1,
    isMidnight(endDate) ? undefined : -1
  );
  datesBetween.forEach((dateString) =>
    results.push([dateString, MINUTES_IN_DAY])
  );

  // Last Day
  const lastDayStart = new Date(endDate);
  lastDayStart.setHours(0);
  lastDayStart.setMinutes(0);
  lastDayStart.setSeconds(0);
  const lastDayDuration = (endDate.getTime() - lastDayStart.getTime()) / MINUTE;
  if (lastDayDuration !== 0)
    results.push([splitDate(endDate), lastDayDuration]);
  return results;
}

export const exportsForTests = {
  calculateBounds,
  resolveEventDates,
  extractData,
  calculateEventDuration,
  calculateInBetweenDurations,
};
