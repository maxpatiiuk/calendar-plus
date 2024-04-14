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

const authBackendUrl = process.env.AUTH_URL;
if (authBackendUrl === undefined) throw new Error('AUTH_URL is not defined');
const googleClientId = process.env.GOOGLE_CLIENT_ID;
if (googleClientId === undefined)
  throw new Error('GOOGLE_CLIENT_ID is not defined');

/**
 * Handlers for the front-end requests
 */
const requestHandlers: {
  readonly [TYPE in Requests['type']]: (
    request: Extract<Requests, State<TYPE>>['request'],
  ) => Promise<Extract<Requests, State<TYPE>>['response']>;
} = {
  /**
   * Documentation:
   * https://developers.google.com/identity/protocols/oauth2/web-server
   */
  async Authenticate({ oldToken }) {
    if (typeof oldToken === 'string')
      chrome.identity.removeCachedAuthToken({ token: oldToken });

    // "redirectUrl" looks like this:
    // https://kgbbebdcmdgkbopcffmpgkgcmcoomhmh.chromiumapp.org/
    const redirectUrl = chrome.identity.getRedirectURL();

    // For protection against CSRF attacks
    const state = Math.random().toString().slice(2);
    const scopes = ['https://www.googleapis.com/auth/calendar.readonly'];
    const authUrl = formatUrl(`https://accounts.google.com/o/oauth2/v2/auth`, {
      client_id: googleClientId,
      redirect_uri: redirectUrl,
      response_type: 'code',
      access_type: 'offline',
      scope: scopes.join(' '),
      prompt: 'consent',
      state,
    });

    const callbackUrl = await chrome.identity.launchWebAuthFlow({
      url: authUrl,
      interactive: true,
    });
    if (callbackUrl === undefined)
      throw new Error('Authentication was canceled');

    // "callbackUrl" will look like this:
    // https://kgbbebdcmdgkbopcffmpgkgcmcoomhmh.chromiumapp.org/?state=926157865108874&code=REDACTED&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fcalendar.readonly
    const parameters = new URL(callbackUrl).searchParams;

    const returnedState = parameters.get('state');
    const code = parameters.get('code');
    const error = parameters.get('error');
    if (state !== returnedState || typeof code !== 'string')
      throw new Error(
        `Authentication failed${error === null ? '' : `: ${error}`}`,
      );

    const resolveUrl = formatUrl(authBackendUrl, {
      code,
      redirectUrl,
    });

    const response = await fetch(resolveUrl, { method: 'POST' });

    const responseText = await response.text();
    if (response.status === 200) {
      try {
        const data = JSON.parse(responseText);
        if ('access_token' in data && 'refresh_token' in data)
          return {
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
          };
        else throw new Error(`Invalid response: ${responseText}`);
      } catch (error: unknown) {
        throw new Error(`Invalid response: ${String(error)}\n${responseText}`);
      }
    }
    throw new Error(
      `Failed to authenticate: ${response.status}\n${responseText}`,
    );
  },
  async RefreshToken({ refreshToken, oldToken }) {
    if (typeof oldToken === 'string')
      chrome.identity.removeCachedAuthToken({ token: oldToken });

    const authUrl = formatUrl(authBackendUrl, {
      refreshToken,
    });

    const response = await fetch(authUrl, { method: 'POST' });

    const responseText = await response.text();
    if (response.status === 200) {
      try {
        const data = JSON.parse(responseText);
        if ('access_token' in data)
          return {
            accessToken: data.access_token,
          };
        else throw new Error(`Invalid response: ${responseText}`);
      } catch (error: unknown) {
        throw new Error(`Invalid response: ${String(error)}\n${responseText}`);
      }
    }
    throw new Error(
      `Failed to authenticate: ${response.status}\n${responseText}`,
    );
  },
  ReloadExtension: async () =>
    new Promise((resolve) => {
      chrome.tabs.reload();
      chrome.runtime.reload();
      resolve(undefined);
    }),
};
