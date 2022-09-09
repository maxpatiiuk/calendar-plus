export const testTime = new Date('2022-08-31T03:37:10.4');

export const mockTime = (date = testTime): void =>
  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(date);
  });
