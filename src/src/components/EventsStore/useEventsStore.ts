import React from 'react';

import { useAsyncState } from '../../hooks/useAsyncState';
import { setDevelopmentGlobal } from '../../utils/types';
import type { RawEventsStore } from './index';
import { cacheEvents } from './index';

/**
 * Fetch computed event durations from cache and update cache on any changes
 */
export function useEventsStore():
  | React.MutableRefObject<RawEventsStore>
  | undefined {
  const [isLoaded] = useAsyncState(
    React.useCallback(
      async () =>
        chrome.storage.local.get('events').then(({ events }) => {
          eventsStoreRef.current = (events as RawEventsStore | undefined) ?? {};
          setDevelopmentGlobal('_eventsStore', eventsStoreRef.current);
          return true;
        }),
      []
    ),
    false
  );

  React.useEffect(
    () =>
      cacheEvents.on('changed', async () =>
        chrome.storage.local
          .set({
            events: eventsStoreRef.current,
          })
          .catch(console.error)
      ),
    []
  );

  const eventsStoreRef = React.useRef<RawEventsStore>({});
  return isLoaded === true ? eventsStoreRef : undefined;
}
