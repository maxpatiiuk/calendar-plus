import React from 'react';
import type { KeyboardShortcuts, LegacyKeyboardShortcuts } from './config';
import { bindKeyboardShortcut } from './context';
import { resolvePlatformShortcuts, localizeKeyboardShortcut } from './utils';
import type {
  preferenceDefinitions,
  Preferences,
} from '../Preferences/definitions';
import { usePref } from '../Preferences/usePref';
import { formatDisjunction } from '../Atoms/Internationalization';
import { output } from '../Errors/exceptions';

/**
 * React Hook for reacting to keyboard shortcuts user pressed for a given
 * action.
 *
 * The hook also returns a localized string representing the keyboard
 * shortcut - this string can be displayed in UI tooltips.
 */
export function useKeyboardShortcut<
  CATEGORY extends keyof Preferences,
  ITEM extends CATEGORY extends keyof typeof preferenceDefinitions
    ? string & keyof Preferences[CATEGORY]['items']
    : never,
>(category: CATEGORY, item: ITEM, callback: (() => void) | undefined): string {
  const [currentShortcuts, setShortcuts] = usePref(category, item);

  const resolvedShortcut = useLegacyKeyboardShortcutHandler(
    currentShortcuts,
    setShortcuts,
    undefined,
  );

  const hasCallback = typeof callback === 'function';

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useManualKeyboardShortcut(resolvedShortcut, callback);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const localizedShortcut = useKeyboardShortcutLabel(resolvedShortcut);

  return hasCallback ? localizedShortcut : '';
}

function useManualKeyboardShortcut(
  shortcuts: KeyboardShortcuts | undefined,
  callback: (() => void) | undefined,
): void {
  const callbackRef = React.useRef(callback);
  callbackRef.current = callback;
  const hasCallback = typeof callback === 'function';
  React.useEffect(
    () =>
      typeof shortcuts === 'object' && hasCallback
        ? bindKeyboardShortcut(shortcuts, () => callbackRef.current?.())
        : undefined,
    [hasCallback, shortcuts],
  );
}

/**
 * Provides a localized keyboard shortcut string, which can be used in the UI
 * in the "title" attribute.
 */
function useKeyboardShortcutLabel(
  shortcuts: KeyboardShortcuts | undefined,
): string {
  return React.useMemo(() => {
    const platformShortcuts =
      shortcuts === undefined ? [] : resolvePlatformShortcuts(shortcuts) ?? [];
    return platformShortcuts.length > 0
      ? ` (${formatDisjunction(
          platformShortcuts.map(localizeKeyboardShortcut),
        )})`
      : '';
  }, [shortcuts]);
}

export function useLegacyKeyboardShortcutHandler<T>(
  currentShortcuts: T,
  setShortcuts: (value: T) => void,
  defaultValue: T,
): T {
  // Migrate from the legacy keyboard shortcut format
  const ambiguousShortcuts = currentShortcuts as
    | KeyboardShortcuts
    | undefined
    | LegacyKeyboardShortcuts;
  const isLegacyShortcut = React.useMemo(
    () =>
      Object.values(ambiguousShortcuts ?? {}).some((entry) => {
        const typedEntries = entry as
          | LegacyKeyboardShortcuts[keyof LegacyKeyboardShortcuts]
          | KeyboardShortcuts[keyof KeyboardShortcuts];
        return typedEntries?.some((shortcut) => typeof shortcut !== 'string');
      }),
    [ambiguousShortcuts],
  );
  const resolvedShortcut = isLegacyShortcut ? defaultValue : currentShortcuts;
  React.useEffect(() => {
    if (!isLegacyShortcut) return;
    /**
     * Main change is that before we were using event.key. Now we use
     * event.code. I could do a best effort mapping between the two, but I don't
     * want to risk leaving things in a broken state. Given that I only had 2
     * keyboard shortcuts before, seems worth the tradeoff to just unset them.
     */
    output.warn(
      `Unsetting legacy shortcut as shortcut storage format changed: `,
      currentShortcuts,
    );
    setShortcuts(defaultValue);
  }, [currentShortcuts, isLegacyShortcut, defaultValue]);

  return resolvedShortcut;
}
