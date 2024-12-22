import { roundToTwoDecimals } from '../../utils/utils';
import { output } from '../Errors/exceptions';
import type { ParsedDomEvent } from './types';

let loggedNonEnglish = false;
/**
 * The main DomReading logic is made to work with any language, with am/pm or
 * 24hr time and be somewhat resilient to Google Calendar DOM changes.
 *
 * When in development mode, this alternative logic (that is hardcoded for
 * US English) verifies that the parsing logic is working
 * correctly.
 */
export function validateParseResult(
  parseResult: ParsedDomEvent,
  event: HTMLElement,
): undefined | string {
  if (document.documentElement.lang !== 'en') {
    if (loggedNonEnglish) return undefined;
    loggedNonEnglish = true;
    output.log('Calendar is not in English. Skipping DOM reading validation');
    return undefined;
  }

  const ariaParts = event
    .querySelector('& > div:not([aria-hidden])')
    ?.textContent?.split(', ');
  if (ariaParts === undefined)
    return `Failed to extract aria parts from element`;

  // These indexes are correct for US English, but not for many other languages
  const times = ariaParts[0].match(reTime);
  const isMultiDay = times?.length !== 2;
  const resolvedTimes = isMultiDay
    ? [ariaParts[1].match(reTime)![0], ariaParts[2].match(reTime)![0]]
    : times;

  const [startTime, endTime] = [
    parseString(resolvedTimes[0]),
    parseString(resolvedTimes[1]),
  ];

  const isMatching = isMultiDay
    ? (parseResult.startTime === startTime && parseResult.endTime === 24) ||
      (parseResult.startTime === 0 && parseResult.endTime === endTime)
    : parseResult.startTime === startTime && parseResult.endTime === endTime;
  if (isMatching) return undefined;

  return `DOM validation extracted different times: ${startTime} - ${endTime}`;
}

// AM/PM is so complicated. sigh
const reTime = /\d\d?(?:(?::\d\d)?[ap]m|:\d\d)/gu;
function parseString(string: string): number {
  const isAm = string.endsWith('am');
  const isPm = string.endsWith('pm');
  const trimmedString = isAm || isPm ? string.slice(0, -2) : string;
  const [left, right = '0'] = trimmedString.split(':');

  const baseHours = Number.parseInt(left);
  const minutes = Number.parseInt(right) / 60;

  const hours = isAm
    ? baseHours === amPmSwitch
      ? 0
      : baseHours
    : isPm
      ? baseHours === amPmSwitch
        ? baseHours
        : baseHours + amPmSwitch
      : baseHours;

  return roundToTwoDecimals(hours + minutes);
}
const amPmSwitch = 12;
