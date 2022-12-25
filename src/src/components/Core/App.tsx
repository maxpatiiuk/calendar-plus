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
import { useEventsStore } from '../EventsStore/useEventsStore';
import { Portal } from '../Molecules/Portal';
import { AutoComplete } from '../PowerTools/AutoComplete';
import { GhostEvents } from '../PowerTools/GhostEvents';
import { PreferencesPage } from '../Preferences';
import { usePref } from '../Preferences/usePref';
import { HideEditAll } from '../PowerTools/HideEditAll';
import { BetterEditRecurring } from '../PowerTools/BetterEditRecurring';

const debugOverlayPromise =
  process.env.NODE_ENV === 'development'
    ? import('../DebugOverlay').then(({ DebugOverlay }) => <DebugOverlay />)
    : undefined;

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
    ]
  );

  const currentView = React.useContext(CurrentViewContext);
  const eventsStore = useEventsStore();
  const durations = useEvents(
    eventsStore,
    // Don't fetch until the overlay is opened
    isOpen ? currentView?.firstDay : undefined,
    currentView?.lastDay
  );

  const [debugOverlay] = useAsyncState(
    React.useCallback(() => debugOverlayPromise, []),
    false
  );

  const calendars = React.useContext(CalendarsContext);
  const auth = React.useContext(AuthContext);
  const [state, setState] = React.useState<
    State<'MainState'> | State<'PreferencesState'>
  >({ type: 'MainState' });

  return (
    <>
      {typeof currentView === 'object' && Array.isArray(calendars) ? (
        <>
          {debugOverlay}
          <Button.White
            aria-pressed={isOpen ? true : undefined}
            onClick={
              auth.authenticated
                ? handleToggle
                : (): void =>
                    void auth
                      .handleAuthenticate()
                      .then(handleToggle)
                      .catch(console.error)
            }
          >
            {commonText('calendarPlus')}
          </Button.White>
          {isOpen && (
            <Portal>
              <main className="relative z-[100] flex h-full flex-col gap-2 overflow-y-auto bg-gray-200 p-2">
                {state.type === 'MainState' ? (
                  <Dashboard
                    durations={durations}
                    eventsStore={eventsStore}
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
          )}
        </>
      ) : undefined}
      {debugOverlay}
      <AutoComplete />
      <GhostEvents />
      <HideEditAll />
      <BetterEditRecurring />
    </>
  );
}
