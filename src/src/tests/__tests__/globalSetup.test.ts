test('make sure tests are running under correct time zone', () => {
  expect(Intl.DateTimeFormat().resolvedOptions().timeZone).toBe(
    'America/Chicago',
  );
});

export {};
