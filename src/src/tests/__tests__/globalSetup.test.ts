test('make sure tests are running under correct time zone', () => {
  expect(Intl.DateTimeFormat().resolvedOptions().timeZone).toBe(
    'America/Chicago'
  );
  /* temporary fix, will need to changed back to 300 to account for daylight savings time */
  expect(new Date().getTimezoneOffset()).toBe(360);
});

export {};
