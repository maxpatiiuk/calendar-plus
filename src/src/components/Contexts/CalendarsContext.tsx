import { useAsyncState } from '../../hooks/useAsyncState';
import { ajax } from '../../utils/ajax';
import React from 'react';
import { GetOrSet, RA } from '../../utils/types';
import { formatUrl } from '../../utils/queryString';
import { sortFunction, split, toggleItem } from '../../utils/utils';
import { listen } from '../../utils/events';
import { AuthContext } from './AuthContext';

type CalendarListEntry = Pick<
  gapi.client.calendar.CalendarListEntry,
  'id' | 'summary' | 'hidden' | 'primary'
>;

const calendarIdResolver: Set<string> = new Set();

export function CalendarsSpy({
  children,
}: {
  readonly children: React.ReactNode;
}): JSX.Element {
  const { authenticated } = React.useContext(AuthContext);
  const [calendars] = useAsyncState<
    RA<CalendarListEntry & { readonly shortId: number }>
  >(
    React.useCallback(async () => {
      if (!authenticated) return undefined;
      const response = await ajax(
        formatUrl(
          'https://www.googleapis.com/calendar/v3/users/me/calendarList',
          {
            minAccessRole: 'reader',
            showHidden: true.toString(),
            fields: 'items(id,summary,hidden,primary)',
          }
        )
      );
      const results = await response.json();
      const rawCalendars = results.items as RA<CalendarListEntry>;
      const calendars = rawCalendars.map((calendar) => {
        calendarIdResolver.add(calendar.id);
        const shortId = Array.from(calendarIdResolver).indexOf(calendar.id);
        return { ...calendar, shortId };
      });
      const [secondary, primary] = split(
        calendars,
        ({ primary }) => primary === true
      ).map((calendars) =>
        Array.from(calendars).sort(sortFunction(({ summary }) => summary))
      );
      return [...primary, ...secondary];
    }, [authenticated]),
    false
  );

  const [visibleCalendars, setVisibleCalendars] = React.useState<RA<string>>(
    []
  );

  React.useEffect(
    () =>
      setVisibleCalendars(
        calendars?.filter(({ hidden }) => !hidden).map(({ id }) => id) ?? []
      ),
    [calendars]
  );

  useVisibilityChangeSpy(calendars, setVisibleCalendars);

  const filteredCalendars = React.useMemo(
    () =>
      calendars?.filter(
        Array.isArray(visibleCalendars)
          ? ({ id }) => visibleCalendars.includes(id)
          : ({ hidden }) => !hidden
      ),
    [calendars, visibleCalendars]
  );
  return (
    <CalendarsContext.Provider value={filteredCalendars}>
      {children}
    </CalendarsContext.Provider>
  );
}

export const CalendarsContext = React.createContext<
  RA<CalendarListEntry & { readonly shortId: number }> | undefined
>(undefined);
CalendarsContext.displayName = 'CalendarsContext';

function useVisibilityChangeSpy(
  calendars: RA<CalendarListEntry> | undefined,
  handleChange: GetOrSet<RA<string>>[1]
): void {
  React.useEffect(() => {
    if (calendars === undefined) return;
    const sideBar = document.querySelector('[role="complementary"]');
    if (sideBar === null) {
      console.error('Unable to locate the sidebar');
      return;
    }
    return listen(sideBar, 'click', ({ target }) => {
      const element = target as HTMLInputElement;
      if (element.tagName !== 'INPUT' || element.type !== 'checkbox') return;
      const calendarName = element.ariaLabel;
      const calendar =
        calendars.find(({ summary }) => summary === calendarName) ??
        /*
         * Summary for the primary calendar does not match what is displayed
         * in the UI
         */
        calendars.find(({ primary }) => primary);
      if (calendar === undefined) {
        console.error('Unable to locate the calendar', calendarName);
        return;
      }
      handleChange((visibleCalendars) =>
        toggleItem(visibleCalendars, calendar.id)
      );
    });
  }, [calendars]);
}
