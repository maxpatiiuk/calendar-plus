import React from 'react';

import { useAsyncState } from '../../hooks/useAsyncState';
import { ajax } from '../../utils/ajax';
import { AuthContext } from './AuthContext';

type UserSettings = {
  readonly weekStart: number;
};

export function SettingsProvider({
  children,
}: {
  readonly children: React.ReactNode;
}): JSX.Element {
  const { token } = React.useContext(AuthContext);
  const [weekStart = 0] = useAsyncState(
    React.useCallback(
      async () =>
        typeof token === 'string'
          ? ajax(
              'https://www.googleapis.com/calendar/v3/users/me/settings/weekStart'
            )
              .then<{ readonly value: string }>(async (response) =>
                response.json()
              )
              .then(({ value }) =>
                typeof value === 'string' ? Number.parseInt(value) : undefined
              )
          : undefined,
      [token]
    ),
    false
  );

  const userSettings = React.useMemo(
    () => ({
      weekStart,
    }),
    [weekStart]
  );

  return (
    <SettingsContext.Provider value={userSettings}>
      {children}
    </SettingsContext.Provider>
  );
}

export const SettingsContext = React.createContext<UserSettings>({
  weekStart: 0,
});
SettingsContext.displayName = 'SettingsContext';
