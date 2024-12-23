import React from 'react';

import { useStorage } from '../../hooks/useStorage';
import { listen } from '../../utils/events';
import { f } from '../../utils/functools';
import { mainElement, useMainContainer } from '../Molecules/Portal';
import { usePref } from '../Preferences/usePref';
import { setMainChangeListener } from '../Molecules/mainListener';
import { throttle } from '../../utils/utils';

/**
 * Ghosted events are displayed as semi-transparent and non-clickable
 *
 * Handles ghosting events (by name) and allow to ghost additional events
 */
export function GhostEvents(): null {
  const [ghostEvents = [], setGhostEvents] = useStorage('ghostEvents');

  const [ghostEventShortcut] = usePref('feature', 'ghostEventShortcut');
  const [ghostEventOpacity] = usePref('feature', 'ghostEventOpacity');

  // This allows for a way to temporary disable event ghosting
  const isDisabled = ghostEventShortcut === 'none';

  React.useEffect(() => {
    document.body.classList.toggle('ghosting-enabled', !isDisabled);
    document.body.style.setProperty(
      '--event-ghosting-opacity',
      (ghostEventOpacity / 100).toString(),
    );
  }, [ghostEventOpacity, isDisabled]);

  const doGhosting = React.useRef<() => void>(console.error);
  doGhosting.current = (): void =>
    void Array.from(
      mainElement?.querySelectorAll('[role="gridcell"] [role="button"]') ?? [],
      (element) =>
        ghostEventsRef.current.has(getEventName(element))
          ? element.classList.add('ghosted')
          : undefined,
    );
  React.useEffect(
    () => setMainChangeListener(throttle(() => doGhosting.current(), 60)),
    [],
  );

  const ghostEventsRef = React.useRef(new Set());
  React.useEffect(() => {
    ghostEventsRef.current = new Set(ghostEvents);
    doGhosting.current();
  }, [ghostEvents]);

  const mainContainer = useMainContainer();
  // Listen for key press
  React.useEffect(
    () =>
      ghostEventShortcut === 'none' || mainContainer === undefined
        ? undefined
        : listen(
            mainContainer,
            'click',
            ({ shiftKey, ctrlKey, metaKey, target }) => {
              const keys = {
                shift: shiftKey,
                ctrl: ctrlKey,
                cmd: metaKey,
              };
              if (!keys[ghostEventShortcut]) return;
              const isSingleKey =
                [shiftKey, ctrlKey, metaKey].filter(Boolean).length === 1;
              if (!isSingleKey) return;
              const eventElement = (target as HTMLElement).closest(
                '[data-eventid]',
              );
              if (eventElement === null) return;
              const eventName = getEventName(eventElement) ?? '';
              if (eventName.length === 0) return;
              setGhostEvents(f.unique([...ghostEvents, eventName].sort()));
            },
          ),
    [mainContainer, ghostEventShortcut, ghostEvents, setGhostEvents],
  );

  return null;
}

const getEventName = (eventElement: Element): string | undefined =>
  eventElement.querySelectorAll('span')[1]?.textContent?.trim();
