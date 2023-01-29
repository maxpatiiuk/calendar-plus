import { RA } from '../../../utils/types';
import { WritableDayHours } from '../index';

export const dayHours = (...hourly: RA<number>): WritableDayHours => ({
  total: hourly.reduce((total, minutes) => total + minutes, 0),
  hourly: Array.from({ length: 24 }, (_, index) => hourly[index] ?? 0),
});
