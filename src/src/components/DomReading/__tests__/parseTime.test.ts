import fs from 'fs';
import languageUrls from './fixtures/languages.json';
import { join } from 'node:path/posix';
import { rawDomEventToParsed } from '../parseTime';
import { ParsedDomEvent, RawDomEvent } from '../types';

const languageCodes = languageUrls.map((url) => {
  const languageCodeIndex = url.indexOf('matasync.') + 'matasync.'.length;
  return url.slice(languageCodeIndex, url.indexOf('.', languageCodeIndex));
});
const languageCount = languageCodes.length;
const languageAmPmCount = languageCount * 2;
const languageSummaryWithTimeCount = languageAmPmCount * 2;

const parsed = fs
  .readFileSync(join(__dirname, 'fixtures/scrapped.txt'), 'utf8')
  .split('\n\n\n')
  .map((column) =>
    column.length === 0
      ? []
      : column.split('\n\n').map((event) => {
          const [data, ...languages] = event.split('\n');
          if (languages.length !== languageSummaryWithTimeCount)
            throw new Error(
              `Expected to find ${languageSummaryWithTimeCount} language entries, but got ${languages.length}`,
            );
          return {
            languages: Array.from(
              { length: languages.length / 2 },
              (_, index) =>
                languages.slice(index * 2, index * 2 + 2) as [string, string],
            ),
            ...(JSON.parse(data) as Omit<RawDomEvent, 'aria' | 'times'> &
              Pick<ParsedDomEvent, 'startTime' | 'endTime'>),
          };
        }),
  );

const startDay = 10;
const expectedLengths = [9, 4, 1, 0, 2, 2, 0];

parsed.forEach((column, index) => {
  if (column.length !== expectedLengths[index]) {
    throw new Error(
      `Parsing fixtures failed: Expected column ${index} in scrapped.tsx to have ${expectedLengths[index]} items, but got ${column.length}`,
    );
  }
});

describe('parseTime', () =>
  parsed.forEach((column, columnIndex) =>
    column.forEach((event, eventIndex) =>
      describe(`Parses "${event.summary}"`, () => {
        const dayNumber = startDay + columnIndex;
        const calendarId = `test_${columnIndex}_${eventIndex}@group.calendar.google.com`;
        const commonProps: Omit<RawDomEvent, 'aria' | 'times'> = {
          summary: event.summary,
          calendarId,
          amStart: event.amStart,
          amEnd: event.amEnd,
          touchesTop: event.touchesTop,
          previousDayNumber: dayNumber - 1,
          todayDayNumber: dayNumber,
          nextDayNumber: dayNumber + 1,
        };

        event.languages.forEach(([aria, _times], entryIndex) => {
          const isOdd = entryIndex % 2 === 1;
          const languageIndex = isOdd ? (entryIndex - 1) / 2 : entryIndex / 2;
          const languageCode = languageCodes[languageIndex];
          test(`${languageCode} (${aria})`, () => {
            if (
              typeof rawDomEventToParsed({
                aria,
                ...commonProps,
              }) === 'string'
            )
              debugger;
            expect(
              rawDomEventToParsed({
                aria,
                ...commonProps,
              }),
            ).toEqual({
              calendarId,
              summary: event.summary,
              startTime: event.startTime,
              endTime: event.endTime,
            });
          });
        });
      }),
    ),
  ));
