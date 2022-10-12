import { useAsyncState } from '../../hooks/useAsyncState';
import { ajax } from '../../utils/ajax';
import React from 'react';
import { CalendarsContext } from '../Contexts/CalendarsContext';
import { formatUrl } from '../../utils/queryString';
import { R, RA, WritableArray } from '../../utils/types';
import { findLastIndex } from '../../utils/utils';
import {
  DAY,
  MILLISECONDS_IN_DAY,
  MINUTE,
  MINUTES_IN_DAY,
} from '../Atoms/Internationalization';

export type EventsStore = R<Record<number, number>>;
type CalendarEvent = Pick<gapi.client.calendar.Event, 'start' | 'end'>;

// TEST: test daylight savings time switch and back
/**
 * Fetch the events between the provided dates for all visible calendars,
 * calculate the total durations of all events in a given day for a given
 * calendar, and cache the computations for future use.
 */
export function useEvents(
  eventsStore: React.MutableRefObject<EventsStore>,
  startDate: Date | undefined,
  endDate: Date | undefined
): EventsStore | undefined {
  const calendars = React.useContext(CalendarsContext);
  const [loaded] = useAsyncState(
    React.useCallback(async () => {
      if (
        calendars === undefined ||
        startDate === undefined ||
        endDate === undefined
      )
        return undefined;
      await Promise.all(
        calendars.map(async ({ shortId, id }) => {
          const daysBetween = getDatesBetween(startDate, endDate);
          const bounds = calculateBounds(
            eventsStore,
            shortId,
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
                fields: 'items(start(dateTime,date),end(dateTime,date))',
                // FEATURE: set this to True to reduce response size
                singleEvents: true.toString(),
              }
            )
          );
          const results = await response.json();
          const events = results.items as RA<CalendarEvent>;
          const durations = events.flatMap(({ start, end }) => {
            const dates = resolveEventDates(timeMin, timeMax, start, end);
            if (dates === undefined) return [];
            const [startDate, endDate] = dates;
            return calculateEventDuration(startDate, endDate);
          });

          daysBetween.forEach((dateString) =>
            calendars.forEach(({ shortId }) => {
              eventsStore.current[dateString] ??= {};
              eventsStore.current[dateString][shortId] ??= 0;
            })
          );
          durations.forEach(([dateString, duration]) => {
            eventsStore.current[dateString][shortId] += duration;
          });
        })
      );
      return true;
    }, [calendars, startDate, endDate]),
    false
  );

  return React.useMemo(
    () =>
      loaded === true &&
      typeof calendars === 'object' &&
      typeof startDate === 'object' &&
      typeof endDate === 'object'
        ? extractData(eventsStore.current, calendars, startDate, endDate)
        : undefined,
    [loaded, calendars, startDate, endDate]
  );
}

export function useCachedEvents(): EventsStore | undefined {
  const cachedEventsStr = window.localStorage.getItem('events');
  if (!cachedEventsStr) return undefined;
  const cachedEvents = JSON.parse(cachedEventsStr) as EventsStore;
  if (!cachedEvents) return undefined;
  return cachedEvents;
}

export function setCachedEvents(events: EventsStore): void {
  window.localStorage.setItem('events', JSON.stringify(events));
}

/**
 * Find the smallest continuous subset of time in the provided range for which
 * events haven't been fetched yet.
 * For example, if events are fetched for the first week of the month, and user
 * then switches to month view, this function will detect that we only need
 * to fetch events starting with the second week of the month.
 */
function calculateBounds(
  eventsStore: React.MutableRefObject<EventsStore>,
  shortId: number,
  startDate: Date,
  daysBetween: RA<string>
): [timeMin: Date, timeMax: Date] | undefined {
  const firstDayToFetch = daysBetween.findIndex(
    (day) => eventsStore.current[day]?.[shortId] === undefined
  );
  const lastDayToFetch =
    findLastIndex(
      daysBetween,
      (day) => eventsStore.current[day]?.[shortId] === undefined
    ) + 1;
  if (firstDayToFetch === -1) return undefined;
  const timeMin = new Date(startDate);
  timeMin.setDate(timeMin.getDate() + firstDayToFetch);
  const timeMax = new Date(startDate);
  timeMax.setDate(timeMax.getDate() + lastDayToFetch);
  return [timeMin, timeMax];
}

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
    }
  );

export const dateToString = (date: Date): string =>
  `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

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
) {
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
  type: 'startDate' | 'endDate'
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
  eventsStore: EventsStore,
  calendars: Exclude<React.ContextType<typeof CalendarsContext>, undefined>,
  startDate: Date,
  endDate: Date
): EventsStore {
  const daysBetween = getDatesBetween(startDate, endDate);
  return Object.fromEntries(
    daysBetween.map((day) => [
      day,
      Object.fromEntries(
        calendars.map(({ shortId }) => [
          shortId,
          eventsStore[day]?.[shortId] ?? 0,
        ])
      ),
    ])
  );
}

/**
 * Calculate number of minutes between two days, split into 24-hour chunks
 * Handles the case when both dates are on the same day
 */
function calculateEventDuration(startDate: Date, endDate: Date) {
  const daySpan = countDaysBetween(startDate, endDate);
  if (Number.isNaN(daySpan)) [];

  if (daySpan === 1) {
    const duration = (endDate.getTime() - startDate.getTime()) / MINUTE;
    return [[dateToString(startDate), duration]] as const;
  } else return calculateInBetweenDurations(startDate, endDate);
}

/**
 * Calculate number of minutes between two dates, split into 24-hour chunks
 * Expects endDate to not be on the same day as startDate
 */
function calculateInBetweenDurations(
  startDate: Date,
  endDate: Date
): RA<readonly [string, number]> {
  const results: WritableArray<readonly [string, number]> = [];

  // First Day
  const firstDayStart = new Date(startDate);
  firstDayStart.setHours(0);
  firstDayStart.setMinutes(0);
  firstDayStart.setSeconds(0);
  const firstDayDuration =
    (DAY - (startDate.getTime() - firstDayStart.getTime())) / MINUTE;
  results.push([dateToString(startDate), firstDayDuration]);

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
    results.push([dateToString(endDate), lastDayDuration]);
  return results;
}

export const exportsForTests = {
  calculateBounds,
  resolveEventDates,
  extractData,
  calculateEventDuration,
  calculateInBetweenDurations,
};
