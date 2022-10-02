/**
 * Message passing utils. Used both by the context and background scripts
 */

import { State } from 'typesafe-reducer';

type AuthenticateRequest = State<
  'Authenticate',
  {
    readonly request: {
      readonly interactive: boolean;
    };
    readonly response: {
      readonly token: string | undefined;
    };
  }
>;

type ReloadExtension = State<
  'ReloadExtension',
  {
    readonly request: undefined;
    readonly response: undefined;
  }
>;

export type Requests = AuthenticateRequest | ReloadExtension;

/**
 * Send a request to the background script and await the response.
 * Should be called from the content script
 */
export const sendRequest = async <TYPE extends Requests['type']>(
  type: TYPE,
  request: Extract<Requests, State<TYPE>>['request']
): Promise<Extract<Requests, State<TYPE>>['response']> =>
  // This function has a lot of overloads, which confuses TypeScript
  chrome.runtime.sendMessage<unknown, void>({
    type,
    request,
  }) as unknown as Promise<Extract<Requests, State<TYPE>>['response']>;

type TabUpdate = State<'TabUpdate'>;
type BackgroundEvents = TabUpdate;

/**
 * Emit an event. Must be called from a background script only
 */
export function emitEvent(
  tabId: number,
  response: BackgroundEvents
): Promise<void> {
  if (chrome.tabs === undefined)
    throw new Error('This must only be called from the background script');
  return chrome.tabs.sendMessage(tabId, response);
}

/**
 * Listen for an event emitted by the background script.
 * Call this from the content script.
 */
export function listenEvent<TYPE extends BackgroundEvents['type']>(
  type: TYPE,
  callback: (payload: BackgroundEvents & State<TYPE>) => void
): () => void {
  const handleUpdate = (event: BackgroundEvents & State<TYPE>) =>
    typeof event === 'object' && event !== null && event.type === type
      ? callback(event)
      : undefined;

  chrome.runtime.onMessage.addListener(handleUpdate);
  return (): void => chrome.runtime.onMessage.removeListener(handleUpdate);
}
