/**
 * Logic for setting and listening to keyboard shortcuts
 */

import React from 'react';

import { useTriggerState } from '../../hooks/useTriggerState';
import { commonText } from '../../localization/common';
import { preferencesText } from '../../localization/preferences';
import type { RA } from '../../utils/types';
import { removeItem, replaceItem, replaceKey } from '../../utils/utils';
import { Button, Key } from '../Atoms';
import type { PreferenceRenderer } from '../Preferences/definitions';
import { keyboardPlatform, type KeyboardShortcuts } from './config';
import { keyJoinSymbol, setKeyboardEventInterceptor } from './context';
import {
  resolvePlatformShortcuts,
  localizeKeyboardShortcut,
  localizedKeyJoinSymbol,
} from './utils';
import { useLegacyKeyboardShortcutHandler } from './hooks';

export const SetKeyboardShortcuts: PreferenceRenderer<KeyboardShortcuts> = ({
  value: rawValue,
  onChange: handleChange,
  definition: { defaultValue },
}) => {
  const value = useLegacyKeyboardShortcutHandler(
    rawValue,
    handleChange,
    defaultValue,
  );

  const [editingIndex, setEditingIndex] = React.useState<number | false>(false);
  const isEditing = typeof editingIndex === 'number';
  const shortcuts = resolvePlatformShortcuts(value) ?? [];
  const setShortcuts = (shortcuts: RA<string>): void =>
    handleChange(replaceKey(value, keyboardPlatform, shortcuts));

  // Do not allow saving an empty shortcut
  const hasEmptyShortcut = !isEditing && shortcuts.includes('');
  React.useEffect(() => {
    if (hasEmptyShortcut)
      setShortcuts(shortcuts.filter((shortcut) => shortcut !== ''));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasEmptyShortcut]);

  return (
    <div className="flex flex-col gap-2">
      {shortcuts.map((shortcut, index) => (
        <EditKeyboardShortcut
          key={index}
          shortcut={shortcut}
          onEditStart={
            editingIndex === false
              ? (): void => setEditingIndex(index)
              : undefined
          }
          onSave={
            editingIndex === index
              ? (shortcut): void => {
                  setShortcuts(
                    shortcut === undefined
                      ? removeItem(shortcuts, index)
                      : replaceItem(shortcuts, index, shortcut),
                  );
                  setEditingIndex(false);
                }
              : undefined
          }
        />
      ))}
      <div className="flex items-end gap-2">
        {!isEditing && (
          <Button.Default
            onClick={(): void => {
              setShortcuts([...shortcuts, '']);
              setEditingIndex(shortcuts.length);
            }}
          >
            {commonText('add')}
          </Button.Default>
        )}
      </div>
    </div>
  );
};

function EditKeyboardShortcut({
  shortcut,
  onSave: handleSave,
  onEditStart: handleEditStart,
}: {
  readonly shortcut: string;
  readonly onSave: ((shortcut: string | undefined) => void) | undefined;
  readonly onEditStart: (() => void) | undefined;
}): JSX.Element {
  const [localState, setLocalState] = useTriggerState(shortcut);
  const parts = localState.length === 0 ? [] : localState.split(keyJoinSymbol);
  const isEditing = typeof handleSave === 'function';

  React.useEffect(() => {
    if (isEditing) {
      // Allows user to press Enter to finish setting keyboard shortcut.
      saveButtonRef.current?.focus();
      setLocalState('');
      return setKeyboardEventInterceptor(setLocalState);
    }
    return undefined;
  }, [isEditing, setLocalState]);

  const isEmpty = parts.length === 0;
  const activeValue = React.useRef(localState);
  activeValue.current = isEmpty ? shortcut : localState;

  const saveButtonRef = React.useRef<HTMLButtonElement>(null);

  const localizedParts = React.useMemo(
    () => localizeKeyboardShortcut(localState).split(localizedKeyJoinSymbol),
    [localState],
  );

  return (
    <div className="flex gap-2">
      <div
        aria-atomic
        aria-live={isEditing ? 'polite' : undefined}
        className="flex flex-1 flex-wrap content-center items-center gap-1"
      >
        {isEmpty ? (
          isEditing ? (
            preferencesText('pressKeys')
          ) : (
            preferencesText('noKeyAssigned')
          )
        ) : (
          <kbd className="contents">
            {localizedParts.map((key, index) => (
              <Key className="mx-0" key={index}>
                {key}
              </Key>
            ))}
          </kbd>
        )}
      </div>
      {isEditing && (
        <Button.Default onClick={(): void => handleSave(undefined)}>
          {commonText('remove')}
        </Button.Default>
      )}
      <Button.Default
        forwardRef={saveButtonRef}
        onClick={
          isEditing
            ? (): void =>
                handleSave(
                  activeValue.current.length === 0
                    ? shortcut
                    : activeValue.current,
                )
            : handleEditStart
        }
      >
        {isEditing ? commonText('save') : commonText('edit')}
      </Button.Default>
    </div>
  );
}
