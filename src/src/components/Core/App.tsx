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

const debugOverlayPromise =
  process.env.NODE_ENV === 'development'
    ? import('../DebugOverlay').then(({ DebugOverlay }) => <DebugOverlay />)
    : undefined;

export function App(): JSX.Element | null {
  const [isOpen, _, handleClose, handleToggle] = useBooleanState();

  React.useEffect(() => {
    const handleEscKey = (event: KeyboardEvent): void =>
      event.key === 'Escape' ? handleClose() : undefined;

    document.addEventListener('keydown', handleEscKey, false);

    return () => document.removeEventListener('keydown', handleEscKey, false);
  }, []);

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

  const auth = React.useContext(AuthContext);
  const [state, setState] = React.useState<
    State<'MainState'> | State<'PreferencesState'>
  >({ type: 'MainState' });

  return typeof currentView === 'object' ? (
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
          <main className="flex h-full flex-col gap-2 overflow-y-auto bg-gray-200 p-2">
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
      )}
    </>
  ) : (
    debugOverlay ?? null
  );
}
