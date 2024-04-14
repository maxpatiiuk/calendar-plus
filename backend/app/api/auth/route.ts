/*
 * Inspired by
 * https://github.com/vercel/examples/blob/main/edge-functions/cors/pages/api/hello.ts
 */

import { NextRequest } from 'next/server';

export const runtime = 'edge';

const googleClientId = process.env.GOOGLE_CLIENT_ID;
if (googleClientId === undefined)
  throw new Error('GOOGLE_CLIENT_ID is not defined');
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
if (googleClientSecret === undefined)
  throw new Error('GOOGLE_CLIENT_SECRET is not defined');
const accessControlAllowOrigin = process.env.ACCESS_CONTROL_ALLOW_ORIGIN;
if (accessControlAllowOrigin === undefined)
  throw new Error('ACCESS_CONTROL_ALLOW_ORIGIN is not defined');

export async function POST(request: NextRequest): Promise<Response> {
  const origin = request.headers.get('origin');
  const isAllowed = origin === accessControlAllowOrigin;
  if (!isAllowed) return new Response('Unauthorized', { status: 401 });

  const payload: Record<string, unknown> = {};
  const refreshToken = request.nextUrl.searchParams.get('refreshToken');
  if (typeof refreshToken === 'string') {
    payload.refresh_token = refreshToken;
    payload.grant_type = 'refresh_token';
  } else {
    const code = request.nextUrl.searchParams.get('code');
    if (typeof code !== 'string')
      return new Response('"code" query parameter is missing', { status: 400 });
    payload.code = code;

    const redirectUrl = request.nextUrl.searchParams.get('redirectUrl');
    if (typeof redirectUrl !== 'string')
      return new Response('"redirectUrl" query parameter is missing', {
        status: 400,
      });
    payload.redirect_uri = redirectUrl;
    payload.grant_type = 'authorization_code';
  }

  try {
    const response = await fetch(
      formatUrl('https://oauth2.googleapis.com/token', {
        ...payload,
        client_id: googleClientId!,
        client_secret: googleClientSecret!,
      }),
      {
        method: 'POST',
      },
    );

    const data = await response.text();

    return new Response(data, {
      status: response.status,
      headers: {
        ...response.headers,
        'Access-Control-Allow-Origin': accessControlAllowOrigin,
      },
    });
  } catch (error: unknown) {
    return new Response(String(error), { status: 500 });
  }
}

function formatUrl(url: string, parameters: Record<string, string>): string {
  const urlObject = new URL(url);
  urlObject.search = new URLSearchParams({
    ...Object.fromEntries(urlObject.searchParams),
    ...parameters,
  }).toString();
  return urlObject.toString();
}
