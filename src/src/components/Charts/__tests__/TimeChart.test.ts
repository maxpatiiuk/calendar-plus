import { exportsForTests } from '../TimeChart';
import { theories } from '../../../tests/utils';
import { summedDurations } from '../../EventsStore';
import { dayHours } from '../../EventsStore/__tests__/hourUtils';

const { getTimes, getOpacity } = exportsForTests;

const input = {
  a: {
    [summedDurations]: { '2020-10-10': dayHours(60, 45, 30) },
  },
  b: {
    [summedDurations]: {
      '2020-10-10': dayHours(30, 120, 45),
      '2020-10-11': dayHours(120, 60, 45),
    },
  },
} as const;

theories(getTimes, [
  {
    in: [input, 'total'],
    out: {
      a: dayHours(1, 0.75, 0.5),
      b: dayHours(2.5, 3, 1.5),
    },
  },
  {
    in: [input, 'average'],
    out: {
      a: dayHours(60, 45, 30),
      b: dayHours(75, 90, 45),
    },
  },
]);

theories(getOpacity, [
  { in: [10, 10], out: 'ff' },
  { in: [0, 1], out: '00' },
  { in: [20, 100], out: '33' },
  { in: [12.3125, 35.213], out: '59' },
]);
