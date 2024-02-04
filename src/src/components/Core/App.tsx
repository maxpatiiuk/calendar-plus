import React from 'react';
import type { State } from 'typesafe-reducer';

import { useAsyncState } from '../../hooks/useAsyncState';
import { useBooleanState } from '../../hooks/useBooleanState';
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
  const [isOpen, handleOpen, handleClose, handleToggle] = useBooleanState();

  const [openOverlayShortcut] = usePref('feature', 'openOverlayShortcut');
  const [closeOverlayShortcut] = usePref('feature', 'closeOverlayShortcut');
  const handleRegisterKey = React.useContext(KeyboardContext);
  React.useEffect(
    () =>
      isOpen
        ? handleRegisterKey(closeOverlayShortcut, handleClose)
        : handleRegisterKey(openOverlayShortcut, handleOpen),
    [
      isOpen,
      handleRegisterKey,
      closeOverlayShortcut,
      openOverlayShortcut,
      handleOpen,
      handleClose,
    ],
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
  const [state, setState] = React.useState<
    State<'MainState'> | State<'PreferencesState'>
  >({ type: 'MainState' });
  const [isFirstAuth, setIsFirstAuth] = React.useState(false);

  return (
    <>
      {typeof currentView === 'object' ? (
        <>
          {debugOverlay}
          <Button.White
            aria-pressed={isOpen ? true : undefined}
            onClick={(): void =>
              auth.token === undefined ? setIsFirstAuth(true) : handleToggle()
            }
          >
            {commonText('calendarPlus')}
          </Button.White>
          {isFirstAuth && (
            <FirstAuthScreen
              onClose={(): void => setIsFirstAuth(false)}
              onAuth={(): Promise<void> =>
                auth.handleAuthenticate(true).then(handleToggle)
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
                {state.type === 'MainState' ? (
                  <Dashboard
                    durations={durations}
                    onOpenPreferences={(): void =>
                      setState({ type: 'PreferencesState' })
                    }
                  />
                ) : (
                  <PreferencesPage
                    onClose={(): void => setState({ type: 'MainState' })}
                  />
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
