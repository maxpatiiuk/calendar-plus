import React from 'react';

import { useStorage } from '../../hooks/useStorage';
import type { GetSet } from '../../utils/types';
import type { UserPreferences } from './helpers';
import { setDevMode } from '../Contexts/devMode';

/**
 * Hold User Preferences
 */
export const PreferencesContext = React.createContext<GetSet<UserPreferences>>([
  {},
  (): void => undefined,
]);
PreferencesContext.displayName = 'PreferencesContext';

export function PreferencesProvider({
  children,
}: {
  readonly children: React.ReactNode;
}): React.JSX.Element {
  const preferences = useStorage('preferences');
  const nonNullPreferences =
    preferences[0] === undefined
      ? ([{}, (): void => undefined] as const)
      : (preferences as GetSet<UserPreferences>);

  const [devMode = false] = useStorage('devMode');
  setDevMode(devMode);

  return (
    <PreferencesContext.Provider value={nonNullPreferences}>
      {children}
    </PreferencesContext.Provider>
  );
}
