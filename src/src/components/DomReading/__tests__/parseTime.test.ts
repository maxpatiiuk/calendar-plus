import fs from 'fs';
import languageUrls from './fixtures/languages.json';
import { join } from 'node:path/posix';
import { getLanguageData, rawDomEventToParsed } from '../parseTime';
import { ParsedDomEvent, RawDomEvent } from '../types';
import inspector from 'inspector';

const isInDebugger = inspector.url() !== undefined;

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

// const startDay = 10;
const expectedLengths = [9, 4, 1, 0, 2, 2, 0];

parsed.forEach((column, index) => {
  if (column.length !== expectedLengths[index]) {
    throw new Error(
      `Parsing fixtures failed: Expected column ${index} in scrapped.tsx to have ${expectedLengths[index]} items, but got ${column.length}`,
    );
  }
});

// TEST: add no-title events
// TEST: add 0 duration events
// TEST: add 12pm-12am events
// TEST: add 12am-12pm events
describe('parseTime', () =>
  parsed.forEach((column, columnIndex) =>
    column.forEach((event, eventIndex) =>
      describe(`Parses "${event.summary}"`, () => {
        const calendarId = `test_${columnIndex}_${eventIndex}@group.calendar.google.com`;
        const commonProps: Omit<RawDomEvent, 'aria' | 'times'> = {
          summary: event.summary,
          calendarId,
          touchesTop: event.touchesTop,
        };

        event.languages.forEach(([aria, _times], entryIndex) => {
          const isOdd = entryIndex % 2 === 1;
          const languageIndex = isOdd ? (entryIndex - 1) / 2 : entryIndex / 2;
          const languageCode = languageCodes[languageIndex].replace('_', '-');
          test(`${languageCode} (${aria})`, () => {
            const languageData = getLanguageData(languageCode)!;
            expect(languageData).toBeDefined();
            const result = rawDomEventToParsed(
              {
                aria,
                ...commonProps,
              },
              languageData,
            );
            if (
              isInDebugger &&
              (typeof result === 'string' ||
                result.endTime === undefined ||
                result.startTime !== event.startTime ||
                result.endTime !== event.endTime)
            ) {
              debugger;
              rawDomEventToParsed(
                {
                  aria,
                  ...commonProps,
                },
                languageData,
              );
            }
            expect(result).toEqual({
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
