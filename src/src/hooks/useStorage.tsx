import React from 'react';

import type { WidgetDefinition } from '../components/Dashboard';
import type { Goal } from '../components/Goals/Widget';
import type { UserPreferences } from '../components/Preferences/helpers';
import type { VirtualCalendar } from '../components/Widgets/VirtualCalendars';
import type { GetSet, RA } from '../utils/types';
import { setDevelopmentGlobal } from '../utils/types';
import { useAsyncState } from './useAsyncState';

type StorageDefinitions = {
  readonly layout: RA<WidgetDefinition>;
  readonly goals: RA<Goal>;
  readonly preferences: UserPreferences;
  readonly ghostEvents: RA<string>;
  readonly virtualCalendars: RA<VirtualCalendar>;
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

  const updateValue = React.useCallback(
    (value: StorageDefinitions[NAME] | undefined) => {
      chrome.storage.sync
        .set({
          [name]: value,
        })
        .catch(console.error);
      setValue(value);
      setDevelopmentGlobal(`_${name}`, value);
    },
    [name]
  );

  return React.useMemo(() => [value, updateValue], [value, updateValue]);
}
