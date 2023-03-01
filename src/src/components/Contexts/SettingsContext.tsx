import React from 'react';
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
  const authContext = React.useContext(AuthContext);
  const [weekStart, setWeekStart] = React.useState<number>(0);
  const [found, setFound] = React.useState<boolean>(false);

  // If the token has been set, try an update
  // Also make sure we havent already fetched
  if (authContext.token && !found) {
    ajax(
      'https://www.googleapis.com/calendar/v3/users/me/settings/weekStart'
    ).then((res) => {
      res.json().then((val) => {
        if (typeof val['value'] === 'string') {
          let wstart = new Number(val['value']) as number;
          setWeekStart(wstart);
          setFound(true);
        }
      });
    });
  }

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
  weekStart: 0 as number,
});
SettingsContext.displayName = 'SettingsContext';
