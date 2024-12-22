import React from 'react';

import { useAsyncState } from '../../hooks/useAsyncState';
import { commonText } from '../../localization/common';
import { Button } from '../Atoms';
import { AuthContext } from '../Contexts/AuthContext';
import { CalendarsContext } from '../Contexts/CalendarsContext';
import { CurrentViewContext } from '../Contexts/CurrentViewContext';
import { Dashboard } from '../Dashboard';
import { useEvents } from '../EventsStore';
import { OverlayPortal } from '../Molecules/Portal';
import { AutoComplete } from '../PowerTools/AutoComplete';
import { BetterEditRecurring } from '../PowerTools/BetterEditRecurring';
import { CondenseInterface } from '../PowerTools/CondenseInterface';
import { GhostEvents } from '../PowerTools/GhostEvents';
import { HideEditAll } from '../PowerTools/HideEditAll';
import { PreferencesPage } from '../Preferences';
import { FirstAuthScreen } from './FirstAuthScreen';
import { useStorage } from '../../hooks/useStorage';
import { DevModeConsoleOverlay } from '../DebugOverlay/DevModeConsoleOverlay';
import { domReadingEligibleViews } from '../DomReading';
import { ThemeDetector } from '../Contexts/ThemeColor';
import { useKeyboardShortcut } from '../KeyboardShortcuts/hooks';
import { devMode } from '../Contexts/devMode';

/**
 * Entrypoint react component for the extension
 */
export function App(): JSX.Element | null {
  const [state, setState] = React.useState<'closed' | 'main' | 'preferences'>(
    'closed',
  );
  const isOpen = state !== 'closed';

  useKeyboardShortcut(
    'feature',
    'openOverlayShortcut',
    isOpen ? undefined : () => setState('main'),
  );
  useKeyboardShortcut(
    'feature',
    'closeOverlayShortcut',
    isOpen ? () => setState('closed') : undefined,
  );

  const [domReadingEnabled, setDomReadingEnabled] = React.useState(true);
  const currentView = React.useContext(CurrentViewContext);

  const { token } = React.useContext(AuthContext);
  const isAuthenticated = typeof token === 'string';

  /**
   * Even though we can read from the DOM without authentication, we still need
   * to make the API request to fetch the calendar list (we could read that
   * from the DOM too, but it would be less reliable; I also plan to add more
   * features that would require authentication, like bulk event editing).
   */
  const readSource =
    !isAuthenticated || currentView === undefined
      ? undefined
      : domReadingEnabled && domReadingEligibleViews.has(currentView.view)
        ? 'dom'
        : 'api';

  const durations = useEvents(
    currentView,
    isOpen,
    readSource,
    setDomReadingEnabled,
  );

  const [debugOverlay] = useAsyncState(
    React.useCallback(() => debugOverlayPromise, []),
    false,
  );

  const calendars = React.useContext(CalendarsContext);
  const auth = React.useContext(AuthContext);

  const [showFirstAuth, setShowFirstAuth] = React.useState(false);

  return (
    <>
      {typeof currentView === 'object' ? (
        <>
          <Button.Default
            aria-pressed={isOpen ? true : undefined}
            onClick={(): void =>
              auth.token === undefined
                ? setShowFirstAuth(true)
                : setState(isOpen ? 'closed' : 'main')
            }
          >
            {commonText('calendarPlus')}
          </Button.Default>
          {showFirstAuth && (
            <FirstAuthScreen
              onClose={(): void => setShowFirstAuth(false)}
              onAuth={(): Promise<void> =>
                auth.handleAuthenticate().then(() => setState('main'))
              }
            />
          )}
          {isOpen && Array.isArray(calendars) ? (
            <OverlayPortal>
              <main
                className={`
                  relative z-[1000] box-border flex h-full flex-col gap-2
                  overflow-y-auto bg-gray-200 dark:bg-[#141414] p-2
                  [&_*]:box-border dark:text-[#e3e3e3]
                `}
              >
                {state === 'main' ? (
                  <Dashboard
                    durations={durations}
                    onOpenPreferences={(): void => setState('preferences')}
                  />
                ) : (
                  <PreferencesPage onClose={(): void => setState('main')} />
                )}
              </main>
            </OverlayPortal>
          ) : undefined}
        </>
      ) : undefined}
      {devMode && <DevModeConsoleOverlay />}
      {debugOverlay}
      <AutoComplete />
      <GhostEvents />
      <HideEditAll />
      <BetterEditRecurring />
      <CondenseInterface />
      <ThemeDetector />
    </>
  );
}

const debugOverlayPromise =
  process.env.NODE_ENV === 'development'
    ? import('../DebugOverlay').then(({ DebugOverlay }) => <DebugOverlay />)
    : undefined;
