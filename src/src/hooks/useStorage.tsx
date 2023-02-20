import React from 'react';

import type { TimeChartMode } from '../components/Charts/TimeChart';
import { defaultCustomViewSize } from '../components/Contexts/CurrentViewContext';
import { VersionsContext } from '../components/Contexts/VersionsContext';
import { defaultLayout } from '../components/Dashboard/definitions';
import type { Goal } from '../components/Goals/Widget';
import type { UserPreferences } from '../components/Preferences/helpers';
import type { Synonym } from '../components/Widgets/Synonyms';
import type { VirtualCalendar } from '../components/Widgets/VirtualCalendars';
import type { GetSet, IR, R, RA } from '../utils/types';
import { ensure, setDevelopmentGlobal } from '../utils/types';
import { useAsyncState } from './useAsyncState';

type StorageItem<T> = {
  readonly type: 'local' | 'sync';
  readonly defaultValue: T;
};

export const storageDefinitions = ensure<IR<StorageItem<unknown>>>()({
  layout: {
    type: 'sync',
    defaultValue: defaultLayout,
  },
  goals: {
    type: 'sync',
    defaultValue: [] as RA<Goal>,
  },
  preferences: {
    type: 'sync',
    defaultValue: {} as UserPreferences,
  },
  ghostEvents: {
    type: 'sync',
    defaultValue: [] as RA<string>,
  },
  virtualCalendars: {
    type: 'sync',
    defaultValue: [] as RA<VirtualCalendar>,
  },
  storageVersions: {
    type: 'sync',
    // Keys are names of storage items
    defaultValue: {} as Partial<IR<string>>,
  },
  customViewSize: {
    type: 'sync',
    defaultValue: defaultCustomViewSize as number,
  },
  timeChartMode: {
    type: 'sync',
    defaultValue: 'total' as TimeChartMode,
  },
  synonyms: {
    type: 'sync',
    defaultValue: [] as RA<Synonym>,
  },
  visibleCalendars: {
    type: 'local',
    defaultValue: [] as RA<string>,
  },
} as const);

export type StorageDefinitions = typeof storageDefinitions;

/**
 * A wrapper for extensions Storage API with checks for cache version.
 * If cache is found to be outdated, it is removed
 */
export function useVersionedStorage<NAME extends keyof StorageDefinitions>(
  name: NAME,
  version?: string
): GetSet<StorageDefinitions[NAME]['defaultValue'] | undefined> {
  const [value, setValue] = useStorage(name);

  // Reset to default if cache is outdated
  const [cacheVersions, setCacheVersions] = React.useContext(VersionsContext);
  React.useLayoutEffect(() => {
    const defaultValue = storageDefinitions[name].defaultValue;
    if (cacheVersions === undefined || cacheVersions[name] === version) return;
    console.log('Cache version mismatch detected', { name, cacheVersions });
    if (cacheVersions[name] === undefined) setValue(defaultValue);
    setCacheVersions({ ...cacheVersions, [name]: version });
  }, [name, cacheVersions, version, setCacheVersions, setValue]);

  return [value, setValue];
}

/**
 * A wrapper for extensions Storage API (without checking for cache version)
 */
export function useStorage<NAME extends keyof StorageDefinitions>(
  name: NAME
): GetSet<StorageDefinitions[NAME]['defaultValue'] | undefined> {
  const type = storageDefinitions[name].type;
  const [value, setValue] = useAsyncState<
    StorageDefinitions[NAME]['defaultValue']
  >(
    React.useCallback(
      async () =>
        chrome.storage[type].get(name).then(async (storage) => {
          const value = storage[name];
          const resolvedValue =
            typeof value === 'string' && type === 'sync'
              ? await joinValue(name, value)
              : value;
          setDevelopmentGlobal(`_${name}`, resolvedValue);
          return (
            (resolvedValue as
              | StorageDefinitions[NAME]['defaultValue']
              | undefined) ?? storageDefinitions[name].defaultValue
          );
        }),
      [name, type]
    ),
    false
  );

  const updateValue = React.useCallback(
    (value: StorageDefinitions[NAME]['defaultValue'] | undefined) => {
      const jsonValue = JSON.stringify(value);
      const isOverLimit = type === 'sync' && isOverSizeLimit(name, jsonValue);
      setDevelopmentGlobal(`_${name}`, value);
      setValue(value);
      if (isOverLimit)
        chrome.storage.sync
          .set(splitValue(name, jsonValue))
          .catch(console.error);
      else
        chrome.storage[type]
          .set({
            [name]: value,
          })
          .catch(console.error);
    },
    [setValue, name, type]
  );

  return [value, updateValue];
}

/**
 * "sync" storage has item size limit :(
 * "local" does not
 */
export function isOverSizeLimit(name: string, value: string): boolean {
  if (value === undefined) return false;
  const size = JSON.stringify({ [name]: value }).length;
  return size > chrome.storage.sync.QUOTA_BYTES_PER_ITEM;
}

/**
 * Loosely based on https://stackoverflow.com/a/68427736/8584605
 */
function splitValue(
  key: keyof StorageDefinitions,
  originalJsonValue: string
): IR<string> {
  let jsonValue = originalJsonValue;
  const storageObject: R<string> = {};
  for (let index = 0; jsonValue.length > 0; index += 1) {
    const fullKey = index === 0 ? key : `${key}_${index + 1}`;

    const maxLength =
      chrome.storage.sync.QUOTA_BYTES_PER_ITEM - fullKey.length - 2;
    const splitLength = Math.min(jsonValue.length, maxLength);

    let segment = jsonValue.slice(0, splitLength);
    const jsonLength = JSON.stringify(segment).length;
    const overSize = jsonLength - maxLength;
    if (overSize > 0) segment = jsonValue.slice(0, splitLength - overSize);

    storageObject[fullKey] = segment;
    jsonValue = jsonValue.slice(segment.length);
  }
  return storageObject;
}

async function joinValue(
  name: keyof StorageDefinitions,
  value: string
): Promise<string> {
  try {
    return JSON.parse(`${value}${await joinStorage(name)}`);
  } catch {
    return value;
  }
}

async function joinStorage(
  key: keyof StorageDefinitions,
  index = 2
): Promise<string> {
  const fullKey = `${key}_${index}`;
  const { [fullKey]: value } = await chrome.storage.sync.get(fullKey);
  return typeof value === 'string'
    ? `${value}${await joinStorage(key, index + 1)}`
    : '';
}
