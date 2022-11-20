import { defaultCustomViewSize, exportsForTests } from '../CurrentViewContext';
import { theories } from '../../../tests/utils';
import { mockTime, testTime } from '../../../tests/helpers';

const { parsePath } = exportsForTests;

mockTime();

const year = testTime.getFullYear();
const month = testTime.getMonth();
const day = testTime.getDate();

theories(parsePath, [
  {
    in: ['/calendar/u/0/r/day/', defaultCustomViewSize],
    out: {
      view: 'day',
      selectedDay: new Date(year, month, day),
      firstDay: new Date(year, month, day),
      lastDay: new Date(year, month, day + 1),
    },
  },
  {
    in: ['/calendar/u/0/r/week/', defaultCustomViewSize],
    out: {
      view: 'week',
      selectedDay: new Date(year, month, day),
      firstDay: new Date(year, month, day - 3),
      lastDay: new Date(year, month, day + 4),
    },
  },
  {
    in: ['/calendar/u/0/r/week/2022/12/31/', defaultCustomViewSize],
    out: {
      view: 'week',
      selectedDay: new Date(2022, 11, 31),
      firstDay: new Date(2022, 11, 25),
      lastDay: new Date(2023, 0, 1),
    },
  },
  {
    in: ['/calendar/u/0/r/month/2020/12/31/', defaultCustomViewSize],
    out: {
      view: 'month',
      selectedDay: new Date(2020, 11, 31),
      firstDay: new Date(2020, 11, 1),
      lastDay: new Date(2020, 11, 31),
    },
  },
  {
    in: ['/calendar/u/0/r/customday/2020/12/10/', defaultCustomViewSize],
    out: {
      view: 'customday',
      selectedDay: new Date(2020, 11, 10),
      firstDay: new Date(2020, 11, 14),
      lastDay: new Date(2020, 11, 14),
    },
  },
  {
    in: ['/calendar/u/0/r/customweek/2020/12/10/', 14],
    out: {
      view: 'customweek',
      selectedDay: new Date(2020, 11, 10),
      firstDay: new Date(2020, 11, 6),
      lastDay: new Date(2020, 11, 20),
    },
  },
  // TODO: reEnable this once year view is supported
  /*{
  in: ['/calendar/u/0/r/year/2023/'],
  out: {
    view: 'year',
    selectedDay: new Date(2023, month, day),
    firstDay: new Date(2023, 0, 1),
    lastDay: new Date(2024, 0, 1),
  },
},*/
]);
