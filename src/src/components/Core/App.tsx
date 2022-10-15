import React from 'react';
import { commonText } from '../../localization/common';
import { useBooleanState } from '../../hooks/useBooleanState';
import { Portal } from '../Molecules/Portal';
import { Dashboard } from '../Dashboard';
import { CurrentViewContext } from '../Contexts/CurrentViewContext';
import { AuthContext } from '../Contexts/AuthContext';
import { useAsyncState } from '../../hooks/useAsyncState';
import { useEvents } from '../EventsStore';
import { useEventsStore } from '../EventsStore/useEventsStore';

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

  return typeof currentView === 'object' ? (
    <>
      {debugOverlay}
      <button
        type="button"
        onClick={
          auth.authenticated
            ? handleToggle
            : (): void =>
                void auth
                  .handleAuthenticate()
                  .then(handleToggle)
                  .catch(console.error)
        }
        aria-pressed={isOpen}
      >
        {commonText('calendarPlus')}
      </button>
      {isOpen && (
        <Portal>
          <main className="h-full overflow-y-auto">
            <Dashboard durations={durations} />
          </main>
        </Portal>
      )}
    </>
  ) : (
    debugOverlay ?? null
  );
}
