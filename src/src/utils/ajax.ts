import { IR, RA } from './types';
import { unsafeGetAuth } from '../components/Contexts/AuthContext';
import { output } from '../components/Errors/exceptions';

const http = {
  notAuthorized: 401,
} as const;

/**
 * All front-end network requests should go through this utility.
 *
 * Wraps native fetch in useful helpers
 *
 * @remarks
 * Requests to Google APIs automatically attach the access token
 * Automatically stringifies request body
 */
export const ajax = async (
  url: string,
  {
    retryAuth = true,
    headers,
    body,
    ...options
  }: Omit<RequestInit, 'body'> & {
    // If object is passed to body, it is stringified
    readonly body?: IR<unknown> | RA<unknown> | string | FormData;
    readonly retryAuth?: boolean;
  } = {},
): Promise<Response> =>
  fetch(url, {
    ...options,
    headers: {
      ...putToken(url),
      ...headers,
    },
    body:
      typeof body === 'object' && !(body instanceof FormData)
        ? JSON.stringify(body)
        : body,
  }).then((response) => {
    if (response.ok) return response;
    const handleAuth = unsafeGetAuth()?.handleAuthenticate;
    if (
      response.status === http.notAuthorized &&
      retryAuth &&
      typeof handleAuth === 'function'
    ) {
      output.log('Unauthorized, retrying with new token');
      return handleAuth().then(() =>
        ajax(url, { ...options, body, headers, retryAuth: false }),
      );
    }

    return output.throw(
      `Failed to fetch ${url}: ${response.status} ${response.statusText}`,
    );
  });

/**
 * Include Google OAuth token if needed
 */
function putToken(url: string): { readonly Authorization: string } | undefined {
  if (isGoogleApiUrl(url)) {
    const token = unsafeGetAuth()?.token;
    if (token === undefined)
      return output.throw(
        `Tried to access Google API before authentication: ${url}`,
      );
    else return { Authorization: `Bearer ${token}` };
  } else return undefined;
}

/**
 * Check if URL belongs to a Google API
 */
const isGoogleApiUrl = (url: string): boolean =>
  new URL(url, globalThis.location.origin).origin ===
  'https://www.googleapis.com';
