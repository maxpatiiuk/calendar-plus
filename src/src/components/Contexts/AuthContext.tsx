import React from 'react';

import { sendRequest } from '../Background/messages';

type Authenticated = {
  readonly authenticated: true;
  readonly token: string;
};

type NotAuthenticated = {
  readonly authenticated: false;
  readonly handleAuthenticate: () => Promise<void>;
};

type Auth = Authenticated | NotAuthenticated;

let unsafeToken: string | undefined = undefined;
export const unsafeGetToken = () => unsafeToken;

export function AuthenticationProvider({
  children,
}: {
  readonly children: React.ReactNode;
}): JSX.Element {
  const handleAuthenticate = React.useCallback(
    async (interactive = true) =>
      sendRequest('Authenticate', { interactive })
        .then(({ token }) => {
          if (typeof token === 'string') {
            unsafeToken = token;
            setAuth({
              authenticated: true,
              token,
            });
          } else console.warn('Authentication canceled');
        })
        .catch(console.error),
    []
  );
  React.useEffect(() => void handleAuthenticate(false), [handleAuthenticate]);

  const [auth, setAuth] = React.useState<Auth>({
    authenticated: false,
    handleAuthenticate,
  });
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export const AuthContext = React.createContext<Auth>({
  authenticated: false,
  handleAuthenticate: () => {
    throw new Error('AuthContext is not defined');
  },
});
AuthContext.displayName = 'AuthContext';
