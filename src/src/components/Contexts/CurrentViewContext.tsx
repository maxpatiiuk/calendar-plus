import React from 'react';

import { useStorage } from '../../hooks/useStorage';
import { f } from '../../utils/functools';
import type { GetOrSet, GetSet } from '../../utils/types';
import { listenEvent } from '../Background/messages';
import { awaitElement } from './CalendarsContext';
import { SettingsContext } from './SettingsContext';
import { output } from '../Errors/exceptions';

/**
 * Keep track of what week/month/year is currently displayed
 */
export const CurrentViewContext = React.createContext<CurrentView | undefined>(
  undefined,
);
CurrentViewContext.displayName = 'LoadingContext';

const supportedViews = [
  'day',
  'week',
  'month',
  'year',
  /**
   * custom views are user-customizable view (they can change the number of days
   * to display)
   */
  'customday',
  'customweek',
] as const;

/**
 * Google Calendar is not always consistent it how it calls these views
 */
const viewMapper = {
  custom_days: 'customday',
  custom_weeks: 'customweek',
} as const;

export type SupportedView = (typeof supportedViews)[number];

export type CurrentView = {
  readonly view: SupportedView;
  readonly selectedDay: Date;
  readonly firstDay: Date;
  readonly lastDay: Date;
};

export function TrackCurrentView({
  children,
}: {
  readonly children: React.ReactNode;
}): JSX.Element {
  const [currentView, setCurrentView] = React.useState<CurrentView | undefined>(
    undefined,
  );

  useCurrentTracker(setCurrentView);

  return (
    <CurrentViewContext.Provider value={currentView}>
      {children}
    </CurrentViewContext.Provider>
  );
}

export const defaultCustomViewSize = 4;

/**
 * Listen for changes to current URL
 */
function useCurrentTracker(
  setCurrentView: GetOrSet<CurrentView | undefined>[1],
) {
  const [customViewSize = defaultCustomViewSize, setCustomViewSize] =
    useStorage('customViewSize');

  const { weekStart } = React.useContext(SettingsContext);

  React.useEffect(() => {
    let lastPath = '';

    function parseUrl(): void {
      const parsed = parsePath(
        window.location.pathname,
        customViewSize,
        weekStart,
      );
      setCurrentView((currentView) =>
        currentView?.view === parsed?.view &&
        currentView?.selectedDay?.getDate() ===
          parsed?.selectedDay?.getDate() &&
        currentView?.firstDay?.getDate() === parsed?.firstDay?.getDate() &&
        currentView?.lastDay?.getDate() === parsed?.lastDay?.getDate()
          ? currentView
          : parsed,
      );
      if (parsed?.view === 'customday' || parsed?.view === 'customweek')
        detectCustomViewSize([customViewSize, setCustomViewSize]).catch(
          output.error,
        );
    }

    // Parse initial URL
    parseUrl();

    return listenEvent('TabUpdate', () => {
      if (window.location.pathname === lastPath) return;
      lastPath = window.location.pathname;
      parseUrl();
    });
  }, [weekStart, setCurrentView, customViewSize, setCustomViewSize]);
}

const commonPrefix = `/calendar/u/0/r/`;

/**
 * Extract current date from the Google Calendar URL
 */
function parsePath(
  path: string,
  customViewSize: number,
  weekStart: number,
): CurrentView | undefined {
  // If URL contains no date, then view is centered around today
  const today = new Date();

  /*
   * Unless you changed view or when to a different week, URL does not contain
   * the view mode or date
   */
  if (path === commonPrefix || path === commonPrefix.slice(0, -1)) {
    const viewMode = document.querySelector('header div[data-active-view]');
    const rawViewName = viewMode?.getAttribute('data-active-view') ?? '';
    const viewName =
      rawViewName in viewMapper
        ? viewMapper[rawViewName as keyof typeof viewMapper]
        : rawViewName;
    if (f.includes(supportedViews, viewName))
      return {
        view: viewName,
        selectedDay: today,
        ...resolveBoundaries(viewName, today, customViewSize, weekStart),
      };
  }

  // If URl doesn't start with commonPrefix, we might be on the preferences page
  if (!path.startsWith(commonPrefix)) return undefined;

  const [viewName, ...date] = path.slice(commonPrefix.length).split('/');
  if (!f.includes(supportedViews, viewName)) return undefined;

  const year = date[0] || today.getFullYear().toString();
  const month = date[1] || (today.getMonth() + 1).toString();
  const day = date[2] || today.getDate().toString();
  const selectedDay = new Date(
    Number.parseInt(year),
    // Month is 0-based
    Number.parseInt(month) - 1,
    Number.parseInt(day),
  );
  return {
    view: viewName,
    selectedDay,
    ...resolveBoundaries(viewName, selectedDay, customViewSize, weekStart),
  };
}

function resolveBoundaries(
  viewName: SupportedView,
  selectedDay: Date,
  customViewSize: number,
  weekStart: number,
): { readonly firstDay: Date; readonly lastDay: Date } {
  if (viewName === 'day')
    return {
      firstDay: new Date(
        selectedDay.getFullYear(),
        selectedDay.getMonth(),
        selectedDay.getDate(),
      ),
      lastDay: new Date(
        selectedDay.getFullYear(),
        selectedDay.getMonth(),
        selectedDay.getDate() + 1,
      ),
    };
  else if (viewName === 'week') {
    const dayOfWeek = selectedDay.getDay();
    const offset = dayOfWeek < weekStart ? 7 - weekStart : -weekStart;
    const dayOffset = selectedDay.getDate() - offset - dayOfWeek;
    return {
      firstDay: new Date(
        selectedDay.getFullYear(),
        selectedDay.getMonth(),
        dayOffset,
      ),
      lastDay: new Date(
        selectedDay.getFullYear(),
        selectedDay.getMonth(),
        dayOffset + 7,
      ),
    };
  } else if (viewName === 'month')
    return {
      firstDay: new Date(selectedDay.getFullYear(), selectedDay.getMonth(), 1),
      lastDay: new Date(
        selectedDay.getFullYear(),
        selectedDay.getMonth() + 1,
        0,
      ),
    };
  else if (viewName === 'customday') {
    return {
      firstDay: selectedDay,
      lastDay: new Date(
        selectedDay.getFullYear(),
        selectedDay.getMonth(),
        selectedDay.getDate() + customViewSize,
      ),
    };
  } else if (viewName === 'customweek') {
    const dayOfWeek = selectedDay.getDay();
    const diff = dayOfWeek < weekStart ? 7 - weekStart : -weekStart;

    const firstDay = new Date(selectedDay);
    firstDay.setDate(firstDay.getDate() - diff - dayOfWeek);
    return {
      firstDay,
      lastDay: new Date(
        firstDay.getFullYear(),
        firstDay.getMonth(),
        firstDay.getDate() + customViewSize,
      ),
    };
  } else if (viewName === 'year')
    return {
      firstDay: new Date(selectedDay.getFullYear(), 0, 1),
      lastDay: new Date(selectedDay.getFullYear() + 1, 0, 1),
    };
  else return output.throw('unknown view');
}

async function detectCustomViewSize([
  customViewSize,
  setCustomViewSize,
]: GetSet<number>): Promise<void> {
  const dateKeys = await awaitElement(() => {
    const items =
      Array.from(document.querySelectorAll('[role="main"]'))
        .at(-1)
        ?.querySelectorAll('[data-start-date-key] [data-datekey]') ?? [];
    return items.length === 0 ? undefined : items;
  });
  if (dateKeys === undefined) return;
  // Find out how many days are displayed
  const duration = new Set(
    Array.from(dateKeys, (dateKey) => dateKey.getAttribute('data-datekey')),
  ).size;
  if (duration !== customViewSize) setCustomViewSize(duration);
}

export const exportsForTests = {
  parsePath,
};
