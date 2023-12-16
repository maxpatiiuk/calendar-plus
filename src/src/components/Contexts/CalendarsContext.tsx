import React from 'react';

import { useAsyncState } from '../../hooks/useAsyncState';
import { storageDefinitions, useStorage } from '../../hooks/useStorage';
import { ajax } from '../../utils/ajax';
import { randomColor } from '../../utils/colors';
import { listen } from '../../utils/events';
import { formatUrl } from '../../utils/queryString';
import type { GetSet, RA } from '../../utils/types';
import { filterArray } from '../../utils/types';
import { debounce, sortFunction, split } from '../../utils/utils';
import { AuthContext } from './AuthContext';

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

function useVisibilityChangeSpy(
  calendars: React.ContextType<typeof CalendarsContext>,
  [visibleCalendars, setVisibleCalendars]: GetSet<RA<string> | undefined>,
): void {
  const sideBar = useSideBar();

  const visibleCalendarsRef = React.useRef(visibleCalendars);
  const cacheLoaded = Array.isArray(visibleCalendars);
  visibleCalendarsRef.current = visibleCalendars;

  /*
   * Detect calendars being loaded (initially the side bar contains just the
   * primary calendar)
   */
  React.useEffect(() => {
    if (sideBar === undefined || !cacheLoaded || calendars === undefined)
      return undefined;

    const getVisible = (): RA<string> =>
      filterArray(
        Array.from(
          sideBar.querySelectorAll<HTMLInputElement>('input[type="checkbox"]'),
          (checkbox) => parseCheckbox(calendars, checkbox),
        ),
      )
        .filter(([_calendarId, checked]) => checked)
        .map(([calendarId]) => calendarId);

    let timeOut: ReturnType<typeof setTimeout>;

    function handleChange(): void {
      clearTimeout(timeOut);
      setVisibleCalendars(getVisible());
    }

    // Get list of calendars loaded so far
    const visible = getVisible();
    /*
     * If side bar contains fewer elements than in the cache, it's likely
     * that side bar hasn't been fully loaded yet. Wait and try it again
     */
    if (visible.length < visibleCalendarsRef.current!.length)
      timeOut = setTimeout(handleChange, 2000);
    else handleChange();

    const observer = new MutationObserver(debounce(handleChange, 60));
    observer.observe(sideBar, { childList: true, subtree: true });
    return (): void => observer.disconnect();
  }, [sideBar, calendars, setVisibleCalendars, cacheLoaded]);

  React.useEffect(
    () =>
      sideBar === undefined || calendars === undefined
        ? undefined
        : listen(sideBar, 'click', ({ target }) => {
            const element = target as HTMLInputElement;
            if (element.tagName !== 'INPUT' || element.type !== 'checkbox')
              return;
            const data = parseCheckbox(calendars, element)?.[0];
            if (data === undefined) return;
            const [calendarId, checked] = data;
            setVisibleCalendars(
              checked
                ? visibleCalendarsRef.current?.filter((id) => id !== calendarId)
                : [...(visibleCalendarsRef.current ?? []), calendarId],
            );
          }),
    [sideBar, calendars, setVisibleCalendars],
  );
}

function useSideBar(): HTMLElement | undefined {
  const [sideBar, setSideBar] = React.useState<HTMLElement | undefined>(
    undefined,
  );

  React.useEffect(() => {
    awaitElement(findSideBar).then((sideBar) => {
      if (sideBar === undefined) {
        console.error('Unable to find the sidebar');
        return;
      }

      let resizeObserver: ResizeObserver;
      const checkCollapsed = () => {
        // If side bar is hidden, it has width of 0
        const isVisible = sideBar.offsetWidth > 0;
        if (isVisible) setSideBar(sideBar);
        else resizeObserver?.disconnect();
        return !isVisible;
      };

      if (!checkCollapsed()) return;
      console.log(
        'Calendar Plus: Sidebar is collapsed. Using cached visible calendars list',
      );
      resizeObserver = new ResizeObserver(checkCollapsed);
      resizeObserver.observe(sideBar);
    });
  }, []);

  return sideBar;
}

function findSideBar(): HTMLElement | undefined {
  const sideBar = document.querySelector('[role="complementary"]');
  return (sideBar?.querySelector('input[type="checkbox"]') ?? undefined) ===
    undefined
    ? undefined
    : (sideBar as HTMLElement) ?? undefined;
}

function parseCheckbox(
  calendars: RA<CalendarListEntry>,
  checkbox: HTMLInputElement,
): readonly [id: string, checked: boolean] | undefined {
  if (calendars === undefined) {
    console.log(
      'Calendar Plus: Unable to identify visible calendars before user signs in',
    );
    return undefined;
  }
  const calendarName = checkbox.ariaLabel;
  const calendar =
    calendars.find(({ summary }) => summary === calendarName) ??
    /*
     * Summary for the primary calendar does not match what is displayed
     * in the UI
     */
    calendars.find(({ primary }) => primary);
  if (calendar === undefined) {
    console.error('Unable to locate the calendar', calendarName);
    return undefined;
  }
  return [calendar.id, checkbox.checked];
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
