export function listen<EVENT_NAME extends keyof GlobalEventHandlersEventMap>(
  element: EventTarget,
  eventName: EVENT_NAME,
  callback: (event: GlobalEventHandlersEventMap[EVENT_NAME]) => void,
  catchAll = false
): () => void {
  element.addEventListener(
    eventName,
    callback as (event: Event) => void,
    catchAll
  );
  return (): void =>
    element.removeEventListener(
      eventName,
      callback as (event: Event) => void,
      catchAll
    );
}
