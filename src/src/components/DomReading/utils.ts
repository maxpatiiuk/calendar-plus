import { output } from '../Errors/exceptions';
import { RA } from '../../utils/types';

export function domParseError(message: string): undefined {
  output.warn(
    `[Calendar Plus] DOM parse error: ${message}. Falling back to retrieving data from the API rather than DOM parsing (slower, but more reliable)`,
  );
  return undefined;
}

// REFACTOR: replace with Array.prototype.toSpliced once widely available
export function toSpliced<T>(
  array: RA<T>,
  start: number,
  deleteCount: number,
): RA<T> {
  const copy = Array.from(array);
  copy.splice(start, deleteCount);
  return copy;
}
