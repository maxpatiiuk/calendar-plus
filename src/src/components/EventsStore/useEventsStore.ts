import React from 'react';

import { useStorage } from '../../hooks/useStorage';
import type { RawEventsStore } from './index';
import { cacheEvents } from './index';

const eventsStoreVersion = '4';

/**
 * Fetch computed event durations from cache and update cache on any changes
 */
export function useEventsStore():
  | React.MutableRefObject<RawEventsStore>
  | undefined {
  const [eventsStore, setEventsStore] = useStorage(
    'events',
    {},
    'local',
    eventsStoreVersion
  );
  const eventsStoreRef = React.useRef<RawEventsStore>({});
  eventsStoreRef.current = eventsStore ?? {};

  React.useEffect(
    () =>
      cacheEvents.on('loaded', () => setEventsStore(eventsStoreRef.current)),
    [setEventsStore]
  );

  return eventsStore === undefined ? undefined : eventsStoreRef;
}
