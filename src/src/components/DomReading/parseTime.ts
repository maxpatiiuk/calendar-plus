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

  const [start, end, touchesBottom] = times;
  const startTime = rawDomEvent.touchesTop
    ? 0
    : parseTimeNumber(start, rawDomEvent.amStart);
  const endTime = touchesBottom ? 24 : parseTimeNumber(end, rawDomEvent.amEnd);
  if (Number.isNaN(startTime))
    return `Failed to parse start time from event label`;
  if (Number.isNaN(endTime)) return `Failed to parse end time from event label`;

  return {
    calendarId: rawDomEvent.calendarId,
    summary: rawDomEvent.summary,
    startTime,
    endTime,
  };
}

/**
 * There are many scenarios to handle, and in some of them we could exit the
 * function early. But, it is easier to reason about a function, and fewer edge
 * cases to handle if every kind of input goes through all code paths.
 */
function extractTimes({
  aria,
  summary,
  touchesTop,
  previousDayNumber,
  todayDayNumber,
  nextDayNumber,
}: RawDomEvent): readonly [string, string, touchesBottom: boolean] | string {
  /*
   * Exclude part of the aria string that includes the event summary and
   * calendar name to avoid them interfering with time extraction.
   *
   * I verified that in every Google Calendar language, the start and end time
   * occurs in the string before the summary.
   *
   * Still, just in case event name is "8" or "8:00" trim everything after the
   * last occurrence of the summary, not the first
   *
   * The only case this would fail is when calendar name or location includes
   * the summary AND the summary includes at least one 1-2 digit number.
   */
  let ariaSummaryIndex = aria.lastIndexOf(summary);
  if (ariaSummaryIndex === -1) {
    /*
     * If we failed to find summary in the aria string AND, the event summary
     * is parenthesised, we assume it is the `(No title)` summary (event without
     * a summary).
     */
    const isParenthesised = summary.startsWith('(') && summary.endsWith(')');
    ariaSummaryIndex = isParenthesised
      ? aria.indexOf(summary.slice(1, -1))
      : -1;

    /*
     * In Ukrainian, summary for no-summary events will be `(Без заголовка)`,
     * where as the aria string will include `Без назви`. Fallback in such
     * cases to not trimming of the name from the aria string. That is ok as
     * such name is not going to contain numbers, and thus won't interfere with
     * the time extraction.
     */
    if (ariaSummaryIndex === -1 && isParenthesised)
      ariaSummaryIndex = aria.length;

    if (ariaSummaryIndex === -1) {
      return `Expected event label to include event summary`;
    }
  }
  const trimmedAria = aria.slice(0, ariaSummaryIndex);

  let ariaTimes = extractTimeLikeNumbers(trimmedAria);

  /*
   * This is the case for two day events. Aria would include the today day
   * number, tomorrow/yesterday day number, and end time.
   *
   * Event must not last more than 24hrs or else it would be rendered as an
   * all-day event, which is handled outside this function, thus the event we
   * handle here can only span either from previous day or into next day.
   */
  const isTwoDayEvent = ariaTimes.length > 2;
  if (isTwoDayEvent) {
    const todayNumberIndex = ariaTimes.indexOf(todayDayNumber.toString());
    if (todayNumberIndex === -1)
      return `Expected event label to include today day number`;
    ariaTimes = toSpliced(ariaTimes, todayNumberIndex, 1);

    const neighboringDayNumber = touchesTop ? previousDayNumber : nextDayNumber;
    const neighboringDayNumberIndex = ariaTimes.indexOf(
      neighboringDayNumber.toString(),
    );
    if (neighboringDayNumberIndex === -1)
      return `Expected to find the neighboring day number in the aria string`;
    ariaTimes = toSpliced(ariaTimes, neighboringDayNumberIndex, 1);
  }

  if (ariaTimes.length !== 2) return `Failed to parse event label`;

  /**
   * We can detect `touchesTop` case from the DOM quite safely, but can't
   * as safely detect `touchesBottom` case, so are inferring it from the aria
   * string instead.
   */
  const touchesBottom = isTwoDayEvent && !touchesTop;
  return [ariaTimes[0], ariaTimes[1], touchesBottom];
}

/**
 * @example 1
 * @example 11
 */
const shortLengthTimeNumber = 2;

const extractTimeLikeNumbers = (string: string): readonly string[] =>
  Array.from(normalizeNumbers(string).match(reTimeNumber) ?? []);

// The regex has two different types of dashes:
const reTimeNumber = /(?<!\d)\d{1,2}([^-–\d]\d{2})?(?!\d)/gu;

/**
 * Parse without making assumptions about what the colon character is
 */
function parseTimeNumber(string: string, isAm: boolean): number {
  // 1, 12
  if (string.length <= shortLengthTimeNumber)
    return normalizeAmPm(Number.parseInt(string), 0, isAm);
  // 1:30, 12:30
  const minutes = Number.parseInt(string.slice(-2));
  const hours = Number.parseInt(string.slice(0, -3));
  return normalizeAmPm(hours, minutes, isAm);
}

function normalizeAmPm(whole: number, minutes: number, isAm: boolean): number {
  /**
   * In case of >=13, trust the aria label over our inferred "isAm".
   * In case of 12, normalizeAmPm is only called with 12 if event does not
   * touch top or does not touch bottom - thus 12 is definitely not 0 and not 24.
   */
  const isNormalized = whole >= pmAmSwitch;

  const baseWhole = whole % pmAmSwitch;
  const normalizedWhole = isNormalized
    ? whole
    : isAm
      ? baseWhole
      : baseWhole + pmAmSwitch;

  const fraction = minutes / MINUTES_IN_HOUR;
  // Round to compensate for loss of precision
  const result = roundToTwoDecimals(normalizedWhole + fraction);
  return result;
}

const pmAmSwitch = 12;
