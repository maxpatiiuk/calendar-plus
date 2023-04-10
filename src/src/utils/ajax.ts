import { IR, RA } from './types';
import { unsafeGetToken } from '../components/Contexts/AuthContext';

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
    headers,
    body,
    ...options
  }: Omit<RequestInit, 'body'> & {
    // If object is passed to body, it is stringified
    readonly body?: IR<unknown> | RA<unknown> | string | FormData;
  } = {}
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
    if (!response.ok) {
      console.error('Failed to fetch', response);
      throw new Error(
        `Failed to fetch ${url}: ${response.status} ${response.statusText}`
      );
    } else return response;
  });

/**
 * Include Google OAuth token if needed
 */
function putToken(url: string): { readonly Authorization: string } | undefined {
  if (isGoogleApiUrl(url)) {
    const token = unsafeGetToken();
    if (token === undefined)
      throw new Error(
        `Tried to access Google API before authentication: ${url}`
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
