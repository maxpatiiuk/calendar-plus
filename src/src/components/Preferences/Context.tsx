import React from 'react';

import type { GetSet } from '../../utils/types';
import type { UserPreferences } from './helpers';
import { useStorage } from '../../hooks/useStorage';

export function PreferencesProvider({
  children,
}: {
  readonly children: React.ReactNode;
}): JSX.Element {
  const preferences = useStorage('preferences', {});
  const nonNullPreferences =
    preferences[0] === undefined
      ? ([{}, () => {}] as const)
      : (preferences as GetSet<UserPreferences>);
  return (
    <PreferencesContext.Provider value={nonNullPreferences}>
      {children}
    </PreferencesContext.Provider>
  );
}

export const PreferencesContext = React.createContext<GetSet<UserPreferences>>([
  {},
  () => {},
]);
PreferencesContext.displayName = 'PreferencesContext';
