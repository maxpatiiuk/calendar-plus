import React from 'react';

import { useStorage } from '../../hooks/useStorage';
import { f } from '../../utils/functools';
import type { GetSet } from '../../utils/types';
import { listenEvent } from '../Background/messages';
import { awaitElement } from './CalendarsContext';
import { SettingsContext } from './SettingsContext';

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

export type SupportedView = typeof supportedViews[number];

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
    undefined
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
  setCurrentView: (newCurrentView: CurrentView | undefined) => void
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
        weekStart
      );
      setCurrentView(parsed);
      if (parsed?.view === 'customday' || parsed?.view === 'customweek')
        detectCustomViewSize([customViewSize, setCustomViewSize]).catch(
          console.error
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
  weekStart: number
): CurrentView | undefined {
  if (path === commonPrefix || path === commonPrefix.slice(0, -1)) {
    const viewMode = document.querySelector('header div[data-active-view]');
    const rawViewName = viewMode?.getAttribute('data-active-view') ?? '';
    const viewName =
      rawViewName in viewMapper
        ? viewMapper[rawViewName as keyof typeof viewMapper]
        : rawViewName;
    if (f.includes(supportedViews, viewName)) {
      // Used to center on current date (always centered if basic path)
      const today = new Date();
      return {
        view: viewName,
        selectedDay: today,
        ...resolveBoundaries(viewName, today, customViewSize, weekStart),
      };
    }
  }
  if (!path.startsWith(commonPrefix)) return undefined;
  const [viewName, ...date] = path.slice(commonPrefix.length).split('/');
  if (!f.includes(supportedViews, viewName)) return undefined;
  const year = date[0] || new Date().getFullYear().toString();
  const month = date[1] || (new Date().getMonth() + 1).toString();
  const day = date[2] || new Date().getDate().toString();
  const selectedDay = new Date(
    Number.parseInt(year),
    // Month is 0-based
    Number.parseInt(month) - 1,
    Number.parseInt(day)
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
  weekStart: number
): { readonly firstDay: Date; readonly lastDay: Date } {
  if (viewName === 'day')
    return {
      firstDay: new Date(
        selectedDay.getFullYear(),
        selectedDay.getMonth(),
        selectedDay.getDate()
      ),
      lastDay: new Date(
        selectedDay.getFullYear(),
        selectedDay.getMonth(),
        selectedDay.getDate() + 1
      ),
    };
  else if (viewName === 'week') {
    // BUG: detect first day of the week. This incorrectly assumes Sunday is first
    const dayOffset = selectedDay.getDate() - selectedDay.getDay() + weekStart;
    return {
      firstDay: new Date(
        selectedDay.getFullYear(),
        selectedDay.getMonth(),
        dayOffset
      ),
      lastDay: new Date(
        selectedDay.getFullYear(),
        selectedDay.getMonth(),
        dayOffset + 7
      ),
    };
  } else if (viewName === 'month')
    return {
      firstDay: new Date(selectedDay.getFullYear(), selectedDay.getMonth(), 1),
      lastDay: new Date(
        selectedDay.getFullYear(),
        selectedDay.getMonth() + 1,
        0
      ),
    };
  else if (viewName === 'customday') {
    return {
      firstDay: selectedDay,
      lastDay: new Date(
        selectedDay.getFullYear(),
        selectedDay.getMonth(),
        selectedDay.getDate() + customViewSize
      ),
    };
  } else if (viewName === 'customweek') {
    const firstDay = new Date(selectedDay);
    // FEATURE: detect first day of the week
    firstDay.setDate(firstDay.getDate() - firstDay.getDay() + weekStart);
    return {
      firstDay,
      lastDay: new Date(
        firstDay.getFullYear(),
        firstDay.getMonth(),
        firstDay.getDate() + customViewSize
      ),
    };
  } else if (viewName === 'year')
    return {
      firstDay: new Date(selectedDay.getFullYear(), 0, 1),
      lastDay: new Date(selectedDay.getFullYear() + 1, 0, 1),
    };
  else throw new Error('unknown view');
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
    Array.from(dateKeys, (dateKey) => dateKey.getAttribute('data-datekey'))
  ).size;
  if (duration !== customViewSize) setCustomViewSize(duration);
}

export const CurrentViewContext = React.createContext<CurrentView | undefined>(
  undefined
);
CurrentViewContext.displayName = 'LoadingContext';

export const exportsForTests = {
  parsePath,
};
