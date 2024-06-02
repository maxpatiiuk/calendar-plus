import React from 'react';

import { useAsyncState } from '../../hooks/useAsyncState';
import { commonText } from '../../localization/common';
import { Button } from '../Atoms';
import { AuthContext } from '../Contexts/AuthContext';
import { CalendarsContext } from '../Contexts/CalendarsContext';
import { CurrentViewContext } from '../Contexts/CurrentViewContext';
import { KeyboardContext } from '../Contexts/KeyboardContext';
import { Dashboard } from '../Dashboard';
import { useEvents } from '../EventsStore';
import { Portal } from '../Molecules/Portal';
import { AutoComplete } from '../PowerTools/AutoComplete';
import { BetterEditRecurring } from '../PowerTools/BetterEditRecurring';
import { CondenseInterface } from '../PowerTools/CondenseInterface';
import { GhostEvents } from '../PowerTools/GhostEvents';
import { HideEditAll } from '../PowerTools/HideEditAll';
import { PreferencesPage } from '../Preferences';
import { usePref } from '../Preferences/usePref';
import { FirstAuthScreen } from './FirstAuthScreen';

/**
 * Entrypoint react component for the extension
 */
export function App(): JSX.Element | null {
  const [state, setState] = React.useState<'closed' | 'main' | 'preferences'>(
    'closed',
  );
  const isOpen = state !== 'closed';

  const [openOverlayShortcut] = usePref('feature', 'openOverlayShortcut');
  const [closeOverlayShortcut] = usePref('feature', 'closeOverlayShortcut');
  const handleKeyboardShortcut = React.useContext(KeyboardContext);
  React.useEffect(
    () =>
      isOpen
        ? handleKeyboardShortcut(closeOverlayShortcut, () => setState('closed'))
        : handleKeyboardShortcut(openOverlayShortcut, () => setState('main')),
    [isOpen, handleKeyboardShortcut, closeOverlayShortcut, openOverlayShortcut],
  );

  const currentView = React.useContext(CurrentViewContext);
  const durations = useEvents(
    // Don't fetch until the overlay is opened
    isOpen ? currentView?.firstDay : undefined,
    currentView?.lastDay,
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
          <Button.White
            aria-pressed={isOpen ? true : undefined}
            onClick={(): void =>
              auth.token === undefined
                ? setShowFirstAuth(true)
                : setState(isOpen ? 'closed' : 'main')
            }
          >
            {commonText('calendarPlus')}
          </Button.White>
          {showFirstAuth && (
            <FirstAuthScreen
              onClose={(): void => setShowFirstAuth(false)}
              onAuth={(): Promise<void> =>
                auth.handleAuthenticate().then(() => setState('main'))
              }
            />
          )}
          {isOpen && Array.isArray(calendars) ? (
            <Portal>
              <main
                className={`
                  relative z-[100] box-border flex h-full flex-col gap-2
                  overflow-y-auto bg-gray-200 p-2 [&_*]:box-border
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
            </Portal>
          ) : undefined}
        </>
      ) : undefined}
      {debugOverlay}
      <AutoComplete />
      <GhostEvents />
      <HideEditAll />
      <BetterEditRecurring />
      <CondenseInterface />
    </>
  );
}

const debugOverlayPromise =
  process.env.NODE_ENV === 'development'
    ? import('../DebugOverlay').then(({ DebugOverlay }) => <DebugOverlay />)
    : undefined;
