/**
 * This is run in the background (service worker) to support the extension.
 */

import type { State } from 'typesafe-reducer';

import type { Requests } from './messages';
import { emitEvent } from './messages';
import { formatUrl } from '../../utils/queryString';

/** Based on https://stackoverflow.com/a/50548409/8584605 */
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo?.status === 'complete')
    emitEvent(tabId, { type: 'TabUpdate' }).catch(console.trace);
});

chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({ url: 'https://calendar.google.com' });
});

/**
 * Listen for a message from the front-end and send back the response
 */
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (
    typeof request === 'object' &&
    request !== null &&
    request.type in requestHandlers
  ) {
    requestHandlers[request.type as 'ReloadExtension'](
      request.request as undefined,
    )
      .then(sendResponse)
      .catch((error) => {
        console.error(error);
        sendResponse({ type: 'Error', error: error.message });
      });
    return true;
  }
  return undefined;
});

/**
 * Handlers for the front-end requests
 */
const requestHandlers: {
  readonly [TYPE in Requests['type']]: (
    request: Extract<Requests, State<TYPE>>['request'],
  ) => Promise<Extract<Requests, State<TYPE>>['response']>;
} = {
  async Authenticate({ interactive, oldToken }) {
    if (typeof oldToken === 'string')
      chrome.identity.removeCachedAuthToken({ token: oldToken });

    const redirectUrl = chrome.identity.getRedirectURL();

    // For protection against CSRF attacks
    const state = Math.random().toString().slice(2);
    const authUrl = formatUrl(`https://accounts.google.com/o/oauth2/v2/auth`, {
      client_id:
        '626996674772-vjva8ps72tr51cb92q3ragsqsg15br6f.apps.googleusercontent.com',
      redirect_uri: redirectUrl,
      response_type: 'token',
      scope: 'https://www.googleapis.com/auth/calendar.readonly',
      state,
    });

    const callbackUrl = await chrome.identity.launchWebAuthFlow({
      url: authUrl,
      interactive,
    });
    if (callbackUrl === undefined)
      throw new Error('Authentication was canceled');

    // callbackUrl looks like this:
    // https://kgbbebdcmdgkbopcffmpgkgcmcoomhmh.chromiumapp.org/#state=9534841398505214&access_token=REDACTED&token_type=Bearer&expires_in=3599&scope=https://www.googleapis.com/auth/calendar.readonly
    const parametersString = new URL(callbackUrl).hash.slice(1);
    // Parse hash as a query string
    const parameters = new URL(`?${parametersString}`, globalThis.origin)
      .searchParams;

    const returnedState = parameters.get('state');
    const token = parameters.get('access_token');
    if (state !== returnedState || typeof token !== 'string')
      throw new Error('Authentication failed');

    return { token };
  },
  ReloadExtension: async () =>
    new Promise((resolve) => {
      chrome.tabs.reload();
      chrome.runtime.reload();
      resolve(undefined);
    }),
};
