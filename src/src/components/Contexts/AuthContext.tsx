import React from 'react';
import { sendRequest } from '../Background/messages';

/**
 * Holds user token (if authenticated) and callback to authenticate
 */
export const AuthContext = React.createContext<Auth>({
  token: undefined,
  handleAuthenticate: () => {
    throw new Error('AuthContext is not defined');
  },
});
AuthContext.displayName = 'AuthContext';

type Auth = {
  readonly token: string | undefined;
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

  const handleAuthenticate = React.useCallback(
    async (interactive: boolean) =>
      sendRequest('Authenticate', { interactive }).then(({ token, error }) => {
        if (typeof token === 'string') {
          unsafeToken = token;
          setToken(token);
          return;
        } else if (error === 'The user is not signed in.') {
          console.log(error);
          return;
        }
        throw new Error(error || 'Authentication canceled');
      }),
    [],
  );
  React.useEffect(() => void handleAuthenticate(false), [handleAuthenticate]);

  const auth = React.useMemo(
    () => ({
      token,
      handleAuthenticate,
    }),
    [token, handleAuthenticate],
  );
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}
