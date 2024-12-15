import { roundToTwoDecimals } from '../../utils/utils';
import { MINUTES_IN_HOUR } from '../Atoms/Internationalization';
import { normalizeNumbers } from './normalizeNumbers';
import type { ParsedDomEvent, RawDomEvent } from './types';
import { toSpliced } from './utils';

export function rawDomEventToParsed(
  rawDomEvent: RawDomEvent,
): ParsedDomEvent | string {
  const times = extractTimes(rawDomEvent);
  if (typeof times === 'string') return times;

  const [start, end] = times;
  const startTime = rawDomEvent.touchesTop
    ? 0
    : parseTimeNumber(start, rawDomEvent.amStart);
  const endTime = rawDomEvent.touchesBottom
    ? 24
    : parseTimeNumber(end, rawDomEvent.amEnd);
  if (Number.isNaN(startTime))
    return `Failed to parse start time from event label (${rawDomEvent.aria})`;
  if (Number.isNaN(endTime))
    return `Failed to parse end time from event label (${rawDomEvent.aria})`;

  return {
    calendarId: rawDomEvent.calendarId,
    summary: rawDomEvent.summary,
    startTime,
    endTime,
  };
}

function extractTimes({
  times,
  aria,
  summary,
  touchesTop,
  touchesBottom,
  previousDayNumber,
  todayDayNumber,
  nextDayNumber,
}: RawDomEvent): readonly [string, string] | string {
  const numbers = extractTimeLikeNumbers(times);
  if (numbers.length === 0) return `No time numbers found in ${times}`;

  // Sometimes time string would include both numbers - makes our job easy
  if (numbers.length === 2) return [numbers[0], numbers[1]];

  /**
   * Exclude part of the aria string that includes the event summary and
   * calendar name to avoid them interfering with time extraction.
   *
   * I verified that in every Google Calendar language, the start and end time
   * occurs in the string before the summary.
   *
   * Still, just in case event name is "8" or "8:00" trim everything after the
   * last occurrence of the summary, not the first
   */
  let ariaSummaryIndex = aria.lastIndexOf(summary);
  if (ariaSummaryIndex === -1) {
    /**
     * If we failed to find summary in the aria string AND, the event summary
     * is parenthesised, we assume it is the `(No title)` summary (event without
     * a summary).
     */
    const isParenthesised = summary.startsWith('(') && summary.endsWith(')');
    ariaSummaryIndex = isParenthesised
      ? aria.indexOf(summary.slice(1, -1))
      : -1;

    /**
     * In Ukrainian, summary for no-summary events will be `(Без заголовка)`,
     * where as the aria string will include `Без назви`. Fallback in such
     * cases to not trimming of the name from the aria string. That is ok as
     * such name is not going to contain numbers, and thus won't interfere with
     * the time extraction.
     */
    if (ariaSummaryIndex === -1 && isParenthesised)
      ariaSummaryIndex = aria.length;

    if (ariaSummaryIndex === -1) {
      return `Expected event label (${aria}) to include event summary (${summary})`;
    } else {
      summary = '';
    }
  }
  const trimmedAria = aria.slice(0, ariaSummaryIndex);

  const allAriaTimes = extractTimeLikeNumbers(trimmedAria);

  const startTimeIndex = allAriaTimes.indexOf(numbers[0]);
  if (startTimeIndex === -1)
    return `Expected event label (${aria}) to include event start time ${numbers[0]}`;

  const endTimeCandidates = toSpliced(allAriaTimes, startTimeIndex, 1);
  if (endTimeCandidates.length === 0)
    return `Expected to find event end time in event label (${aria}) but found none`;

  const startTime = numbers[0];
  if (endTimeCandidates.length === 1) return [startTime, endTimeCandidates[0]];

  const longEndTime = endTimeCandidates.find(
    (time) => time.length > shortLengthTimeNumber,
  );
  if (longEndTime) return [startTime, longEndTime];

  /*
   * At this point, we know that am/pm time was used in the aria string and we
   * know the start time, but for end time we still have multiple candidate
   * numbers - some of the candidates are day numbers, and one of them is end
   * time.
   */

  const todayNumberIndex = endTimeCandidates.indexOf(todayDayNumber.toString());
  if (todayNumberIndex === -1)
    return `Expected event label (${aria}) to include day number ${todayDayNumber}`;

  const timesWithoutTodayNumber = toSpliced(allAriaTimes, startTimeIndex, 1);
  if (timesWithoutTodayNumber.length === 1)
    return [startTime, timesWithoutTodayNumber[0]];

  /**
   * This is a multi-day event so we want to exclude the previous/next day
   * number too
   */

  const neighboringDayNumber = touchesTop
    ? previousDayNumber
    : touchesBottom
      ? nextDayNumber
      : todayDayNumber;
  const neighboringDayNumberIndex = endTimeCandidates.indexOf(
    neighboringDayNumber.toString(),
  );
  if (neighboringDayNumberIndex === -1)
    return `Failed to parse event label (${aria})`;

  const timesWithoutDayNumbers = toSpliced(allAriaTimes, startTimeIndex, 1);
  if (timesWithoutDayNumbers.length > 1)
    return `Failed to parse event label (${aria})`;

  return [startTime, timesWithoutDayNumbers[0]];
}

/** @example 1 or 11 */
const shortLengthTimeNumber = 2;

const extractTimeLikeNumbers = (string: string): string[] =>
  Array.from(normalizeNumbers(string).match(reTimeNumber) ?? []);

// The regex has two different types of dashes:
const reTimeNumber = /\d{1,2}([^-–\d]\d{2})?/gu;

function parseTimeNumber(string: string, isAm: boolean): number {
  // 1, 12
  if (string.length <= shortLengthTimeNumber)
    return normalizeAmPm(Number.parseInt(string), isAm);
  // 1:30, 12:30
  const minutes = Number.parseInt(string.slice(-2));
  const hours = Number.parseInt(string.slice(0, -3));
  return normalizeAmPm(hours + minutes / MINUTES_IN_HOUR, isAm);
}

function normalizeAmPm(number: number, isAm: boolean): number {
  // Trust the DOM over our inferred "isAm" for >=13 numbers
  if (number >= pmAmSwitch + 1) return number;

  const whole = Math.floor(number);
  // Do not use % on fractional numbers as that is much slower
  const baseWhole = whole % pmAmSwitch;

  // Round to compensate for loss of precision (make 1.12 - 1 be 0.12)
  const fraction = roundToTwoDecimals(number - whole);
  const normalizedWhole = isAm ? baseWhole : baseWhole + pmAmSwitch;
  return normalizedWhole + fraction;
}

const pmAmSwitch = 12;
