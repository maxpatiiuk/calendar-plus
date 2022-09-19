import React from 'react';
import { commonText } from '../../localization/common';
import { useBooleanState } from '../../hooks/useBooleanState';
import { Portal } from '../Molecules/Portal';
import { CurrentViewContext } from '../Core/CurrentViewContext';

export function App(): JSX.Element | null {
  const [isOpen, _, handleClose, handleToggle] = useBooleanState();

  const currentView = React.useContext(CurrentViewContext);

  return typeof currentView === 'object' ? (
    <>
      <button type="button" onClick={handleToggle} aria-pressed={isOpen}>
        {commonText('calendarPlus')}
      </button>
      {isOpen && (
        <Portal>
          <main>
            <button type="button" onClick={handleClose}>
              {commonText('close')}
            </button>
            <pre>Debug: {JSON.stringify(currentView)}</pre>
          </main>
        </Portal>
      )}
    </>
  ) : null;
}
