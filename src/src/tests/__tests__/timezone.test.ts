import { expect, test } from 'vitest';

test('uses a consistent non-UTC time zone', () => {
  expect(Intl.DateTimeFormat().resolvedOptions().timeZone).toBe(
    'America/Chicago',
  );
});
