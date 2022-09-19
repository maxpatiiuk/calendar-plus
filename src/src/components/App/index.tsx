import React from 'react';
import { commonText } from '../../localization/common';
import { useBooleanState } from '../../hooks/useBooleanState';
import { Portal } from '../Molecules/Portal';
import { useEffect } from "react";


export function App() {
  const [isOpen, _, handleClose, handleToggle] = useBooleanState();

  useEffect(() => {

    const escFunction = (event: { key: string; }) => {
      if (event.key === "Escape") {
        handleClose()
      }
    };

    document.addEventListener("keydown", escFunction, false);

    return () => {
      document.removeEventListener("keydown", escFunction, false);
    };
  }, []);

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
