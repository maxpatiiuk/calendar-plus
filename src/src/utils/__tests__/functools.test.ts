import { f } from '../functools';

describe('f.includes', () => {
  test('positive case', () => expect(f.includes([1, 2, 3], 1)).toBe(true));
  test('negative case', () => expect(f.includes([1, 2, 3], 4)).toBe(false));
  test('empty case', () => expect(f.includes([], 1)).toBe(false));
});

describe('f.unique', () => {
  test('empty case', () => expect(f.unique([])).toEqual([]));
  test('unique case', () => expect(f.unique([1, 2, 3])).toEqual([1, 2, 3]));
  test('duplicate case', () =>
    expect(f.unique([1, 2, 3, 1])).toEqual([1, 2, 3]));
});
