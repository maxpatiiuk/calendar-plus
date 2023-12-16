import React from 'react';

import { useStorage } from '../../hooks/useStorage';
import { ajax } from '../../utils/ajax';
import { AuthContext } from './AuthContext';

/**
 * Holds relevant user's Google Calendar settings. Can be expanded in the future
 */
export const SettingsContext = React.createContext<UserSettings>({
  weekStart: 0,
});
SettingsContext.displayName = 'SettingsContext';

type UserSettings = {
  readonly weekStart: number;
};

export function SettingsProvider({
  children,
}: {
  readonly children: React.ReactNode;
}): JSX.Element {
  const { token } = React.useContext(AuthContext);
  const [weekStart = 0, setWeekStart] = useStorage('weekStart');
  React.useEffect(() => {
    if (token === undefined) return;
    ajax('https://www.googleapis.com/calendar/v3/users/me/settings/weekStart')
      .then<{ readonly value: string }>(async (response) => response.json())
      .then(({ value }) =>
        typeof value === 'string'
          ? setWeekStart(Number.parseInt(value))
          : undefined,
      )
      .catch(console.error);
  }, [token, setWeekStart]);

  const userSettings = React.useMemo(
    () => ({
      weekStart,
    }),
    [weekStart],
  );

  return (
    <SettingsContext.Provider value={userSettings}>
      {children}
    </SettingsContext.Provider>
  );
}
