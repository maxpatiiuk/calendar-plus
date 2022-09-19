import { exportsForTests } from '../CurrentViewContext';
import { theories } from '../../../tests/utils';
import { mockTime, testTime } from '../../../tests/helpers';

const { parsePath } = exportsForTests;

mockTime();

const year = testTime.getFullYear();
const month = testTime.getMonth();
const day = testTime.getDate();

theories(parsePath, [
  {
    in: ['/calendar/u/0/r/week/'],
    out: {
      view: 'week',
      date: new Date(year, month, day),
    },
  },
  {
    in: ['/calendar/u/0/r/week/2022/12/31/'],
    out: {
      view: 'week',
      date: new Date(2022, 12, 31),
    },
  },
  {
    in: ['/calendar/u/0/r/month/2020/12/31/'],
    out: {
      view: 'month',
      date: new Date(2020, 12, 31),
    },
  },
  {
    in: ['/calendar/u/0/r/year/2023/'],
    out: {
      view: 'year',
      date: new Date(2023, month, day),
    },
  },
  {
    in: ['/calendar/u/0/r/customday/2024/'],
    out: {
      view: 'customday',
      date: new Date(2024, month, day),
    },
  },
]);
