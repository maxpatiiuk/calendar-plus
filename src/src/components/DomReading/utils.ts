import { RA } from '../../utils/types';

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
