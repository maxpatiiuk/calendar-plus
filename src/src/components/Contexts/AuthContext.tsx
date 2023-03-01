import React from 'react';
import { sendRequest } from '../Background/messages';

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
      sendRequest('Authenticate', { interactive })
        .then(({ token }) => {
          if (typeof token === 'string') {
            unsafeToken = token;
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
      handleAuthenticate,
    }),
    [token, handleAuthenticate]
  );
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export const AuthContext = React.createContext<Auth>({
  token: undefined,
  handleAuthenticate: () => {
    throw new Error('AuthContext is not defined');
  },
});
AuthContext.displayName = 'AuthContext';
