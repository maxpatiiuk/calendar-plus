import React from 'react';

import type { StorageDefinitions } from '../../hooks/useStorage';
import { useSimpleStorage } from '../../hooks/useStorage';
import type { GetSet } from '../../utils/types';

export function VersionsContextProvider({
  children,
}: {
  readonly children: React.ReactNode;
}): JSX.Element {
  const value = useSimpleStorage('storageVersions', {});
  return (
    <VersionsContext.Provider value={value}>
      {children}
    </VersionsContext.Provider>
  );
}

export const VersionsContext = React.createContext<
  GetSet<StorageDefinitions['storageVersions'] | undefined>
>([
  {},
  () => {
    throw new Error('VersionsContext setter is not defined');
  },
]);
VersionsContext.displayName = 'VersionsContext';
