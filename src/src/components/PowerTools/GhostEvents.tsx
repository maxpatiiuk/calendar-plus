/*
 * Real calendar event ID length is around 74 characters, but in order to reduce
 * used storage, we store only the first 16 characters of the ID.
 */
import React from 'react';

import { useStorage } from '../../hooks/useStorage';
import { listen } from '../../utils/events';
import { f } from '../../utils/functools';
import { useMainContainer } from '../Molecules/Portal';
import { usePref } from '../Preferences/usePref';
import { usePageListener } from './PageListener';

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
      (ghostEventOpacity / 100).toString()
    );
  }, [ghostEventOpacity, isDisabled]);

  const mainContainer = useMainContainer();
  const doGhosting = React.useCallback(
    (): void =>
      mainContainer === undefined
        ? undefined
        : void Array.from(
            mainContainer.querySelectorAll('[role="gridcell"] [role="button"]'),
            (element) =>
              ghostEventsRef.current.has(getEventName(element))
                ? element.classList.add('ghosted')
                : undefined
          ),
    [mainContainer]
  );
  usePageListener(mainContainer, doGhosting);

  const ghostEventsRef = React.useRef(new Set());
  React.useEffect(() => {
    ghostEventsRef.current = new Set(ghostEvents);
    doGhosting();
  }, [ghostEvents, doGhosting]);

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
                '[data-eventid]'
              );
              if (eventElement === null) return;
              const eventName = getEventName(eventElement) ?? '';
              if (eventName.length === 0) return;
              setGhostEvents(f.unique([...ghostEvents, eventName]));
            }
          ),
    [mainContainer, ghostEventShortcut, ghostEvents, setGhostEvents]
  );

  return null;
}

const getEventName = (eventElement: Element): string | undefined =>
  eventElement.querySelectorAll('span')[1]?.textContent?.trim();
