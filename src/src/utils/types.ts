/**
 * Common TypeScript types. Used extensively thoughout the front-end
 *
 * @module
 */

// Record
export type R<V> = Record<string, V>;
// Immutable record
export type IR<V> = Readonly<Record<string, V>>;
// Immutable record with constrained keys
export type RR<K extends number | string | symbol, V> = Readonly<Record<K, V>>;
// Immutable Array
export type RA<V> = readonly V[];

export type GetSet<T> = readonly [T, (value: T) => void];
export type GetOrSet<T> = readonly [
  T,
  (value: T | ((oldValue: T) => T)) => void
];

/**
 * It is a widely used convention in TypeScript to use T[] to denote arrays.
 * However, this creates a mutable array type.
 * This is why, RA<T> has been used across the codebase.
 * In rare cases when a mutable array is needed, this type should be used, for
 * the following reasons:
 * - It makes it explicitly known that the value is meant to be mutated
 * - It doesn't trigger the "functional/prefer-readonly-type" ESLint rule.
 */
// eslint-disable-next-line functional/prefer-readonly-type
export type WritableArray<T> = T[];

/** Cast a type as defined. Throws at runtime if it is not defined */
export function defined<T>(value: T | undefined, message?: string): T {
  // eslint-disable-next-line functional/no-throw-statement
  if (value === undefined) throw new Error(message ?? 'Value is not defined');
  else return value;
}

/** Filter undefined items out of the array */
export const filterArray = <T>(array: RA<T | undefined>): RA<T> =>
  array.filter((item): item is T => item !== undefined);

// eslint-disable-next-line functional/prefer-readonly-type
export type Writable<T> = {
  -readonly [K in keyof T]: T[K];
};

/**
 * Cast type to writable. Equivalent to doing "as Writable<T>", except this
 * way, don't have to manually specify the generic type
 */
export const writable = <T>(value: T): Writable<T> => value;

/**
 * "typeof value === 'function'" does not narrow the type in some cases where
 * a generic is involed
 * See more: https://github.com/microsoft/TypeScript/issues/37663
 */
export const isFunction = <T>(
  value: T
): value is T & ((...args: RA<unknown>) => unknown) =>
  typeof value === 'function';

/**
 * Set a global variable when in development mode.
 *
 * Exposing the variables in global scope makes debugging easier.
 *
 * @remarks
 * Using this function helps easily find all the places were global variables
 * were set, and removes the need to silence the TypeScript error separately
 * in each place
 */
export function setDevelopmentGlobal(name: string, value: unknown): void {
  if (process.env.NODE_ENV === 'development')
    // @ts-expect-error
    globalThis[name] = value;
}
