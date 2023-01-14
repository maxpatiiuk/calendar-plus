import { theories } from '../../../tests/utils';
import {
  countDaysBetween,
  dateToDateTime,
  dateToString,
  exportsForTests,
  getDatesBetween,
  isMidnight,
  summedDurations,
} from '../index';

const {
  calculateBounds,
  resolveEventDates,
  extractData,
  calculateEventDuration,
  calculateInBetweenDurations,
} = exportsForTests;

const timeMin = new Date('2022-10-09T05:00:00.000Z');
const timeMax = new Date('2022-10-16T05:00:00.000Z');

theories(calculateBounds, {
  'empty cache': {
    in: [{ current: {} }, 'a', timeMin, getDatesBetween(timeMin, timeMax)],
    out: [timeMin, timeMax],
  },
  'non-empty cache': {
    in: [
      {
        current: {
          a: {
            '': {
              '2022-10-9': 1,
              '2022-10-10': 1,
              '2022-10-11': 2,
              '2022-10-16': 1,
            },
          },
        },
      },
      'a',
      timeMin,
      getDatesBetween(timeMin, timeMax),
    ],
    out: [
      new Date('2022-10-12T05:00:00.000Z'),
      new Date('2022-10-16T05:00:00.000Z'),
    ],
  },
});

theories(getDatesBetween, [
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
            '2022-10-8': 1,
            '2022-10-9': 1,
            '2022-10-10': 4,
            '2022-10-11': 3,
            '2022-10-12': 1,
          },
        },
        b: {
          '': {
            '2022-10-4': 4,
            '2022-10-5': 5,
            '2022-10-6': 2,
            '2022-10-7': 1,
            '2022-10-9': 1,
            '2022-10-10': 4,
            '2022-10-11': 0,
            '2022-10-12': 1,
            '2022-10-13': 8,
          },
          'Some Category': {
            '2022-10-5': 1,
            '2022-10-6': 2,
            '2022-10-7': 3,
            '2022-10-8': 4,
            '2022-10-9': 5,
            '2022-10-10': 6,
            '2022-10-11': 7,
            '2022-10-12': 8,
            '2022-10-13': 9,
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
          '2022-10-10': 4,
          '2022-10-11': 3,
          '2022-10-12': 1,
        },
        [summedDurations]: {
          '2022-10-10': 4,
          '2022-10-11': 3,
          '2022-10-12': 1,
        },
      },
      b: {
        '': {
          '2022-10-10': 4,
          '2022-10-11': 0,
          '2022-10-12': 1,
        },
        'Some Category': {
          '2022-10-10': 6,
          '2022-10-11': 7,
          '2022-10-12': 8,
        },
        [summedDurations]: {
          '2022-10-10': 4 + 6,
          '2022-10-11': 0 + 7,
          '2022-10-12': 1 + 8,
        },
      },
    },
  },
]);

theories(calculateEventDuration, [
  {
    name: 'handles case when both dates are on the same day',
    in: [
      new Date('2022-10-11T11:00:00-05:00'),
      new Date('2022-10-11T11:30:00-05:00'),
    ],
    out: [['2022-10-11', 30]],
  },
  {
    name: 'calls calculateInBetweenDurations',
    in: [
      new Date('2022-10-11T11:00:00-05:00'),
      new Date('2022-10-12T00:00:00-05:00'),
    ],
    out: [['2022-10-11', 780]],
  },
]);

theories(calculateInBetweenDurations, [
  {
    in: [
      new Date('2022-10-11T11:00:00-05:00'),
      new Date('2022-10-12T00:00:00-05:00'),
    ],
    out: [['2022-10-11', 780]],
  },
  {
    in: [
      new Date('2022-10-11T11:00:00-05:00'),
      new Date('2022-10-21T01:30:00-05:00'),
    ],
    out: [
      ['2022-10-11', 780],
      ['2022-10-12', 1440],
      ['2022-10-13', 1440],
      ['2022-10-14', 1440],
      ['2022-10-15', 1440],
      ['2022-10-16', 1440],
      ['2022-10-17', 1440],
      ['2022-10-18', 1440],
      ['2022-10-19', 1440],
      ['2022-10-20', 1440],
      ['2022-10-21', 90],
    ],
  },
]);
