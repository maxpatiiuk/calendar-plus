import React from 'react';
import { commonText } from '../../localization/common';
import { useBooleanState } from '../../hooks/useBooleanState';
import { Portal } from '../Molecules/Portal';
import { Dashboard } from '../Dashboard';
import { CurrentViewContext } from '../Core/CurrentViewContext';

// Allowing for the class to me overriden from here
const testWidgets : Array<WidgetObj> = [
  { header: "Header 1", body: "Body 1" },
  { header: "Header 2", body: "Body 2" },
  { header: "Header 3", body: "Body 3" },
  { header: "Header 4", body: "Body 4" },
  { header: "Header 5", body: "Body 5" },
  { header: "Header 6", body: "Body 6" },
  { header: "Header 7", body: "Body 7" },
  { header: "Header 8", body: "Body 8" }
]

export function App(): JSX.Element | null {
  const [isOpen, _, handleClose, handleToggle] = useBooleanState();

  React.useEffect(() => {
    const handleEscKey = (event: KeyboardEvent): void =>
      event.key === "Escape"
        ? handleClose()
        : undefined;

    document.addEventListener("keydown", handleEscKey, false);
    return () => document.removeEventListener("keydown", handleEscKey, false);
  }, []);

  const currentView = React.useContext(CurrentViewContext);

  return typeof currentView === 'object' ? (
    <>
      <button type="button" onClick={handleToggle} aria-pressed={isOpen}>
        {commonText('calendarPlus')}
      </button>
      {isOpen && (
        <Portal>
          <main className="h-full">
            <Dashboard closeHandler={handleClose} widgets={testWidgets} />
            <pre>Debug: {JSON.stringify(currentView)}</pre>
          </main>
        </Portal>
      )}
    </>
  ) : null;
}
