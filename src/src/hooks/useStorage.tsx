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
import { output } from '../components/Errors/exceptions';

type StorageItem<T> = {
  readonly type: 'local' | 'sync';
  readonly defaultValue: T;
  readonly version?: string;
};

export const storageDefinitions = ensure<IR<StorageItem<unknown>>>()({
  token: {
    type: 'sync',
    defaultValue: undefined as undefined | string,
  },
  refreshToken: {
    type: 'sync',
    defaultValue: undefined as undefined | string,
  },
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
    version: '2',
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
  weekStart: {
    type: 'sync',
    defaultValue: 0 as number,
  },
  devMode: {
    type: 'sync',
    defaultValue: false as boolean,
  },
  theme: {
    // Google Calendar's theme preference is synced across devices
    type: 'sync',
    defaultValue: 'light' as 'dark' | 'light',
  },
} as const);

export type StorageDefinitions = typeof storageDefinitions;

/**
 * A wrapper for extensions Storage API with checks for cache version.
 * If cache is found to be outdated, it is removed
 */
export function useStorage<NAME extends keyof StorageDefinitions>(
  name: NAME,
): GetSet<StorageDefinitions[NAME]['defaultValue'] | undefined> {
  const [value, setValue] = useSimpleStorage(name);

  // Reset to default if cache is outdated
  const [cacheVersions, setCacheVersions] = React.useContext(VersionsContext);
  React.useLayoutEffect(() => {
    const definition = storageDefinitions[name];
    const defaultValue = definition.defaultValue;
    const version = 'version' in definition ? definition.version : undefined;
    if (
      version === undefined ||
      cacheVersions === undefined ||
      cacheVersions[name] === version
    )
      return;
    output.warn('Cache version mismatch detected', { name, cacheVersions });
    if (cacheVersions[name] === undefined) setValue(defaultValue);
    setCacheVersions({ ...cacheVersions, [name]: version });
  }, [name, cacheVersions, setCacheVersions, setValue]);

  return [value, setValue];
}

/**
 * A wrapper for extensions Storage API (without checking for cache version)
 */
function useSimpleStorage<NAME extends keyof StorageDefinitions>(
  name: NAME,
): GetSet<StorageDefinitions[NAME]['defaultValue'] | undefined> {
  const type = storageDefinitions[name].type;
  const adapter = storageAdapters[type];

  const fetchValue = React.useCallback(
    async () => await adapter.get(name),
    [name, adapter],
  );

  const [value, setValue] = useAsyncState<
    StorageDefinitions[NAME]['defaultValue']
  >(fetchValue, false);
  const currentValue = React.useRef(value);
  currentValue.current = value;

  // Listen for changes
  React.useEffect(() => {
    let destructorCalled = false;
    function callback(changes: IR<chrome.storage.StorageChange>): void {
      const changed = Object.keys(changes).some(
        (key) => key.split('_')[0] === name,
      );
      if (!changed) return;
      // LOW: possible race condition here
      fetchValue()
        .then((value) => (destructorCalled ? undefined : setValue(value)))
        .catch(output.error);
    }
    chrome.storage[type].onChanged.addListener(callback);
    return (): void => {
      destructorCalled = true;
      chrome.storage[type].onChanged.removeListener(callback);
    };
  }, [name, type]);

  const updateValue = React.useCallback(
    (value: StorageDefinitions[NAME]['defaultValue'] | undefined) => {
      if (currentValue.current === value) return;
      adapter.set(name, value).catch(output.error);
      setValue(value);
    },
    [setValue, name, adapter],
  );

  return [value, updateValue];
}

const createStorageAdapter = ({
  getValue,
  setValue,
  shouldSplit,
}: {
  getValue: (name: keyof StorageDefinitions) => Promise<unknown>;
  setValue: (values: Record<string, unknown>) => Promise<void>;
  shouldSplit: boolean;
}): Adapter => ({
  async get(name) {
    const value = await getValue(name);
    const resolvedValue =
      typeof value === 'string' && shouldSplit
        ? await joinValue(name, value, getValue)
        : value;
    setDevelopmentGlobal(`_${name}`, resolvedValue);
    return resolvedValue ?? storageDefinitions[name].defaultValue;
  },
  async set(name, value) {
    const jsonValue = JSON.stringify(value);
    const isOverLimit = shouldSplit && isOverSizeLimit(name, jsonValue);
    setDevelopmentGlobal(`_${name}`, value);
    const split = isOverLimit ? splitValue(name, jsonValue) : { [name]: value };
    const maxItem = Object.keys(split).length;
    await Promise.all([setValue(split), cleanupLooseChunks(name, maxItem + 1)]);
  },
});

type Adapter = {
  get: <NAME extends keyof StorageDefinitions>(
    name: NAME,
  ) => Promise<StorageDefinitions[NAME]['defaultValue'] | undefined>;
  set: <NAME extends keyof StorageDefinitions>(
    name: NAME,
    value: StorageDefinitions[NAME]['defaultValue'] | undefined,
  ) => Promise<void>;
};

export const storageAdapters = {
  local: createStorageAdapter({
    getValue: (name) => chrome.storage.local.get(name).then((x) => x[name]),
    setValue: (values) => chrome.storage.local.set(values),
    shouldSplit: false,
  }),
  sync: createStorageAdapter({
    getValue: (name) => chrome.storage.sync.get(name).then((x) => x[name]),
    setValue: (values) => chrome.storage.sync.set(values),
    shouldSplit: true,
  }),
  object: (store: Record<string, unknown>) =>
    createStorageAdapter({
      getValue: (name) => Promise.resolve(store[name]),
      setValue(values) {
        Object.assign(store, values);
        return Promise.resolve();
      },
      shouldSplit: true,
    }),
};

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
  originalJsonValue: string,
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
  value: string,
  getValue: (name: keyof StorageDefinitions) => Promise<unknown>,
): Promise<string> {
  if (!maybeJson.includes(value[0])) return value;
  try {
    return JSON.parse(`${value}${await joinStorage(name, getValue)}`);
  } catch {
    return value;
  }
}
const maybeJson = '{["0123456789-tfn';

async function joinStorage(
  key: keyof StorageDefinitions,
  getValue: (name: keyof StorageDefinitions) => Promise<unknown>,
  index = 2,
): Promise<string> {
  const fullKey = `${key}_${index}`;
  const value = await getValue(fullKey as 'weekStart');
  return typeof value === 'string'
    ? `${value}${await joinStorage(key, getValue, index + 1)}`
    : '';
}

async function cleanupLooseChunks(
  key: keyof StorageDefinitions,
  index: number,
): Promise<void> {
  const fullKey = `${key}_${index}`;
  const { [fullKey]: value } = await chrome.storage.sync.get(fullKey);
  if (value === undefined) return;
  chrome.storage.sync.remove(fullKey);
  cleanupLooseChunks(key, index + 1);
}
