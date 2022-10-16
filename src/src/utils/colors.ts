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
