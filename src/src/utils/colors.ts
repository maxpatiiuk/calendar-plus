import { RA } from './types';

type ColorTuple = readonly [r: number, g: number, b: number];

/**
 * Convert a hex string in the #ffffff format into rgb 3-tuple
 */
export function hexToRgb(hex: string): ColorTuple {
  const [r, g, b] = hex.slice(1).match(/.{1,2}/g)!;
  return [
    Number.parseInt(r, 16),
    Number.parseInt(g, 16),
    Number.parseInt(b, 16),
  ];
}

/**
 * Copied from Charts.js Utils
 */
const COLORS = [
  '#4dc9f6',
  '#f67019',
  '#f53794',
  '#537bc4',
  '#acc236',
  '#166a8f',
  '#00a950',
  '#58595b',
  '#8549ba',
];

export const randomColor = (): string =>
  COLORS[Math.floor(Math.random() * COLORS.length)];

const backgroundBrightness = 100;
export const generateBackground = (color: ColorTuple): ColorTuple =>
  adjustColor(color, backgroundBrightness);

const borderBrightness = 200;
export const generateBorder = (color: ColorTuple): ColorTuple =>
  adjustColor(color, borderBrightness);

/**
 * Darken or lighten color as needed
 */
export function adjustColor(color: ColorTuple, target: number): ColorTuple {
  const coefficient = target / average(color);
  const [r, g, b] = color.map((part) => Math.round(part * coefficient));
  return [r, g, b];
}

export const rgbToString = (color: ColorTuple): string =>
  `rgb(${color.join(',')})`;

export const average = (array: RA<number>): number =>
  array.reduce((total, item) => total + item, 0) / array.length;
