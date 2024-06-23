/**
 * Various tools to help internationalize the application
 */

import { commonText } from '../../localization/common';
import { LANGUAGE } from '../../localization/utils';
import { output } from '../Errors/exceptions';
import type { RA } from '../../utils/types';
import { capitalize } from '../../utils/utils';
import type { SupportedView } from '../Contexts/CurrentViewContext';

/* This is an incomplete definition. For complete, see MDN Docs */
// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace Intl {
  class ListFormat {
    public constructor(
      locales?: RA<string> | string,
      options?: {
        readonly type?: 'conjunction' | 'disjunction';
        readonly style?: 'long' | 'narrow' | 'short';
      },
    );

    public format(values: RA<string>): string;
  }

  class DisplayNames {
    public constructor(
      locales?: RA<string> | string,
      options?: {
        readonly type:
          | 'calendar'
          | 'currency'
          | 'dateTimeField'
          | 'language'
          | 'region'
          | 'script';
      },
    );

    public of(code: string): string;
  }

  class NumberFormat {
    public constructor(locales?: RA<string> | string);

    public format(value: number): string;
  }

  class RelativeTimeFormat {
    public constructor(
      locales?: RA<string> | string,
      options?: {
        readonly numeric: 'always' | 'auto';
        readonly style: 'long' | 'narrow' | 'short';
      },
    );

    public format(
      count: number,
      type: 'day' | 'hour' | 'minute' | 'month' | 'second' | 'week' | 'year',
    ): string;
  }

  class DateTimeFormat {
    public constructor(
      locales?: RA<string> | string,
      options?: {
        readonly dateStyle?: 'full' | 'long' | 'medium' | 'short';
        readonly timeStyle?: 'full' | 'long' | 'medium' | 'short';
        readonly month?: 'long' | 'short';
        readonly weekday?: 'long' | 'short';
        readonly day?: 'numeric';
      },
    );

    public format(value: Readonly<Date>): string;
  }

  class Collator {
    public constructor(
      locales?: RA<string> | string,
      options?: {
        readonly sensitivity?: 'accent' | 'base' | 'case' | 'variant';
        readonly caseFirst?: 'lower' | 'upper' | false;
        readonly ignorePunctuation?: boolean;
      },
    );

    public compare(left: string, right: string): -1 | 0 | 1;
  }
}

function getMonthNames(monthFormat: 'long' | 'short'): RA<string> {
  const months = new Intl.DateTimeFormat(LANGUAGE, { month: monthFormat });
  return Array.from({ length: 12 }, (_, month) =>
    months.format(new Date(0, month, 2, 0, 0, 0)),
  );
}

// Localized month names
export const months = getMonthNames('long');

const listFormatter = new Intl.ListFormat(LANGUAGE, {
  style: 'long',
  type: 'conjunction',
});
export const formatList = (list: RA<string>): string =>
  listFormatter.format(list);

const datePartLocalizer = new Intl.DisplayNames(LANGUAGE, {
  type: 'dateTimeField',
});
export const dateParts = {
  fullDate: commonText('fullDate'),
  day: capitalize(datePartLocalizer.of('day')),
  month: capitalize(datePartLocalizer.of('month')),
  year: capitalize(datePartLocalizer.of('year')),
} as const;

const numberFormatter = new Intl.NumberFormat(LANGUAGE);
export const formatNumber = (number: number): string =>
  numberFormatter.format(number);

/* eslint-disable @typescript-eslint/no-magic-numbers */
export const MILLISECONDS = 1;
export const SECOND = 1000 * MILLISECONDS;
export const MINUTE = 60 * SECOND;
export const HOUR = 60 * MINUTE;
export const DAY = 24 * HOUR;
export const MILLISECONDS_IN_DAY = DAY / MILLISECONDS;
export const MINUTES_IN_HOUR = HOUR / MINUTE;
export const WEEK = 7 * DAY;
export const MONTH = 4 * WEEK;
export const YEAR = 12 * MONTH;
/* eslint-enable @typescript-eslint/no-magic-numbers */
const relativeDate = new Intl.RelativeTimeFormat(LANGUAGE, {
  numeric: 'auto',
  style: 'long',
});

/** Does not support future dates */
export function getRelativeDate(date: Readonly<Date>): string {
  const timePassed = Date.now() - date.getTime();
  if (timePassed < 0) {
    /*
     * This happens due to time zone conversion issues.
     * Need to fix that issue on the back-end first.
     * See: https://github.com/specify/specify7/issues/641
     * Adding support for future dates is not hard, but it would be weird to
     * create a data set and see its date of creation be 5 hours into the
     * future
     */
    // Throw new Error('Future dates are not supported');
    output.error('Future dates are not supported');
    return relativeDate.format(0, 'second');
  } else if (timePassed <= MINUTE)
    return relativeDate.format(-Math.round(timePassed / SECOND), 'second');
  else if (timePassed <= HOUR)
    return relativeDate.format(-Math.round(timePassed / MINUTE), 'minute');
  else if (timePassed <= DAY)
    return relativeDate.format(-Math.round(timePassed / HOUR), 'hour');
  else if (timePassed <= WEEK)
    return relativeDate.format(-Math.round(timePassed / DAY), 'day');
  else if (timePassed <= MONTH)
    return relativeDate.format(-Math.round(timePassed / WEEK), 'week');
  else if (timePassed <= YEAR)
    return relativeDate.format(-Math.round(timePassed / MONTH), 'month');
  else return relativeDate.format(-Math.round(timePassed / YEAR), 'year');
}

const dateFormatters = {
  day: new Intl.DateTimeFormat(LANGUAGE, { dateStyle: 'full' }),
  week: new Intl.DateTimeFormat(LANGUAGE, { weekday: 'long', day: 'numeric' }),
  month: new Intl.DateTimeFormat(LANGUAGE, { day: 'numeric' }),
  year: new Intl.DateTimeFormat(LANGUAGE, { month: 'long' }),
  customday: new Intl.DateTimeFormat(LANGUAGE, {
    weekday: 'long',
    day: 'numeric',
  }),
  customweek: new Intl.DateTimeFormat(LANGUAGE, {
    day: 'numeric',
  }),
} as const;

export const formatDateLabel = (date: Date, view: SupportedView): string =>
  dateFormatters[view].format(date);

export const dateToIso = (date: Date): string =>
  `${date.getFullYear()}-${date.getMonth().toString().padStart(2, '0')}-${date
    .getDate()
    .toString()
    .padStart(2, '0')}`;

// eslint-disable-next-line @typescript-eslint/unbound-method
export const compareStrings = new Intl.Collator(
  globalThis.navigator?.language ?? 'en-us',
  {
    sensitivity: 'base',
    caseFirst: 'upper',
    ignorePunctuation: true,
  },
).compare;

/**
 * Format duration in minutes into an hours+minutes string
 */
export function formatMinutesDuration(duration: number): string {
  const hours = Math.floor(duration / MINUTES_IN_HOUR);
  const minutes = duration % MINUTES_IN_HOUR;
  const formattedMinutes = `${minutes} ${commonText('minutes')}`;
  return hours === 0
    ? formattedMinutes
    : `${hours} ${commonText('hours')}${
        minutes === 0 ? '' : ` ${formattedMinutes}`
      }`;
}

/**
 * Format duration in hours into an hours+minutes string
 */
export const formatHoursDuration = (duration: number): string =>
  formatMinutesDuration(duration * MINUTES_IN_HOUR);
