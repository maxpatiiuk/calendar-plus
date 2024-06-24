import React from 'react';
import { listen } from '../../utils/events';
import { GetSet, RA, isDefined } from '../../utils/types';
import { debounce } from '../../utils/utils';
import {
  CalendarsContext,
  awaitElement,
  CalendarListEntry,
} from './CalendarsContext';
import { output } from '../Errors/exceptions';
import { SECOND } from '../Atoms/Internationalization';

export function useVisibilityChangeSpy(
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
      Array.from(
        sideBar.querySelectorAll<HTMLInputElement>('input[type="checkbox"]'),
        (checkbox) => parseCheckbox(calendars, checkbox),
      )
        .filter(isDefined)
        .filter(([_calendarId, checked]) => checked)
        .map(([calendarId]) => calendarId);

    let timeOut: ReturnType<typeof setTimeout>;

    function handleChange(): void {
      clearTimeout(timeOut);
      const newVisible = getVisible();
      const isDifferent =
        newVisible.join(',') !== visibleCalendarsRef.current?.join(',');
      if (isDifferent) setVisibleCalendars(newVisible);
    }

    // Get list of calendars loaded so far
    const visible = getVisible();
    /*
     * If side bar contains fewer elements than in the cache, it's likely
     * that side bar hasn't been fully loaded yet. Wait and try it again
     */
    if (visible.length < visibleCalendarsRef.current!.length)
      timeOut = setTimeout(handleChange, 2 * SECOND);
    else handleChange();

    const observer = new MutationObserver(debounce(handleChange, 60));
    observer.observe(sideBar, { childList: true, subtree: true });
    return (): void => observer.disconnect();
  }, [sideBar, calendars, setVisibleCalendars, cacheLoaded]);

  React.useEffect(
    () =>
      sideBar === undefined || calendars === undefined
        ? undefined
        : listen(
            sideBar,
            'change',
            ({ target }) => {
              const element = target as HTMLInputElement;
              if (element.tagName !== 'INPUT' || element.type !== 'checkbox')
                return;
              const data = parseCheckbox(calendars, element);
              if (data === undefined) return;
              const [calendarId, isNowChecked] = data;
              setVisibleCalendars(
                isNowChecked
                  ? [...(visibleCalendarsRef.current ?? []), calendarId]
                  : visibleCalendarsRef.current?.filter(
                      (id) => id !== calendarId,
                    ),
              );
            },
            { passive: true },
          ),
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
        output.error('Unable to find the sidebar');
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
      output.log(
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
    output.log(
      'Calendar Plus: Unable to identify visible calendars before user signs in',
    );
    return undefined;
  }
  const calendarName = checkbox.ariaLabel;
  /**
   * Note, the "Birthdays" calendar summary can differ between languages, but
   * fortunately, Google's API endpoint accounts for that, so we don't have to
   */
  const calendar =
    calendars.find(({ summary }) => summary === calendarName) ??
    /*
     * Summary for the primary calendar does not match what is displayed
     * in the UI
     */
    (isFirstCalendar(checkbox)
      ? calendars.find(({ primary }) => primary)
      : undefined);

  return calendar === undefined ? undefined : [calendar.id, checkbox.checked];
}

const isFirstCalendar = (child: HTMLElement): boolean =>
  child.closest('li[aria-posinset="1"]') !== null;
