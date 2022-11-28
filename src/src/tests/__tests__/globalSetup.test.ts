test('make sure tests are running under correct time zone', () => {
  expect(Intl.DateTimeFormat().resolvedOptions().timeZone).toBe(
    'America/Chicago'
  );
  expect(new Date().getTimezoneOffset()).toBe(360);
});

export {};
