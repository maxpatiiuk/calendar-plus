import React from 'react';

import type { WidgetDefinition } from '../components/Dashboard';
import type { Goal } from '../components/Goals/Widget';
import type { UserPreferences } from '../components/Preferences/helpers';
import type { GetSet, RA } from '../utils/types';
import { setDevelopmentGlobal } from '../utils/types';
import { useAsyncState } from './useAsyncState';

type StorageDefinitions = {
  readonly layout: RA<WidgetDefinition>;
  readonly goals: RA<Goal>;
  readonly preferences: UserPreferences;
};

export function useStorage<NAME extends keyof StorageDefinitions>(
  name: NAME,
  defaultValue: StorageDefinitions[NAME]
): GetSet<StorageDefinitions[NAME] | undefined> {
  const [value, setValue] = useAsyncState<StorageDefinitions[NAME]>(
    React.useCallback(
      async () =>
        chrome.storage.sync.get(name).then((storage) => {
          const value = storage[name];
          setDevelopmentGlobal(`_${name}`, value);
          return (
            (value as StorageDefinitions[NAME] | undefined) ?? defaultValue
          );
        }),
      [name]
    ),
    false
  );

  return [
    value,
    React.useCallback(
      (value) => {
        chrome.storage.sync
          .set({
            [name]: value,
          })
          .catch(console.error);
        setValue(value);
      },
      [name]
    ),
  ];
}
