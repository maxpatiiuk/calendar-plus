/*
 * Inspired by
 * https://github.com/vercel/examples/blob/main/edge-functions/cors/pages/api/hello.ts
 */

import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function POST(request: NextRequest): Promise<Response> {
  const code = request.nextUrl.searchParams.get('code');
  if (typeof code !== 'string')
    return new Response('"code" query parameter is missing', { status: 400 });
  const clientId = process.env.GITHUB_APP_CLIENT_ID;
  const clientSecret = process.env.GITHUB_APP_CLIENT_SECRET;
  const allowOrigin = process.env.ACCESS_CONTROL_ALLOW_ORIGIN;
  if (
    typeof clientId !== 'string' ||
    typeof clientSecret !== 'string' ||
    typeof allowOrigin !== 'string'
  )
    return new Response('Environment variables are missing', { status: 500 });
  return fetch(
    formatUrl('https://github.com/login/oauth/access_token', {
      client_id: clientId,
      client_secret: clientSecret,
      code,
    }),
    { method: 'POST', headers: { Accept: 'application/json' } },
  )
    .then((response) => response.json())
    .then(
      (response: { readonly access_token: string }) => response.access_token,
    )
    .then(
      (accessToken) =>
        new Response(accessToken, {
          status: 200,
          headers: {
            'Content-Type': 'text/plain',
            'Access-Control-Allow-Origin': allowOrigin,
          },
        }),
    );
}

function formatUrl(
  url: string,
  parameters: Readonly<Record<string, string>>,
): string {
  const urlObject = new URL(url);
  urlObject.search = new URLSearchParams({
    ...Object.fromEntries(urlObject.searchParams),
    ...parameters,
  }).toString();
  return urlObject.toString();
}
