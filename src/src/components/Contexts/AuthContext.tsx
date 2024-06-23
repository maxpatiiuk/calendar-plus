import React from 'react';
import { sendRequest } from '../Background/messages';
import { useStorage } from '../../hooks/useStorage';
import { output } from '../Errors/exceptions';

/**
 * Holds user token (if authenticated) and callback to authenticate
 */
export const AuthContext = React.createContext<Auth>({
  token: undefined,
  handleAuthenticate: () => output.throw('AuthContext is not defined'),
});
AuthContext.displayName = 'AuthContext';

type Auth = {
  readonly token: string | undefined;
  readonly handleAuthenticate: () => Promise<void>;
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
  const [refreshToken, setRefreshToken] = useStorage('refreshToken');

  const handleAuthenticate = React.useCallback(async () => {
    function resolve({
      accessToken,
      refreshToken,
    }: {
      readonly accessToken: string;
      readonly refreshToken?: string;
    }) {
      setToken(accessToken);
      if (typeof refreshToken === 'string') setRefreshToken(refreshToken);
      // Make new token available sooner (next re-render is too late for ajax())
      if (unsafeAuth !== undefined)
        unsafeAuth = { ...unsafeAuth, token: accessToken };
    }

    const oldToken = unsafeAuth?.token;

    const authenticate = () =>
      sendRequest('Authenticate', { oldToken }).then(resolve);

    authPromise ??= (
      typeof refreshToken === 'string'
        ? sendRequest('RefreshToken', { refreshToken, oldToken })
            .then(resolve)
            .catch((error) => {
              output.error(error);
              return authenticate();
            })
        : authenticate()
    ).finally(() => {
      authPromise = undefined;
    });

    return authPromise;
  }, [refreshToken]);

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
