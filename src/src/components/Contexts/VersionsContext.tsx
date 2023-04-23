import React from 'react';

import type { StorageDefinitions } from '../../hooks/useStorage';
import { useStorage } from '../../hooks/useStorage';
import type { GetSet } from '../../utils/types';

/**
 * Powers storage versioning. Stores current versions of different storage keys
 */
export const VersionsContext = React.createContext<
  GetSet<StorageDefinitions['storageVersions']['defaultValue'] | undefined>
>([
  {},
  () => {
    throw new Error('VersionsContext setter is not defined');
  },
]);
VersionsContext.displayName = 'VersionsContext';

export function VersionsContextProvider({
  children,
}: {
  readonly children: React.ReactNode;
}): JSX.Element {
  const value = useStorage('storageVersions');
  return (
    <VersionsContext.Provider value={value}>
      {children}
    </VersionsContext.Provider>
  );
}
