import { f } from '../functools';

describe('f.includes', () => {
  test('positive case', () => expect(f.includes([1, 2, 3], 1)).toBe(true));
  test('negative case', () => expect(f.includes([1, 2, 3], 4)).toBe(false));
  test('empty case', () => expect(f.includes([], 1)).toBe(false));
});
