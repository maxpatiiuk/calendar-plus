/**
 * Collection of various helper methods
 *
 * @module
 */
import { RA } from './types';

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
