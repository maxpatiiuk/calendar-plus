import type { RA } from '../../utils/types';

/**
 * Allows throwing errors from expressions, not just statements
 *
 * @remarks
 * There is a proposal for fixing this:
 * https://github.com/tc39/proposal-throw-expressions
 */
export function error(message: Error | string, ...rest: RA<unknown>): never {
  if (rest.length > 0) console.error('Error details: ', ...rest);
  const error = message instanceof Error ? message : new Error(message);
  // This is for the "Copy Error Message" feature:
  if (!('details' in error))
    Object.defineProperty(error, 'details', { value: rest, enumerable: false });
  throw error;
}

// FEATURE: display the error message in a dialog
export const crash = console.error;