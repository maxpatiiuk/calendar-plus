import React from 'react';
import { commonText } from '../../localization/common';
import { useBooleanState } from '../../hooks/useBooleanState';

export function App() {
  const [isOpen, handleOpen, handleClose] = useBooleanState();

  return (
    <>
      <button type="button" onClick={handleOpen}>
        {commonText('calendarStats')}
      </button>
      {isOpen && (
        <div className="absolute inset-0 z-10 h-screen w-screen bg-white">
          <button type="button" onClick={handleClose}>
            {commonText('close')}
          </button>
        </div>
      )}
    </>
  );
}
