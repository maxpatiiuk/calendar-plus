import React from 'react';
import { commonText } from '../../localization/common';
import { useBooleanState } from '../../hooks/useBooleanState';
import { Portal } from '../Molecules/Portal';
import { Dashboard } from '../Dashboard';
import { CurrentViewContext } from '../Core/CurrentViewContext';

const testWidgets = [
  ["Header 1", "Body 1"],
  ["Header 2", "Body 2"],
  ["Header 3", "Body 3"],
  ["Header 4", "Body 4"],
  ["Header 5", "Body 5"],
  ["Header 6", "Body 6"],
  ["Header 7", "Body 7"],
  ["Header 8", "Body 8"],
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
          <main>
            <Dashboard closeHandler={handleClose} widgets={testWidgets} />
            <pre>Debug: {JSON.stringify(currentView)}</pre>
          </main>
        </Portal>
      )}
    </>
  ) : null;
}
