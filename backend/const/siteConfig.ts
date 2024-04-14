export const robots = { index: true, follow: true } as const;
export const privatePage = { index: false, follow: false } as const;
export const twitter = '@maxpatiiuk';
export const githubRepository = 'maxpatiiuk/calendar-plus';

export const baseUrl =
  typeof process.env.VERCEL_URL === 'string' &&
  process.env.VERCEL_URL.length > 0
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000';
