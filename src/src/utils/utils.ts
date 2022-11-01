/**
 * Collection of various helper methods
 *
 * @module
 */
import { IR, RA } from './types';
import { f } from './functools';

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

/** Create a new array with a given item replaced */
export const replaceItem = <T>(array: RA<T>, index: number, item: T): RA<T> =>
  array[index] === item
    ? array
    : [
        ...array.slice(0, index),
        item,
        ...(index === -1 ? [] : array.slice(index + 1)),
      ];

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

export const downloadFile = async (
  fileName: string,
  text: string
): Promise<void> =>
  new Promise((resolve) => {
    const iframe = document.createElement('iframe');
    iframe.addEventListener('load', () => {
      if (iframe.contentWindow === null) return;
      const element = iframe.contentWindow.document.createElement('a');
      element.setAttribute(
        'href',
        `data:text/plain;charset=utf-8,${encodeURIComponent(text)}`
      );
      element.setAttribute('download', fileName);

      element.style.display = 'none';
      iframe.contentWindow.document.body.append(element);

      element.click();
      globalThis.setTimeout(() => {
        iframe.remove();
        resolve();
      }, 100);
    });
    const html = '<body></body>';
    document.body.append(iframe);
    iframe.contentWindow?.document.open();
    iframe.contentWindow?.document.write(html);
    iframe.contentWindow?.document.close();
  });
