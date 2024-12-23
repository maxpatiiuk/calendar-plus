import { roundToTwoDecimals } from '../../utils/utils';
import { MINUTES_IN_HOUR } from '../Atoms/Internationalization';
import { normalizeNumbers } from './normalizeNumbers';
import type { ParsedDomEvent, RawDomEvent } from './types';

// FIXME: handle 0 duration event
export function rawDomEventToParsed(
  rawDomEvent: RawDomEvent,
  languageData: LanguageData,
): ParsedDomEvent | string {
  const times = extractTimes(rawDomEvent, languageData);
  if (typeof times === 'string') return times;

  const [startTime, endTime] = times;
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
function extractTimes(
  { aria, summary, touchesTop }: RawDomEvent,
  languageData: LanguageData,
): readonly [number, number] | string {
  /*
   * Exclude part of the aria string that includes the event summary and
   * calendar name to avoid them interfering with time extraction.
   *
   * I verified that in every Google Calendar language, the start and end time
   * occurs in the string before the summary.
   *
   * Still, just in case event name is "8:00" trim everything after the last
   * occurrence of the summary, not the first
   *
   * The only case this would fail is when calendar name or location includes
   * the summary AND the summary includes a reTimeNumber number
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
      return 'Expected event label to include event summary';
    }
  }
  const trimmedAria = aria.slice(0, ariaSummaryIndex);

  let [startTime, endTime] = extractTimeLikeNumbers(trimmedAria, languageData);
  if (startTime === undefined) return 'Failed to extract the event start time';
  if (endTime === undefined) return 'Failed to extract the event start time';

  /*
   * This is the case for two day events. Event must not last more than 24hrs or
   * else it would be rendered as an all-day event, which is handled outside
   * this function, thus the event we handle here can only span either from
   * previous day or into next day.
   */
  const isTwoDayEvent = endTime < startTime;

  /**
   * We can detect `touchesTop` case from the DOM quite safely, but can't
   * as safely detect `touchesBottom` case, so are inferring it from the aria
   * string instead.
   */
  const touchesBottom = isTwoDayEvent && !touchesTop;

  if (touchesTop) startTime = 0;
  if (touchesBottom) endTime = 24;

  return [startTime, endTime];
}

function extractTimeLikeNumbers(
  string: string,
  [isPrefix, am, pm, amAlt, pmAlt]: LanguageData,
): readonly number[] {
  const numbers: number[] = [];
  Array.from(
    normalizeNumbers(string).matchAll(reTimeNumber) ?? [],
    ({ index, 0: numberString }) => {
      const length = numberString.length;
      numberString =
        numberString.startsWith('0') && numberString.length > 1
          ? numberString.slice(1)
          : numberString;
      const isShort = numberString.length <= shortLengthTimeNumber;
      const substring = isPrefix
        ? string.slice(0, index)
        : string.slice(index + length);
      const isAm = isPrefix
        ? substring.endsWith(am)
        : substring.startsWith(am) ||
          (amAlt !== undefined && substring.startsWith(amAlt));
      const isPm = isPrefix
        ? substring.endsWith(pm)
        : substring.startsWith(pm) ||
          (pmAlt !== undefined && substring.startsWith(pmAlt));

      // Ignore day and month numbers
      const isTimeNumber = !isShort || isAm || isPm;
      if (isTimeNumber) numbers.push(parseTimeNumber(numberString, isAm, isPm));
    },
  );
  return numbers;
}

/**
 * @example 1
 * @example 11
 */
const shortLengthTimeNumber = 2;
const reTimeNumber = /(?<!\d)\d{1,2}([:.]\d{2})?(?!\d)/gu;

export type LanguageData = readonly [
  isPrefix: boolean,
  am: string,
  pm: string,
  amAlt?: string,
  pmRight?: string,
];

const amPmParts: Record<
  string,
  readonly [am: string, pm: string, amAlt?: string, pmRight?: string]
> = {
  af: [' vm.', ' nm.'],
  az: [' AM', ' PM'],
  id: ['am', 'pm'],
  ca: ['am', 'pm'],
  cy: [' yb', ' yh'],
  da: ['am', 'pm'],
  de: ['AM', 'PM'],
  'en-GB': ['am', 'pm'],
  en: ['am', 'pm'],
  es: ['am', 'pm'],
  'es-419': ['am', 'pm'],
  eu: [' AM', ' PM'],
  fil: ['AM', 'PM'],
  fr: ['am', 'pm'],
  'fr-CA': ['am', 'pm'],
  gl: [' a.m.', ' p.m.'],
  hr: ['AM', 'PM'],
  zu: [' AM', ' PM'],
  it: ['AM', 'PM'],
  sw: [' AM', ' PM'],
  lv: ['am', 'pm'],
  lt: ['AM', 'PM'],
  hu: ['am', 'pm'],
  ms: [' PG', ' PTG'],
  nl: ['am', 'pm'],
  no: ['am', 'pm'],
  pl: ['am', 'pm'],
  'pt-BR': ['am', 'pm'],
  'pt-PT': ['am', 'pm'],
  ro: [' am', ' pm'],
  sk: ['am', 'pm'],
  sl: ['am', 'pm'],
  fi: ['ap', 'ip'],
  sv: ['am', 'pm'],
  vi: ['AM', 'PM'],
  tr: ['am', 'pm'],
  is: [' f.h.', ' e.h.'],
  cs: ['AM', 'PM'],
  el: [' πμ', ' μμ'],
  be: [' AM', ' PM'],
  bg: [' am', ' pm'],
  mn: [' ү.ө.', ' ү.х.', ' ц ү.ө.', ' ц ү.х.'],
  ru: ['AM', 'PM'],
  sr: ['am', 'pm'],
  uk: ['дп', 'пп'],
  kk: [' AM', ' PM'],
  hy: [' AM', ' PM'],
  iw: [' לפ', ' אח'],
  ar: [' ص', ' م'],
  ur: [' AM', ' PM'],
  fa: [' قب', ' بع'],
  ne: [' पूर्वाह्न', ' अपराह्न'],
  mr: [' AM', ' PM'],
  hi: [' am', ' pm'],
  bn: [' AM', ' PM'],
  pa: [' ਪੂ.ਦੁ.', ' ਬਾ.ਦੁ.'],
  gu: [' AM', ' PM'],
  ta: [' AM', ' PM'],
  te: [' AM', ' PM'],
  kn: [' ಪೂರ್ವಾಹ್ನ', ' ಅಪರಾಹ್ನ'],
  ml: [' AM', ' PM'],
  si: ['පෙ.ව. ', 'ප.ව. '],
  th: ['am', 'pm'],
  lo: [' ໂມງກ່ອນທ່ຽງ', ' ໂມງຫຼັງທ່ຽງ', ' ໂມງ​ກ່ອນທ່ຽງ', ' ຫຼັງທ່ຽງ'],
  my: ['နံနက် ', 'ညနေ '],
  ka: [' AM', ' PM'],
  am: [' ጥዋት', ' ከሰዓት'],
  km: [' AM', ' PM'],
  'zh-HK': ['上午', '下午'],
  'zh-CN': ['上午', '下午'],
  'zh-TW': ['上午', '下午'],
  ja: ['午前', '午後'],
  ko: ['오전 ', '오후 '],
};
const amPmPrefixLanguages = new Set([
  'si',
  'my',
  'zh-HK',
  'zh-CN',
  'zh-TW',
  'ja',
  'ko',
]);

export function getLanguageData(language: string): LanguageData | undefined {
  const languageEntry = amPmParts[language];
  const isPrefix = amPmPrefixLanguages.has(language);
  return languageEntry === undefined
    ? undefined
    : ([isPrefix, ...languageEntry] as const);
}

function parseTimeNumber(string: string, isAm: boolean, isPm: boolean): number {
  // 1, 12 VS 1:30, 12:30
  const isShort = string.length <= shortLengthTimeNumber;
  const minutes = isShort ? 0 : Number.parseInt(string.slice(-2));
  const hours = Number.parseInt(isShort ? string : string.slice(0, -3));
  return normalizeAmPm(hours, minutes, isAm, isPm);
}

function normalizeAmPm(
  whole: number,
  minutes: number,
  isAm: boolean,
  isPm: boolean,
): number {
  const hours = isAm
    ? whole === amPmSwitch
      ? 0
      : whole
    : isPm
      ? whole === amPmSwitch
        ? whole
        : whole + amPmSwitch
      : whole;

  const fraction = minutes / MINUTES_IN_HOUR;
  // Round to compensate for loss of precision
  const result = roundToTwoDecimals(hours + fraction);
  return result;
}

const amPmSwitch = 12;
