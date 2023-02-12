/*
 * Real calendar event ID length is around 74 characters, but in order to reduce
 * used storage, we store only the first 16 characters of the ID.
 */
import React from 'react';

import { useSafeStorage } from '../../hooks/useStorage';
import { listen } from '../../utils/events';
import { f } from '../../utils/functools';
import { usePref } from '../Preferences/usePref';

const trimmedIdLength = 16;
const ghostEventStyle = `{
  opacity: var(--event-ghosting-opacity);
  pointer-events: none;
}`;

export function GhostEvents(): null {
  const [ghostEvents = [], setGhostEvents] = useSafeStorage('ghostEvents', []);
  const styleRef = React.useRef<HTMLStyleElement | undefined>(undefined);
  const [ghostEventShortcut] = usePref('feature', 'ghostEventShortcut');
  const [ghostEventOpacity] = usePref('feature', 'ghostEventOpacity');

  React.useEffect(() => {
    document.body.style.setProperty(
      '--event-ghosting-opacity',
      (ghostEventOpacity / 100).toString()
    );
  }, [ghostEventOpacity]);

  React.useEffect(() => {
    styleRef.current = document.createElement('style');
    document.head.append(styleRef.current);
    return (): void => styleRef.current?.remove();
  }, []);

  // Set styles
  React.useEffect(() => {
    if (styleRef.current === undefined) return;

    // This allows for a way to temporary disable event ghosting
    const isDisabled = ghostEventShortcut === 'none';

    styleRef.current.textContent =
      isDisabled || ghostEvents.length === 0
        ? ''
        : `${ghostEvents
            .map((id) => `[data-eventid*="${id}"]`)
            .join(',')}${ghostEventStyle}`;
  }, [ghostEvents, ghostEventShortcut]);

  // Listen for key press
  React.useEffect(
    () =>
      ghostEventShortcut === 'none'
        ? undefined
        : listen(
            document.body,
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
              const eventId = eventElement.getAttribute('data-eventid') ?? '';
              if (eventId.length === 0) return;
              const trimmed = eventId.slice(0, trimmedIdLength);
              setGhostEvents(f.unique([...ghostEvents, trimmed]));
            }
          ),
    [ghostEventShortcut, ghostEvents, setGhostEvents]
  );

  return null;
}
