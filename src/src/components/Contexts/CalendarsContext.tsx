import React from 'react';

import { useAsyncState } from '../../hooks/useAsyncState';
import { storageDefinitions, useStorage } from '../../hooks/useStorage';
import { ajax } from '../../utils/ajax';
import { randomColor } from '../../utils/colors';
import { formatUrl } from '../../utils/queryString';
import type { RA } from '../../utils/types';
import { sortFunction, split } from '../../utils/utils';
import { AuthContext } from './AuthContext';
import { useVisibilityChangeSpy } from './useVisibilityChangeSpy';

/**
 * Holds a list of user's calendars. If user changed visibility of some calendar,
 * this array is updated
 */
export const CalendarsContext = React.createContext<
  RA<CalendarListEntry> | undefined
>(undefined);
CalendarsContext.displayName = 'CalendarsContext';

type RawCalendarListEntry = Pick<
  gapi.client.calendar.CalendarListEntry,
  'backgroundColor' | 'id' | 'primary' | 'summary'
>;

export type CalendarListEntry = RawCalendarListEntry & {
  readonly backgroundColor: string;
};

export function CalendarsSpy({
  children,
}: {
  readonly children: React.ReactNode;
}): JSX.Element {
  /*
   * Cache the list of visible calendars so that we can use it if side menu
   * is collapsed
   */
  const [visibleCalendars, setVisibleCalendars] =
    useStorage('visibleCalendars');

  const isCacheEmpty =
    visibleCalendars === storageDefinitions.visibleCalendars.defaultValue;

  const { token } = React.useContext(AuthContext);
  const isAuthenticated = typeof token === 'string';
  const [calendars] = useAsyncState<RA<CalendarListEntry>>(
    React.useCallback(async () => {
      if (!isAuthenticated) return undefined;
      const response = await ajax(
        formatUrl(
          'https://www.googleapis.com/calendar/v3/users/me/calendarList',
          {
            minAccessRole: 'reader',
            fields: 'items(id,summary,primary,backgroundColor)',
            prettyPrint: false.toString(),
          },
        ),
      ).catch((error) => {
        console.error(error);
        return undefined;
      });
      if (response === undefined) return undefined;
      const results = await response.json();
      const rawCalendars = results.items as RA<RawCalendarListEntry>;
      const calendars = rawCalendars.map((calendar) => ({
        ...calendar,
        backgroundColor: calendar.backgroundColor ?? randomColor(),
      }));
      const [secondary, primary] = split(
        calendars,
        ({ primary }) => primary === true,
      ).map((calendars) =>
        Array.from(calendars).sort(sortFunction(({ summary }) => summary)),
      );
      return [...primary, ...secondary];
    }, [isAuthenticated]),
    false,
  );

  /*
   * If it's first time opening the extension, and the side bar is hidden,
   * don't know which calendars are hidden so show all of them
   */
  React.useEffect(() => {
    if (isCacheEmpty && Array.isArray(calendars))
      setVisibleCalendars(calendars.map(({ id }) => id));
  }, [isCacheEmpty, calendars, setVisibleCalendars]);

  useVisibilityChangeSpy(calendars, [visibleCalendars, setVisibleCalendars]);

  const filteredCalendars = React.useMemo(
    () => calendars?.filter(({ id }) => visibleCalendars?.includes(id)),
    [calendars, visibleCalendars],
  );
  return (
    <CalendarsContext.Provider
      value={isCacheEmpty ? calendars : filteredCalendars}
    >
      {children}
    </CalendarsContext.Provider>
  );
}

/**
 * Poll regularly until a desired element has been added to the DOM
 */
export async function awaitElement<T>(
  callback: () => T | undefined,
  pollInterval = 50,
  limit = 100,
): Promise<T | undefined> {
  const result = callback();
  if (result !== undefined) return result;
  if (limit <= 0) return undefined;
  return new Promise((resolve) =>
    setTimeout(
      () => resolve(awaitElement(callback, pollInterval, limit - 1)),
      pollInterval,
    ),
  );
}
