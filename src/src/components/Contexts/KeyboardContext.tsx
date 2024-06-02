import React from 'react';

import { listen } from '../../utils/events';
import type { RA } from '../../utils/types';
import { sortFunction } from '../../utils/utils';
import type {
  KeyboardShortcut,
  KeyboardShortcuts,
} from '../Molecules/KeyboardShortcut';
import {
  modifierKeyNames,
  platform,
  resolveModifiers,
} from '../Molecules/KeyboardShortcut';

/**
 * Allows to register a key listener
 */
export const KeyboardContext = React.createContext<
  (shortcut: KeyboardShortcuts, callback: () => void) => () => void
>(() => {
  throw new Error('KeyboardListener is not initialized');
});
KeyboardContext.displayName = 'KeyboardContext';

export function KeyboardListener({
  children,
}: {
  readonly children: JSX.Element;
}): JSX.Element {
  const listenersRef = React.useRef<
    RA<{
      readonly shortcuts: RA<KeyboardShortcut>;
      readonly callback: () => void;
    }>
  >([]);

  const handleKeyboardShortcut = React.useCallback(
    (shortcut: KeyboardShortcuts, callback: () => void) => {
      const shortcuts: RA<KeyboardShortcut> = shortcut[platform] ?? [];
      if (shortcuts.length === 0) return () => undefined;
      const entry = { shortcuts, callback };
      listenersRef.current = [...listenersRef.current, entry];
      return () => {
        listenersRef.current = listenersRef.current.filter(
          (listener) => listener !== entry,
        );
      };
    },
    [],
  );

  const pressedKeys = React.useRef<KeyboardShortcut['keys']>([]);

  React.useEffect(
    () =>
      listen(document, 'keydown', (event) => {
        if (event.key === undefined) return;
        const key =
          event.key.length === 1 ? event.key.toUpperCase() : event.key;
        if (modifierKeyNames.has(event.key)) return;
        pressedKeys.current = Array.from(
          new Set([...pressedKeys.current, key]),
        ).sort(sortFunction((key) => key));
        checkListeners(resolveModifiers(event));
      }),
    [],
  );

  React.useEffect(
    () =>
      listen(document, 'keyup', (event) => {
        if (event.key === undefined) return;
        const pressedKey =
          event.key.length === 1 ? event.key.toUpperCase() : event.key;
        pressedKeys.current = pressedKeys.current
          .filter((key) => key !== pressedKey)
          .sort(sortFunction((key) => key));
        checkListeners(resolveModifiers(event));
      }),
    [],
  );

  const checkListeners = React.useCallback(
    (modifiers: KeyboardShortcut['modifiers']) => {
      let isEntering: boolean | undefined = undefined;

      function isInputting(): boolean {
        isEntering ??= isInInput();
        return isEntering;
      }

      listenersRef.current
        .filter((listener) =>
          listener.shortcuts.some((shortcut) => {
            if (
              shortcut.modifiers.join(',') !== modifiers.join(',') ||
              shortcut.keys.join(',') !== pressedKeys.current.join(',')
            )
              return false;
            // Ignore single key shortcuts when in an input field
            return !(
              shortcut.modifiers.filter((modifier) => modifier !== 'shift')
                .length === 0 && isInputting()
            );
          }),
        )
        .forEach((listener) => listener.callback());
    },
    [],
  );

  return (
    <KeyboardContext.Provider value={handleKeyboardShortcut}>
      {children}
    </KeyboardContext.Provider>
  );
}

const isInInput = (): boolean =>
  document.activeElement?.tagName === 'INPUT' ||
  document.activeElement?.tagName === 'TEXTAREA' ||
  document.activeElement?.getAttribute('role') === 'textbox';
