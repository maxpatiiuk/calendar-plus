import React from 'react';
import type { State } from 'typesafe-reducer';

import { useAsyncState } from '../../hooks/useAsyncState';
import { useBooleanState } from '../../hooks/useBooleanState';
import { commonText } from '../../localization/common';
import { Button } from '../Atoms';
import { AuthContext } from '../Contexts/AuthContext';
import { CurrentViewContext } from '../Contexts/CurrentViewContext';
import { Dashboard } from '../Dashboard';
import { useEvents } from '../EventsStore';
import { useEventsStore } from '../EventsStore/useEventsStore';
import { Portal } from '../Molecules/Portal';
import { PreferencesPage } from '../Preferences';
import { GhostEvents } from '../PowerTools/GhostEvents';
import { AutoComplete } from '../PowerTools/AutoComplete';
import { CalendarsContext } from '../Contexts/CalendarsContext';
import { Gage } from '../Molecules/Gage';

const debugOverlayPromise =
  process.env.NODE_ENV === 'development'
    ? import('../DebugOverlay').then(({ DebugOverlay }) => <DebugOverlay />)
    : undefined;

export function App(): JSX.Element | null {
  const [isOpen, _, __, handleToggle] = useBooleanState();

  React.useEffect(() => {
    const handleBackTickKey = (event: KeyboardEvent): void =>
      event.key === '`' ? handleToggle() : undefined;

    document.addEventListener('keydown', handleBackTickKey, false);

    return () => {
      document.removeEventListener('keydown', handleBackTickKey, false);
    };
  }, []);

  const currentView = React.useContext(CurrentViewContext);
  const eventsStore = useEventsStore();
  const durations = useEvents(
    eventsStore,
    // Don't fetch until the overlay is opened
    isOpen ? currentView?.firstDay : undefined,
    currentView?.lastDay
  );


  const divStyle = {
    display: 'flex',
    alignItems: 'center'
  };

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
          <div style={divStyle} 
          onClick={
            auth.authenticated
                ? handleToggle
                : (): void =>
                    void auth
                      .handleAuthenticate()
                      .then(handleToggle)
                      .catch(console.error)
          }>
            <Gage
            value={10}
            max={100}
            label={commonText('goals')}
            color='blue'
            fontSize={2}
            size={3}
            />
            <Gage
            value={10}
            max={100}
            label={commonText('goals')}
            color='orange'
            fontSize={2}
            size={3}
            />
            <Gage
            value={10}
            max={100}
            label={commonText('goals')}
            color='green'
            fontSize={2}
            size={3}
            />
            <Gage
            value={10}
            max={100}
            label={commonText('goals')}
            color='red'
            fontSize={2}
            size={3}
            />
          </div>

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
    </>
  );
}
