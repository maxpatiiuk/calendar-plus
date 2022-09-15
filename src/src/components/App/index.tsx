import React from 'react';
import { commonText } from '../../localization/common';
import { useBooleanState } from '../../hooks/useBooleanState';
import { Portal } from '../Molecules/Portal';

export function App() {
  const [isOpen, _, handleClose, handleToggle] = useBooleanState();

  return (
    <>
      <button type="button" onClick={handleToggle} aria-pressed={isOpen}>
        {commonText('calendarPlus')}
      </button>
      {isOpen && (
        <Portal>
          <div>
            <button type="button" onClick={handleClose}>
              {commonText('close')}
            </button>
          </div>
        </Portal>
      )}
    </>
  );
}
