import { GetSet, RA, setDevelopmentGlobal } from '../utils/types';
import { WidgetDefinition } from '../components/Dashboard';
import { useAsyncState } from './useAsyncState';
import React from 'react';
import { Goal } from '../components/Goals/Widget';

type StorageDefinitions = {
  readonly layout: RA<WidgetDefinition>;
  readonly goals: RA<Goal>;
};

export function useStorage<NAME extends keyof StorageDefinitions>(
  name: NAME,
  defaultValue: StorageDefinitions[NAME]
): GetSet<StorageDefinitions[NAME] | undefined> {
  const [value, setValue] = useAsyncState<StorageDefinitions[NAME]>(
    React.useCallback(
      () =>
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
