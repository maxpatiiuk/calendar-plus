import { theories } from '../../../tests/utils';
import type { RA, RR } from '../../../utils/types';
import {
  countDaysBetween,
  dateToDateTime,
  dateToString,
  exportsForTests,
  getDateStringsBetween,
  isMidnight,
  summedDurations,
} from '../index';
import { dayHours } from './hourUtils';

const {
  calculateBounds,
  resolveEventDates,
  extractData,
  calculateEventDuration,
} = exportsForTests;

const timeMin = new Date('2022-10-09T05:00:00.000Z');
const timeMax = new Date('2022-10-16T05:00:00.000Z');

theories(calculateBounds, {
  'empty cache': {
    in: [
      { current: {} },
      'a',
      timeMin,
      getDateStringsBetween(timeMin, timeMax),
    ],
    out: [timeMin, timeMax],
  },
  'non-empty cache': {
    in: [
      {
        current: {
          a: {
            '': {
              '2022-10-9': dayHours(1),
              '2022-10-10': dayHours(1),
              '2022-10-11': dayHours(1),
              '2022-10-16': dayHours(1),
            },
          },
        },
      },
      'a',
      timeMin,
      getDateStringsBetween(timeMin, timeMax),
    ],
    out: [
      new Date('2022-10-12T05:00:00.000Z'),
      new Date('2022-10-16T05:00:00.000Z'),
    ],
  },
});

theories(getDateStringsBetween, [
  {
    in: [
      new Date('2022-10-11T11:00:00-05:00'),
      new Date('2022-10-11T11:30:00-05:00'),
    ],
    out: ['2022-10-11'],
  },
  {
    in: [
      new Date('2022-10-11T11:00:00-05:00'),
      new Date('2022-10-11T21:30:00-05:00'),
    ],
    out: ['2022-10-11'],
  },
  {
    in: [
      new Date('2022-10-11T11:00:00-05:00'),
      new Date('2022-10-21T21:30:00-05:00'),
    ],
    out: [
      '2022-10-11',
      '2022-10-12',
      '2022-10-13',
      '2022-10-14',
      '2022-10-15',
      '2022-10-16',
      '2022-10-17',
      '2022-10-18',
      '2022-10-19',
      '2022-10-20',
      '2022-10-21',
    ],
  },
  {
    in: [
      new Date('2022-10-11T11:00:00-05:00'),
      new Date('2022-10-21T00:00:00-05:00'),
    ],
    out: [
      '2022-10-11',
      '2022-10-12',
      '2022-10-13',
      '2022-10-14',
      '2022-10-15',
      '2022-10-16',
      '2022-10-17',
      '2022-10-18',
      '2022-10-19',
      '2022-10-20',
    ],
  },
]);

theories(dateToString, [
  {
    in: [new Date('2022-10-11T11:00:00-05:00')],
    out: '2022-10-11',
  },
]);

theories(countDaysBetween, [
  {
    in: [
      new Date('2022-10-11T11:00:00-05:00'),
      new Date('2022-10-11T11:30:00-05:00'),
    ],
    out: 1,
  },
  {
    in: [
      new Date('2022-10-11T11:00:00-05:00'),
      new Date('2022-10-21T11:30:00-05:00'),
    ],
    out: 11,
  },
  {
    in: [
      new Date('2022-10-11T11:30:00-05:00'),
      new Date('2022-10-21T00:00:00-05:00'),
    ],
    out: 10,
  },
]);

theories(isMidnight, [
  {
    in: [new Date('2022-10-11T00:00:00-05:00')],
    out: true,
  },
  {
    in: [new Date('2022-10-11T00:00:01-05:00')],
    out: false,
  },
  {
    in: [new Date('2022-10-11T00:00:00-00:00')],
    out: false,
  },
]);

theories(resolveEventDates, {
  'common case': {
    in: [
      timeMin,
      timeMax,
      {
        dateTime: '2022-10-11T05:00:00.000Z',
      },
      {
        dateTime: '2022-10-11T06:00:00.000Z',
      },
    ],
    out: [
      new Date('2022-10-11T05:00:00.000Z'),
      new Date('2022-10-11T06:00:00.000Z'),
    ],
  },
  'all day event': {
    in: [
      timeMin,
      timeMax,
      {
        date: '2022-10-11',
      },
      {
        date: '2022-10-12',
      },
    ],
    out: [
      new Date('2022-10-11T00:00:00.000-05:00'),
      new Date('2022-10-12T00:00:00.000-05:00'),
    ],
  },
  'event without end time': {
    in: [
      timeMin,
      timeMax,
      {
        dateTime: '2022-10-11T05:00:00.000Z',
      },
      {
        date: '2022-10-12',
      },
    ],
    out: [
      new Date('2022-10-11T05:00:00.000Z'),
      new Date('2022-10-12T00:00:00.000-05:00'),
    ],
  },
  'event outside of bounds': {
    in: [
      timeMin,
      timeMax,
      {
        date: '2022-01-11',
      },
      {
        date: '2022-11-11',
      },
    ],
    out: [timeMin, timeMax],
  },
  'invalid event': {
    in: [
      timeMin,
      timeMax,
      {},
      {
        dateTime: '2022-10-11T06:00:00.000Z',
      },
    ],
    out: undefined,
  },
});

theories(dateToDateTime, [
  {
    in: ['2020-01-01'],
    out: new Date('2020-01-01T00:00:00.000-06:00'),
  },
]);

theories(extractData, [
  {
    in: [
      {
        a: {
          '': {
            '2022-10-8': dayHours(1),
            '2022-10-9': dayHours(1),
            // Previous are ignored
            '2022-10-10': dayHours(1, 2, 3, 4),
            '2022-10-11': dayHours(2, 3, 4, 5),
            '2022-10-12': dayHours(3, 4, 5),
          },
        },
        b: {
          '': {
            '2022-10-4': dayHours(4),
            '2022-10-5': dayHours(5),
            '2022-10-6': dayHours(2),
            '2022-10-7': dayHours(1),
            '2022-10-9': dayHours(2),
            // Previous are ignored
            '2022-10-10': dayHours(1, 2, 3, 4),
            '2022-10-11': dayHours(),
            '2022-10-12': dayHours(2, 3, 4),
            // Following are ignored
            '2022-10-13': dayHours(0),
          },
          'Some Category': {
            '2022-10-5': dayHours(1),
            '2022-10-6': dayHours(2),
            '2022-10-7': dayHours(3),
            '2022-10-8': dayHours(4),
            '2022-10-9': dayHours(5),
            // Previous are ignored
            '2022-10-10': dayHours(6, 7, 2, 2),
            '2022-10-11': dayHours(1, 5, 6, 2, 1, 2, 3),
            '2022-10-12': dayHours(0, 1, 3, 5, 0, 1),
            // Following are ignored
            '2022-10-13': dayHours(9),
          },
        },
      },
      [
        {
          summary: 'Calendar 3',
          id: 'a',
          backgroundColor: '#ff0000',
        },
        {
          summary: 'Calendar 4',
          id: 'b',
          backgroundColor: '#ff0000',
        },
      ],
      new Date('2022-10-10T11:00:00-05:00'),
      new Date('2022-10-12T11:30:00-05:00'),
    ],
    out: {
      a: {
        '': {
          '2022-10-10': dayHours(1, 2, 3, 4),
          '2022-10-11': dayHours(2, 3, 4, 5),
          '2022-10-12': dayHours(3, 4, 5),
        },
        [summedDurations]: {
          '2022-10-10': dayHours(1, 2, 3, 4),
          '2022-10-11': dayHours(2, 3, 4, 5),
          '2022-10-12': dayHours(3, 4, 5),
        },
      },
      b: {
        '': {
          '2022-10-10': dayHours(1, 2, 3, 4),
          '2022-10-11': dayHours(),
          '2022-10-12': dayHours(2, 3, 4),
        },
        'Some Category': {
          '2022-10-10': dayHours(6, 7, 2, 2),
          '2022-10-11': dayHours(1, 5, 6, 2, 1, 2, 3),
          '2022-10-12': dayHours(0, 1, 3, 5, 0, 1),
        },
        [summedDurations]: {
          '2022-10-10': dayHours(1 + 6, 2 + 7, 3 + 2, 4 + 2),
          '2022-10-11': dayHours(1, 5, 6, 2, 1, 2, 3),
          '2022-10-12': dayHours(2 + 0, 3 + 1, 4 + 3, 5, 0, 1),
        },
      },
    },
  },
]);

const getHours = (hours: RR<number, number>): RA<number> =>
  Array.from({ length: 24 }, (_, index) => hours[index]);

const fullDay = Array.from({ length: 24 }).fill(60);

theories(calculateEventDuration, [
  {
    name: 'handles sub-hour event',
    in: [
      new Date('2022-10-11T11:15:00-05:00'),
      new Date('2022-10-11T11:45:00-05:00'),
    ],
    out: { '2022-10-11': getHours({ 11: 30 }) },
  },
  {
    name: 'handles case when both dates are on the same day',
    in: [
      new Date('2022-10-11T11:00:00-05:00'),
      new Date('2022-10-11T12:30:00-05:00'),
    ],
    out: { '2022-10-11': getHours({ 11: 60, 12: 30 }) },
  },
  {
    name: 'handles event than goes to midnight',
    in: [
      new Date('2022-10-11T21:15:00-05:00'),
      new Date('2022-10-12T00:00:00-05:00'),
    ],
    out: {
      '2022-10-11': getHours({
        21: 45,
        22: 60,
        23: 60,
      }),
    },
  },
  {
    name: 'handles event that starts at midnight',
    in: [
      new Date('2022-10-11T00:00:00-05:00'),
      new Date('2022-10-11T02:15:00-05:00'),
    ],
    out: {
      '2022-10-11': getHours({
        0: 60,
        1: 60,
        2: 15,
      }),
    },
  },
  {
    name: 'Handles multi day event',
    in: [
      new Date('2022-10-11T23:15:00-05:00'),
      new Date('2022-10-21T01:30:00-05:00'),
    ],
    out: {
      '2022-10-11': getHours({ 23: 45 }),
      '2022-10-12': fullDay,
      '2022-10-13': fullDay,
      '2022-10-14': fullDay,
      '2022-10-15': fullDay,
      '2022-10-16': fullDay,
      '2022-10-17': fullDay,
      '2022-10-18': fullDay,
      '2022-10-19': fullDay,
      '2022-10-20': fullDay,
      '2022-10-21': getHours({ 0: 60, 1: 30 }),
    },
  },
]);
