import React from 'react';
import { sendRequest } from '../Background/messages';
import { useStorage } from '../../hooks/useStorage';

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
  readonly handleAuthenticate: (
    interactive: boolean,
    force?: boolean,
  ) => Promise<void>;
};

/**
 * Allow access to auth outside the hook (in ajax())
 * "unsafe" because it's not guaranteed to be defined by the time it's used
 */
let unsafeAuth: Auth | undefined = undefined;
export const unsafeGetAuth = () => unsafeAuth;

/**
 * Prevent simultaneous authentication requests
 */
let authPromise: Promise<void> | undefined = undefined;

export function AuthenticationProvider({
  children,
}: {
  readonly children: React.ReactNode;
}): JSX.Element {
  const [token, setToken] = useStorage('token');

  const handleAuthenticate = React.useCallback(
    async (interactive: boolean, force = false) => {
      authPromise ??= sendRequest('Authenticate', {
        interactive,
        oldToken: force ? unsafeAuth?.token : undefined,
      })
        .then(({ token }) => {
          setToken(token);
          // Make new token available sooner (next re-render is too late for ajax())
          if (unsafeAuth !== undefined) unsafeAuth = { ...unsafeAuth, token };
        })
        .finally(() => (authPromise = undefined));
      return authPromise;
    },
    [],
  );

  const auth = React.useMemo(
    () => ({
      token,
      handleAuthenticate,
    }),
    [token, handleAuthenticate],
  );
  unsafeAuth = auth;

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}
