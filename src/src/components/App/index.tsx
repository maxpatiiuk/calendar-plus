import React from 'react';
import { commonText } from '../../localization/common';
import { useBooleanState } from '../../hooks/useBooleanState';
import { Portal } from '../Molecules/Portal';
import { Dashboard } from '../Dashboard';

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
            <Dashboard closeHandler={handleClose} widgets={testWidgets}/>
          </div>
        </Portal>
      )}
    </>
  );
}
