import React from 'react';
import { useAsyncState } from '../../hooks/useAsyncState';
import { setDevelopmentGlobal } from '../../utils/types';
import { cacheEvents, RawEventsStore } from './index';

/**
 * Fetch computed event durations from cache and update cache on any changes
 */
export function useEventsStore():
  | React.MutableRefObject<RawEventsStore>
  | undefined {
  const [cachedEvents] = useAsyncState(
    React.useCallback(
      () =>
        chrome.storage.local.get('events').then((events) => {
          eventsStoreRef.current =
            (events.events as RawEventsStore | undefined) ?? {};
          setDevelopmentGlobal('_eventsStore', eventsStoreRef.current);
          return eventsStoreRef.current;
        }),
      []
    ),
    false
  );

  React.useEffect(
    () =>
      cacheEvents.on('changed', () =>
        chrome.storage.local
          .set({
            events: eventsStoreRef.current,
          })
          .catch(console.error)
      ),
    []
  );

  const eventsStoreRef = React.useRef<RawEventsStore>({});
  return cachedEvents === undefined ? undefined : eventsStoreRef;
}
