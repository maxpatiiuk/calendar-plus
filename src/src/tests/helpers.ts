/**
 * Fixed timestamp to use in tests for reproducible results
 */
export const testTime = new Date('2022-08-31T03:37:10.4');

/**
 * Call this at the top of any test file whose results rely on time to set
 * current time to a fixed timestamp
 */
export const mockTime = (date = testTime): void =>
  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(date);
  });
