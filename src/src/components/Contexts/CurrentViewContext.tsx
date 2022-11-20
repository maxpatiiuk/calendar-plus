import React from 'react';
import { listenEvent } from '../Background/messages';

/*
 * "customday" is a user-customizable view (they can change the number of days
 * to display)
 */
const supportedViews = [
  'day',
  'week',
  'month',
  /* 'year' */
  'customday',
  'customweek',
] as const;
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

/**
 * Listen for changes to current URL
 */
function useCurrentTracker(
  setCurrentView: (newCurrentView: CurrentView | undefined) => void
) {
  React.useEffect(() => {
    let lastPath = '';

    const parseUrl = () => setCurrentView(parsePath(window.location.pathname));
    // Parse initial URL
    parseUrl();

    return listenEvent('TabUpdate', () => {
      if (window.location.pathname === lastPath) return;
      lastPath = window.location.pathname;
      parseUrl();
    });
  }, [setCurrentView]);
}

const commonPrefix = `/calendar/u/0/r/`;

/**
 * Extract current date from the Google Calendar URL
 */
function parsePath(path: string): CurrentView | undefined {
  if (path === '/calendar/u/0/r') {
    const viewMode = document.querySelector('header div[data-active-view]');
    const viewName = viewMode?.getAttribute(
      'data-active-view'
    ) as SupportedView;
    if (viewName && supportedViews.includes(viewName)) {
      // Used to center on current date (always centered if basic path)
      const today = new Date();
      return {
        view: viewName,
        selectedDay: today,
        ...resolveBoundaries('day', today),
      };
    }
  }
  if (!path.startsWith(commonPrefix)) return undefined;
  const [rawView, ...date] = path.slice(commonPrefix.length).split('/');
  // Make it more type safe
  const viewName = rawView as SupportedView;
  if (!supportedViews.includes(viewName)) return undefined;
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
    ...resolveBoundaries(viewName, selectedDay),
  };
}

function resolveBoundaries(
  viewName: SupportedView,
  selectedDay: Date
): { firstDay: Date; lastDay: Date } {
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
    // FEATURE: detect first of the week
    const dayOffset = selectedDay.getDate() - selectedDay.getDay();
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
    // Find out how many days are displayed
    const duration = new Set(
      Array.from(
        document.querySelectorAll('[data-start-date-key] [data-datekey]'),
        (v) => v.getAttribute('data-datekey')
      )
    ).size;
    return {
      firstDay: selectedDay,
      lastDay: new Date(
        selectedDay.getFullYear(),
        selectedDay.getMonth(),
        selectedDay.getDate() + duration
      ),
    };
  } else if (viewName === 'customweek') {
    // Find out how many days are displayed
    const duration = new Set(
      Array.from(
        document.querySelectorAll('[data-start-date-key] [data-datekey]'),
        (v) => v.getAttribute('data-datekey')
      )
    ).size;
    const firstDay = new Date(selectedDay);
    // FEATURE: detect first of the week
    firstDay.setDate(firstDay.getDate() - firstDay.getDay());
    return {
      firstDay,
      lastDay: new Date(
        firstDay.getFullYear(),
        firstDay.getMonth(),
        firstDay.getDate() + duration
      ),
    };
  } else if (viewName === 'year')
    return {
      firstDay: new Date(selectedDay.getFullYear(), 0, 1),
      lastDay: new Date(selectedDay.getFullYear() + 1, 0, 1),
    };
  else throw new Error('unknown view');
}

export const CurrentViewContext = React.createContext<CurrentView | undefined>(
  undefined
);
CurrentViewContext.displayName = 'LoadingContext';

export const exportsForTests = {
  parsePath,
};
