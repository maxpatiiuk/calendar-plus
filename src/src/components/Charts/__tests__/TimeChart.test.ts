import { exportsForTests } from '../TimeChart';
import { theories } from '../../../tests/utils';
import { summedDurations } from '../../EventsStore';
import { dayHours } from '../../EventsStore/__tests__/hourUtils';

const { getTimes, getOpacity } = exportsForTests;

theories(getTimes, [
  {
    in: [
      {
        a: {
          [summedDurations]: { '2020-10-10': dayHours(60, 45, 30) },
        },
        b: {
          [summedDurations]: {
            '2020-10-10': dayHours(30, 120, 45),
            '2020-10-11': dayHours(120, 60, 45),
          },
        },
      },
    ],
    out: {
      a: dayHours(1, 0.75, 0.5),
      b: dayHours(2.5, 3, 1.5),
    },
  },
]);

theories(getOpacity, [
  { in: [10, 10], out: 'ff' },
  { in: [0, 1], out: '00' },
  { in: [20, 100], out: '33' },
  { in: [12.3125, 35.213], out: '59' },
]);

describe('', () => {});
