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
  (value: T | ((oldValue: T) => T)) => void,
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
export const isDefined = <T>(value: T | undefined): value is T =>
  value !== undefined;

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
  value: T,
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

/**
 * Makes sure object extends a certain type
 *
 * @remarks
 * Call this function with a generic parameter of desired type.
 * The function returns another function which accepts an "as const" object.
 * If that object does not extend the type given specified the first function
 * a type error is thrown.
 *
 * The function has to return a function because typescript does not allow to
 * explicitly specify first generic, while leave the second implicit.
 *
 * The function is needed since `const value: SomeType = {...} as const;` would
 * cast the value to `SomeType` and lose the information from the `as const`
 * assertion.
 *
 * The disadvantage of this function is that "Go to definition" IDE feature
 * doesn't work as good when an `as const` object is wrapped in "ensure". For
 * use cases where that feature is important, instead of wrapping the
 * object in ensure, add an ensure line after object definition. A disadvantage
 * of not wrapping the object is that IDE won't be able to do autocompletion
 * inside the object from the type information and the type error, if present,
 * is going to be thrown at the "ensure" line, rather than in the exact place
 * inside the object where the error originated.
 *
 * @example Wrapping an `as const` object
 * ```ts
 * const tools = ensure<keoyf Tables>()(['CollectionObject','Locality'] as const);
 * ```
 *
 * @example Usage without wrapping
 * ```ts
 * const tools = ['CollectionObject', 'Locality'] as const;
 * ensure<RA<tools>>(tools);
 * ```
 */
export const ensure =
  <T>() =>
  <V extends T>(value: V): V extends T ? V : never =>
    value as V extends T ? V : never;
