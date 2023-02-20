/**
 * Collection of various helper methods
 *
 * @module
 */
import { f } from './functools';
import type { IR, RA } from './types';

export const capitalize = <T extends string>(string: T): Capitalize<T> =>
  (string.charAt(0).toUpperCase() + string.slice(1)) as Capitalize<T>;

export const camelToHuman = (value: string): string =>
  capitalize(value.replace(/([a-z])([A-Z])/gu, '$1 $2'));

/** Generate a sort function for Array.prototype.sort */
export const sortFunction =
  <T, V extends boolean | number | string | null | undefined>(
    mapper: (value: T) => V,
    reverse = false
  ): ((left: T, right: T) => -1 | 0 | 1) =>
  (left: T, right: T): -1 | 0 | 1 => {
    const [leftValue, rightValue] = reverse
      ? [mapper(right), mapper(left)]
      : [mapper(left), mapper(right)];
    if (leftValue === rightValue) return 0;
    else if (typeof leftValue === 'string' && typeof rightValue === 'string')
      return leftValue.localeCompare(rightValue) as -1 | 0 | 1;
    // Treat null and undefined as the same
    // eslint-disable-next-line eqeqeq
    else if (leftValue == rightValue) return 0;
    return (leftValue ?? '') > (rightValue ?? '') ? 1 : -1;
  };

/** Split array in half according to a discriminator function */
export const split = <LEFT_ITEM, RIGHT_ITEM = LEFT_ITEM>(
  array: RA<LEFT_ITEM | RIGHT_ITEM>,
  // If returns true, item would go to the right array
  discriminator: (
    item: LEFT_ITEM | RIGHT_ITEM,
    index: number,
    array: RA<LEFT_ITEM | RIGHT_ITEM>
  ) => boolean
): readonly [left: RA<LEFT_ITEM>, right: RA<RIGHT_ITEM>] =>
  array
    .map((item, index) => [item, discriminator(item, index, array)] as const)
    .reduce<
      readonly [
        left: RA<LEFT_ITEM | RIGHT_ITEM>,
        right: RA<LEFT_ITEM | RIGHT_ITEM>
      ]
    >(
      ([left, right], [item, isRight]) => [
        [...left, ...(isRight ? [] : [item])],
        [...right, ...(isRight ? [item] : [])],
      ],
      [[], []]
    ) as readonly [left: RA<LEFT_ITEM>, right: RA<RIGHT_ITEM>];

/** Remove item from array if present, otherwise, add it */
export const toggleItem = <T>(array: RA<T>, item: T): RA<T> =>
  array.includes(item)
    ? array.filter((value) => value !== item)
    : [...array, item];

/** Create a new array with a given item replaced */
export const replaceItem = <T>(array: RA<T>, index: number, item: T): RA<T> =>
  array[index] === item
    ? array
    : [
        ...array.slice(0, index),
        item,
        ...(index === -1 ? [] : array.slice(index + 1)),
      ];

/** Creates a new object with a given key replaced */
export const replaceKey = <T extends IR<unknown>>(
  object: T,
  targetKey: keyof T,
  newValue: T[keyof T]
): T =>
  object[targetKey] === newValue
    ? object
    : {
        // Despite what it looks like, this would preserve the order of keys
        ...object,
        [targetKey]: newValue,
      };

/** Create a new array without a given item */
export const removeItem = <T>(array: RA<T>, index: number): RA<T> =>
  index < 0
    ? [...array.slice(0, index - 1), ...array.slice(index)]
    : [...array.slice(0, index), ...array.slice(index + 1)];

/**
 * Create a new object with given keys removed
 */
export const removeKey = <
  DICTIONARY extends IR<unknown>,
  OMIT extends keyof DICTIONARY
>(
  object: DICTIONARY,
  ...toOmit: RA<OMIT>
): Omit<DICTIONARY, OMIT> =>
  // @ts-expect-error
  Object.fromEntries(
    Object.entries(object).filter(([key]) => !f.includes(toOmit, key))
  );

export function findLastIndex<T>(
  array: RA<T>,
  mapping: (item: T, index: number) => boolean
): number {
  for (let index = array.length - 1; index >= 0; index--)
    if (mapping(array[index], index)) return index;
  return -1;
}

/**
 * Convert an array of [key,value] tuples to a RA<[key, RA<value>]>
 *
 * @remarks
 * KEY doesn't have to be a string. It can be of any time
 */
export const group = <KEY, VALUE>(
  entries: RA<readonly [key: KEY, value: VALUE]>
): RA<readonly [key: KEY, values: RA<VALUE>]> =>
  Array.from(
    entries
      // eslint-disable-next-line functional/prefer-readonly-type
      .reduce<Map<KEY, RA<VALUE>>>(
        (grouped, [key, value]) =>
          grouped.set(key, [...(grouped.get(key) ?? []), value]),
        new Map()
      )
      .entries()
  );

// Find a value in an array, and return it's mapped variant
export function mappedFind<ITEM, RETURN_TYPE>(
  array: RA<ITEM>,
  callback: (item: ITEM, index: number) => RETURN_TYPE | undefined
): RETURN_TYPE | undefined {
  let value = undefined;
  array.some((item, index) => {
    value = callback(item, index);
    return value !== undefined;
  });
  return value;
}

export function debounce(callback: () => void, timeout: number): () => void {
  let timer: ReturnType<typeof setTimeout>;
  return () => {
    clearTimeout(timer);
    timer = setTimeout(callback, timeout);
  };
}

/**
 * Based on simplified version of Underscore.js's throttle function
 */
export function throttle(callback: () => void, wait: number): () => void {
  let timeout: ReturnType<typeof setTimeout>;
  let previous = 0;

  return (): void => {
    const time = Date.now();
    const remaining = wait - (time - previous);
    if (remaining <= 0 || remaining > wait) {
      clearTimeout(timeout);
      previous = time;
      callback();
    }
  };
}
