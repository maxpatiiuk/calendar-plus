/**
 * Copied from Charts.js Utils
 * These are used only if calendar does not have a color (don't know how common
 * that is)
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

/**
 * Make calendar colors less saturated when in dark mode.
 * The API always returns "base" colors.
 *
 * @example
 * This approximates the behavior Google Calendar does in dark mode:
 *
 * (Google's light mode UI color, API color, and dark mode UI color)
 * Pale blue
 * light: hsl(230.49deg 44.09% 63.53%)
 * api: hsl(238.81deg 100% 80.2%)
 * dark: hsl(231.56deg 34.41% 63.53%)
 *
 * Green
 * light: hsl(148.72deg 84.17% 27.25%)
 * api: hsl(152.69deg 76.72% 37.06%)
 * dark: hsl(139.73deg 33.64% 42.55%)
 *
 * Red
 * light: hsl(148.72deg 84.17% 27.25%)
 * api: hsl(6.73deg 93.86% 55.29%)
 * dark: hsl(10.84deg 69.17% 52.94%)
 */
export function reduceHexAcidity(hex: string): string {
  const [hue, saturation, luminosity] = hexToHsl(hex);
  return hslToHex(hue, saturation * darkModeSaturation, luminosity);
}

const darkModeSaturation = 0.7;
const hexRadix = 16;
const rgbMax = 255;
const hueMax = 360;

/**
 * Based on https://css-tricks.com/converting-color-spaces-in-javascript/#aa-hex-to-hsl
 */
function hexToHsl(hex: string): readonly [number, number, number] {
  const red = Number.parseInt(hex.slice(1, 3), hexRadix) / rgbMax;
  const green = Number.parseInt(hex.slice(3, 5), hexRadix) / rgbMax;
  const blue = Number.parseInt(hex.slice(5, 7), hexRadix) / rgbMax;
  let channelMin = Math.min(red, green, blue),
    channelMax = Math.max(red, green, blue),
    delta = channelMax - channelMin,
    hue = 0,
    saturation = 0,
    luminosity = 0;

  if (delta == 0) hue = 0;
  else if (channelMax == red) hue = ((green - blue) / delta) % 6;
  else if (channelMax == green) hue = (blue - red) / delta + 2;
  else hue = (red - green) / delta + 4;

  hue = Math.round(hue * 60);

  if (hue < 0) hue += 360;

  luminosity = (channelMax + channelMin) / 2;
  saturation = delta == 0 ? 0 : delta / (1 - Math.abs(2 * luminosity - 1));
  saturation = +(saturation * 100).toFixed(1);
  luminosity = +(luminosity * 100).toFixed(1);

  return [hue, saturation, luminosity];
}

/**
 * Based on https://css-tricks.com/converting-color-spaces-in-javascript/#aa-hsl-to-hex
 */
function hslToHex(hue: number, saturation: number, luminosity: number): string {
  saturation /= 100;
  luminosity /= 100;

  let chroma = (1 - Math.abs(2 * luminosity - 1)) * saturation,
    secondComponent = chroma * (1 - Math.abs(((hue / 60) % 2) - 1)),
    matchLightness = luminosity - chroma / 2,
    red = 0,
    green = 0,
    blue = 0;

  if (0 <= hue && hue < 60) {
    red = chroma;
    green = secondComponent;
    blue = 0;
  } else if (60 <= hue && hue < 120) {
    red = secondComponent;
    green = chroma;
    blue = 0;
  } else if (120 <= hue && hue < 180) {
    red = 0;
    green = chroma;
    blue = secondComponent;
  } else if (180 <= hue && hue < 240) {
    red = 0;
    green = secondComponent;
    blue = chroma;
  } else if (240 <= hue && hue < 300) {
    red = secondComponent;
    green = 0;
    blue = chroma;
  } else if (300 <= hue && hue < hueMax) {
    red = chroma;
    green = 0;
    blue = secondComponent;
  }
  // Having obtained RGB, convert channels to hex
  const redString = Math.round((red + matchLightness) * rgbMax)
    .toString(hexRadix)
    .padStart(2, '0');
  const greenString = Math.round((green + matchLightness) * rgbMax)
    .toString(hexRadix)
    .padStart(2, '0');
  const blueString = Math.round((blue + matchLightness) * rgbMax)
    .toString(hexRadix)
    .padStart(2, '0');

  return `#${redString}${greenString}${blueString}`;
}
