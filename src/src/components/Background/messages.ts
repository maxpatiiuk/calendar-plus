/**
 * Message passing utils. Used both by the content and background scripts
 */

import { State } from 'typesafe-reducer';

type AuthenticateRequest = State<
  'Authenticate',
  {
    readonly request: {
      readonly interactive: boolean;
      readonly oldToken: string | undefined;
    };
    readonly response: {
      readonly token: string;
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
export const sendRequest = async <
  TYPE extends Requests['type'],
  SHAPE extends Extract<Requests, State<TYPE>>,
>(
  type: TYPE,
  request: SHAPE['request'],
): Promise<SHAPE['response']> =>
  chrome.runtime
    .sendMessage<
      State<TYPE, { readonly request: SHAPE['request'] }>,
      SHAPE['response'] | State<'Error', { readonly error: string }>
    >({
      type,
      request,
    })
    .then((response) => {
      if (
        typeof response === 'object' &&
        response !== null &&
        'type' in response &&
        typeof response.type === 'string' &&
        response.type === 'Error' &&
        'error' in response
      ) {
        console.error(response.error);
        throw new Error(response.error);
      } else return response as SHAPE['response'];
    });

type TabUpdate = State<'TabUpdate'>;
type BackgroundEvents = TabUpdate;

/**
 * Emit an event. Must be called from a background script only
 */
export function emitEvent(
  tabId: number,
  response: BackgroundEvents,
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
  callback: (payload: BackgroundEvents & State<TYPE>) => void,
): () => void {
  const handleUpdate = (event: BackgroundEvents & State<TYPE>) =>
    typeof event === 'object' && event !== null && event.type === type
      ? callback(event)
      : undefined;

  chrome.runtime.onMessage.addListener(handleUpdate);
  return (): void => chrome.runtime.onMessage.removeListener(handleUpdate);
}
