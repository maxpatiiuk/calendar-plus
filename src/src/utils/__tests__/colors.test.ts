import {
  average,
  generateBackground,
  generateBorder,
  hexToRgb,
  rgbToString,
} from '../colors';
import { theories } from '../../tests/utils';

theories(hexToRgb, [
  {
    in: ['#ffffff'],
    out: [255, 255, 255],
  },
  {
    in: ['#123456'],
    out: [18, 52, 86],
  },
  {
    in: ['#000000'],
    out: [0, 0, 0],
  },
]);

theories(generateBackground, [
  {
    in: [[159, 198, 231]],
    out: [81, 101, 118],
  },
  {
    in: [[250, 87, 60]],
    out: [189, 66, 45],
  },
]);

theories(generateBorder, [
  {
    in: [[159, 198, 231]],
    out: [162, 202, 236],
  },
  {
    in: [[250, 87, 60]],
    out: [378, 131, 91],
  },
]);

theories(rgbToString, [
  {
    in: [[159, 198, 231]],
    out: 'rgb(159,198,231)',
  },
]);

theories(average, [
  {
    in: [[]],
    out: 0,
  },
  {
    in: [[4, 3, 2]],
    out: 3,
  },
]);
