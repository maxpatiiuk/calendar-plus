/**
 * A wrapper for `addEventListener` that returns a destructor for convenient
 * usage in useEffect
 */
export function listen<EVENT_NAME extends keyof GlobalEventHandlersEventMap>(
  element: EventTarget,
  eventName: EVENT_NAME,
  callback: (event: GlobalEventHandlersEventMap[EVENT_NAME]) => void,
  options?: AddEventListenerOptions,
): () => void {
  element.addEventListener(
    eventName,
    callback as (event: Event) => void,
    options,
  );
  return (): void =>
    element.removeEventListener(
      eventName,
      callback as (event: Event) => void,
      options,
    );
}
