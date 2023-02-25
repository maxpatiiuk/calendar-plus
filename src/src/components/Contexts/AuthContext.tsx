import React from 'react';
import { ajax } from '../../utils/ajax';

import { sendRequest } from '../Background/messages';

type Auth = {
  readonly token: string | undefined;
  readonly weekStart: Number | undefined;
  readonly handleAuthenticate: (interactive: boolean) => Promise<void>;
};

let unsafeToken: string | undefined = undefined;
export const unsafeGetToken = () => unsafeToken;

export function AuthenticationProvider({
  children,
}: {
  readonly children: React.ReactNode;
}): JSX.Element {
  const [token, setToken] = React.useState<string | undefined>(undefined);
  const [weekStart, setWeekStart] = React.useState<Number | undefined>(
    undefined
  );
  const handleAuthenticate = React.useCallback(
    async (interactive: boolean) =>
      sendRequest('Authenticate', { interactive })
        .then(({ token }) => {
          if (typeof token === 'string') {
            unsafeToken = token;
            if (!weekStart) {
              ajax(
                'https://www.googleapis.com/calendar/v3/users/me/settings/weekStart'
              ).then((res) => {
                console.log('inres');
                res.json().then((val) => {
                  console.log(val);
                  if (typeof val['value'] === 'string') {
                    console.log('good');
                    let wstart: Number = new Number(val['value']);
                    console.log(wstart);
                    setWeekStart(wstart);
                  }
                });
              });
            }
            setToken(token);
          } else console.warn('Authentication canceled');
        })
        .catch(console.error),
    []
  );
  React.useEffect(() => void handleAuthenticate(false), [handleAuthenticate]);

  const auth = React.useMemo(
    () => ({
      token,
      weekStart,
      handleAuthenticate,
    }),
    [token, weekStart, handleAuthenticate]
  );
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export const AuthContext = React.createContext<Auth>({
  token: undefined,
  weekStart: 0, // Default to start sunday
  handleAuthenticate: () => {
    throw new Error('AuthContext is not defined');
  },
});
AuthContext.displayName = 'AuthContext';
