import React from 'react';

import type { TimeChartMode } from '../components/Charts/TimeChart';
import { VersionsContext } from '../components/Contexts/VersionsContext';
import type { Goal } from '../components/Goals/Widget';
import type { UserPreferences } from '../components/Preferences/helpers';
import type { Synonym } from '../components/Widgets/Synonyms';
import type { VirtualCalendar } from '../components/Widgets/VirtualCalendars';
import { f } from '../utils/functools';
import type { GetSet, IR, RA } from '../utils/types';
import { ensure, setDevelopmentGlobal } from '../utils/types';
import { useAsyncState } from './useAsyncState';
import { defaultCustomViewSize } from '../components/Contexts/CurrentViewContext';
import { defaultLayout } from '../components/Dashboard/definitions';

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
  overSizeStorage: {
    type: 'sync',
    defaultValue: [] as RA<string>,
  },
  storageVersions: {
    type: 'sync',
    // Keys are names of storage items
    defaultValue: {} as Partial<IR<string>>,
  },
  customViewSize: {
    type: 'sync',
    defaultValue: defaultCustomViewSize,
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
 * A wrapper for extensions Storage API (with checks for value size being over
 * quota). If value size is over quota, it automatically switches to using
 * local storage.
 */
export function useSafeStorage<NAME extends keyof StorageDefinitions>(
  name: NAME,
  version?: string
): GetSet<StorageDefinitions[NAME]['defaultValue'] | undefined> {
  const [isOverSize, setIsOverSize] = useOverSize(name);
  const type = storageDefinitions[name].type;
  const resolvedType = isOverSize ? 'local' : type;

  /**
   * If storage is switched from local to sync, remove the value from local.
   * Don't do the same for sync so as to leave the previous value available
   * for other devices.
   */
  const previousType = React.useRef(type);
  React.useEffect(() => {
    if (type === 'sync' && previousType.current === 'local')
      chrome.storage.sync.remove(name).catch(console.error);
    previousType.current = type;
  }, [name, type]);

  const [value, rawUpdateValue] = useStorage(name, resolvedType, version);
  const updateValue = React.useCallback(
    (value: StorageDefinitions[NAME]['defaultValue'] | undefined) => {
      const isNewlyOverSize = type === 'sync' && isOverSizeLimit(name, value);
      let updatedType: 'local' | 'sync' =
        resolvedType === 'local' || isNewlyOverSize ? 'local' : 'sync';
      if (resolvedType === 'sync' && isNewlyOverSize) {
        setIsOverSize(true);
        updatedType = 'local';
      } else if (
        resolvedType === 'local' &&
        type === 'sync' &&
        !isNewlyOverSize
      ) {
        setIsOverSize(false);
        updatedType = 'sync';
      }
      rawUpdateValue(value, updatedType);
    },
    [resolvedType, type, rawUpdateValue]
  );
  return React.useMemo(() => [value, updateValue], [value, updateValue]);
}

export function isOverSizeLimit(name: string, value: unknown): boolean {
  if (value === undefined) return false;
  const size = JSON.stringify({ [name]: value }).length;
  return size > chrome.storage.sync.QUOTA_BYTES_PER_ITEM;
}

/**
 * A wrapper for extensions Storage API (without checking for quota size)
 * with checks for cache version. If cache is found to be outdated, it is removed
 */
export function useStorage<NAME extends keyof StorageDefinitions>(
  name: NAME,
  type: 'local' | 'sync' = storageDefinitions[name].type,
  version?: string
): readonly [
  StorageDefinitions[NAME]['defaultValue'] | undefined,
  (
    newValue: StorageDefinitions[NAME]['defaultValue'] | undefined,
    typeOverride?: 'local' | 'sync'
  ) => void
] {
  const [value, setValue] = useSimpleStorage(name, type);

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
 * A wrapper for extensions Storage API (without checking for quota size
 * or cache version)
 */
export function useSimpleStorage<NAME extends keyof StorageDefinitions>(
  name: NAME,
  type: 'local' | 'sync' = storageDefinitions[name].type
): readonly [
  StorageDefinitions[NAME]['defaultValue'] | undefined,
  (
    newValue: StorageDefinitions[NAME]['defaultValue'] | undefined,
    typeOverride?: 'local' | 'sync'
  ) => void
] {
  const [value, setValue] = useAsyncState<
    StorageDefinitions[NAME]['defaultValue']
  >(
    React.useCallback(
      async () =>
        chrome.storage[type].get(name).then((storage) => {
          const value = storage[name];
          setDevelopmentGlobal(`_${name}`, value);
          return (
            (value as StorageDefinitions[NAME]['defaultValue'] | undefined) ??
            storageDefinitions[name].defaultValue
          );
        }),
      [name, type]
    ),
    false
  );

  const updateValue = React.useCallback(
    (
      value: StorageDefinitions[NAME]['defaultValue'] | undefined,
      typeOverride: 'local' | 'sync' = type
    ) => {
      chrome.storage[typeOverride]
        .set({
          [name]: value,
        })
        .catch(console.error);
      setValue(value);
      setDevelopmentGlobal(`_${name}`, value);
    },
    [setValue, name, type]
  );

  return [value, updateValue];
}

/**
 * Stores and indicator of whether the storage is over size or no
 */
function useOverSize(name: string): GetSet<boolean> {
  const [overSize = [], setOverSize] = useSimpleStorage('overSizeStorage');
  return [
    overSize.includes(name),
    React.useCallback(
      (isOverSize: boolean) => {
        const newArray = f.unique(
          isOverSize ? [...overSize, name] : overSize.filter((n) => n !== name)
        );
        if (newArray.length !== overSize.length) setOverSize(newArray);
      },
      [name, setOverSize, overSize]
    ),
  ];
}
