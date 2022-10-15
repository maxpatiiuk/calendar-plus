import React from 'react';
import { commonText } from '../../localization/common';
import { useBooleanState } from '../../hooks/useBooleanState';
import { Portal } from '../Molecules/Portal';
import { Dashboard } from '../Dashboard';
import { CurrentViewContext } from '../Contexts/CurrentViewContext';
import { AuthContext } from '../Contexts/AuthContext';
import { CalendarsContext } from '../Contexts/CalendarsContext';
import { useAsyncState } from '../../hooks/useAsyncState';
import { useEvents } from '../EventsStore';
import { DoughnutChart } from '../Charts/DoughnutChart';
import { useEventsStore } from '../EventsStore/useEventsStore';
import { StackedChart } from '../Charts/StackedChart';

// Allowing for the class to be overridden from here
const testWidgets: Array<WidgetObj> = [
  { header: 'Header 1', body: 'Body 1' },
  { header: 'Header 2', body: 'Body 2' },
  { header: 'Header 3', body: 'Body 3' },
  { header: 'Header 4', body: 'Body 4' },
  { header: 'Header 5', body: 'Body 5' },
  { header: 'Header 6', body: 'Body 6' },
  { header: 'Header 7', body: 'Body 7' },
  { header: 'Header 8', body: 'Body 8' },
];

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

  const calendars = React.useContext(CalendarsContext);
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
            <Dashboard closeHandler={handleClose} widgets={testWidgets} />
            <DoughnutChart durations={durations} />
            <StackedChart durations={durations} view={currentView} />
            <pre>
              {JSON.stringify({ currentView, auth, durations }, null, 4)}
              {JSON.stringify(
                calendars?.map(({ summary }) => summary) ??
                  commonText('loading'),
                null,
                4
              )}
            </pre>
          </main>
        </Portal>
      )}
    </>
  ) : (
    debugOverlay ?? null
  );
}
