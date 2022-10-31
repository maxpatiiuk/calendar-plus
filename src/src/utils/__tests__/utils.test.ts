import {
  camelToHuman,
  capitalize,
  findLastIndex,
  removeItem,
  removeKey,
  replaceItem,
  sortFunction,
  split,
  toggleItem,
} from '../utils';
import { theories } from '../../tests/utils';

theories(capitalize, {
  'simple case': { in: ['capitalize'], out: 'Capitalize' },
  'works with non-ascii characters': { in: ['çA'], out: 'ÇA' },
  'does not break emojis': { in: ['❤️'], out: '❤️' },
});

theories(camelToHuman, [{ in: ['camelCase'], out: 'Camel Case' }]);

describe('sortFunction', () => {
  test('Numbers', () => {
    expect([10, 100, 1, 66, 5, 8, 2].sort(sortFunction((a) => a))).toEqual([
      1, 2, 5, 8, 10, 66, 100,
    ]);
  });
  test('Strings', () => {
    expect(['a', '6', 'bb', 'aba', '_a'].sort(sortFunction((a) => a))).toEqual([
      '_a',
      '6',
      'a',
      'aba',
      'bb',
    ]);
  });
  test('Custom function for Numbers', () => {
    expect(
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].sort(
        sortFunction((value) => Math.abs(5 - value))
      )
    ).toEqual([5, 4, 6, 3, 7, 2, 8, 1, 9, 10]);
  });
  test('Custom function for Numbers (reversed)', () => {
    expect(
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].sort(
        sortFunction((value) => Math.abs(5 - value), true)
      )
    ).toEqual([10, 1, 9, 2, 8, 3, 7, 4, 6, 5]);
  });
});

theories(split, [
  {
    in: [[1, 2, 3, 4, 5, 6, 7, 8], (value: number) => value % 2 === 0],
    out: [
      [1, 3, 5, 7],
      [2, 4, 6, 8],
    ],
  },
]);

theories(toggleItem, {
  'add an item that is not present': { in: [[1, 2, 3], 4], out: [1, 2, 3, 4] },
  'remove an item that is present': { in: [[1, 2, 3, 4], 4], out: [1, 2, 3] },
  'remove duplicate item': { in: [[1, 2, 3, 1], 1], out: [2, 3] },
});

theories(replaceItem, {
  'replace at the beginning': { in: [[0, 2, 3, 4], 0, 1], out: [1, 2, 3, 4] },
  'replace in the middle': { in: [[1, 0, 3, 4], 1, 2], out: [1, 2, 3, 4] },
  'replace at the end': { in: [[1, 2, 3, 0], 3, 4], out: [1, 2, 3, 4] },
  'replace from the end': { in: [[1, 2, 3, 0], -1, 4], out: [1, 2, 3, 4] },
  'replace after the end': { in: [[1, 2, 3], 99, 4], out: [1, 2, 3, 4] },
});

theories(removeItem, {
  'remove from the beginning': { in: [[0, 1, 2, 3, 4], 0], out: [1, 2, 3, 4] },
  'remove in the middle': { in: [[1, 0, 2, 3, 4], 1], out: [1, 2, 3, 4] },
  'remove at the end': { in: [[1, 2, 3, 4, 0], 4], out: [1, 2, 3, 4] },
  'remove from the end': { in: [[1, 2, 3, 0, 4], -1], out: [1, 2, 3, 4] },
  'remove after the end': { in: [[1, 2, 3, 4], 99], out: [1, 2, 3, 4] },
});

theories(removeKey, {
  'removing a key that is present': [[{ a: 'b', c: 'd' }, 'c'], { a: 'b' }],
  'removing a key that is not present': [[{ a: 'b' }, 'c' as 'a'], { a: 'b' }],
});

theories(findLastIndex, [
  {
    in: [[1, 2, 3, 4, 5, 6, 7, 8], (value: number) => value % 2 === 1],
    out: 6,
  },
  {
    in: [
      [1, 2, 3, 4, 5, 6, 7, 8],
      (_value: number, index: number) => index === 4,
    ],
    out: 4,
  },
]);
