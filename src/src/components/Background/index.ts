import { emitEvent, Requests } from './messages';
import { State } from 'typesafe-reducer';

// Based on https://stackoverflow.com/a/50548409/8584605
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo) {
  if (changeInfo?.status === 'complete')
    emitEvent(tabId, { type: 'TabUpdate' }).catch(console.trace);
});

chrome.action.onClicked.addListener(function () {
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
      request.request as undefined
    )
      .then(sendResponse)
      .catch(console.error);
    return true;
  }
  return undefined;
});

/**
 * Handlers for the front-end requests
 */
const requestHandlers: {
  readonly [TYPE in Requests['type']]: (
    request: Extract<Requests, State<TYPE>>['request']
  ) => Promise<Extract<Requests, State<TYPE>>['response']>;
} = {
  Authenticate: ({ interactive }) =>
    new Promise((resolve, reject) =>
      chrome.identity.getAuthToken({ interactive }, (token) =>
        typeof token === 'string'
          ? resolve({ token })
          : reject(chrome.runtime.lastError)
      )
    ),
  ReloadExtension: () =>
    new Promise((resolve) => {
      chrome.tabs.reload();
      chrome.runtime.reload();
      resolve(undefined);
    }),
};

export {};
