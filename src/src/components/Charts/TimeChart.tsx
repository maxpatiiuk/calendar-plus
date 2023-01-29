import React from 'react';

import { useSimpleStorage } from '../../hooks/useStorage';
import { commonText } from '../../localization/common';
import type { IR, RA } from '../../utils/types';
import { Button } from '../Atoms';
import { DAY, formatNumber, HOUR, MINUTE } from '../Atoms/Internationalization';
import type { CalendarListEntry } from '../Contexts/CalendarsContext';
import { CalendarsContext } from '../Contexts/CalendarsContext';
import type { DayHours, EventsStore } from '../EventsStore';
import { summedDurations } from '../EventsStore';
import { CalendarIndicator } from '../Molecules/CalendarIndicator';
import { WidgetContainer } from '../Widgets/WidgetContainer';

export type TimeChartMode = 'average' | 'total';
const stickyColumn = 'sticky left-0 bg-white';
const darkened = 'bg-gray-300';
const extraDarkened = 'bg-gray-400';

export function TimeChart({
  label,
  durations,
}: {
  readonly label: string;
  readonly durations: EventsStore | undefined;
}): JSX.Element {
  const [mode, setMode] = useSimpleStorage('timeChartMode', 'total');

  const calendars = React.useContext(CalendarsContext)!;
  const times = React.useMemo(
    () =>
      durations === undefined || mode === undefined
        ? undefined
        : getTimes(durations, summedDurations, mode),
    [durations, mode]
  );

  return (
    <WidgetContainer
      buttons={
        <div className="flex gap-2">
          <span className="sr-only">{commonText('viewMode')}</span>
          <Button.White
            aria-pressed={mode === 'total' ? true : undefined}
            title={commonText('viewMode')}
            onClick={(): void => setMode('total')}
          >
            {commonText('totalHours')}
          </Button.White>
          <Button.White
            aria-pressed={mode === 'average' ? true : undefined}
            title={commonText('viewMode')}
            onClick={(): void => setMode('average')}
          >
            {commonText('averageMinutes')}
          </Button.White>
        </div>
      }
      header={label}
    >
      {times === undefined || mode === undefined ? (
        commonText('loading')
      ) : (
        <table
          className={`
            grid-table grid-cols-[auto_repeat(24,1fr)_1fr]
            overflow-auto [&_:is(th,td)]:p-2
            [&_td]:justify-center
          `}
        >
          <thead>
            <tr>
              <th className={stickyColumn} scope="col">
                <span className="sr-only">{commonText('calendars')}</span>
              </th>
              {Array.from({ length: DAY / HOUR }, (_, index) => (
                <th className="justify-center" key={index} scope="col">
                  {/* FIXME: display AM/PM when appropriate */}
                  {index}
                </th>
              ))}
              <th className={`justify-center ${darkened}`} scope="col">
                {commonText('total')}
              </th>
            </tr>
          </thead>
          <tbody>
            {calendars.map((calendar) => (
              <Row
                calendar={calendar}
                key={calendar.id}
                times={times[calendar.id]}
              />
            ))}
            <TotalsRow times={times} />
          </tbody>
        </table>
      )}
    </WidgetContainer>
  );
}

/**
 * Sum durations for the current period
 */
const getTimes = (
  durations: EventsStore,
  key: string | typeof summedDurations,
  mode: TimeChartMode
): IR<DayHours> =>
  Object.fromEntries(
    Object.entries(durations).map(([id, durations]) => [
      id,
      summedTimes(
        Object.values(durations[key]),
        mode === 'total' ? toTotalHours : toAverageMinutes
      ),
    ])
  );

const toTotalHours = (durations: RA<number>): number =>
  durations.reduce((sum, duration) => sum + duration, 0) / (HOUR / MINUTE);

const toAverageMinutes = (durations: RA<number>): number =>
  durations.reduce((sum, duration) => sum + duration, 0) / durations.length;

const summedTimes = (
  durations: RA<DayHours>,
  aggregate: (numbers: RA<number>) => number
): DayHours => ({
  total: aggregate(durations.map(({ total }) => total)),
  hourly: Array.from({ length: DAY / HOUR }, (_, index) =>
    aggregate(durations.map(({ hourly }) => hourly[index]))
  ),
});

function Row({
  calendar: { id, summary, backgroundColor },
  times: { hourly, total },
}: {
  readonly calendar: CalendarListEntry;
  readonly times: DayHours;
}): JSX.Element {
  const max = Math.max(...hourly, 1);
  return (
    <tr key={id}>
      <th className={`text-left ${stickyColumn}`} scope="row">
        <CalendarIndicator color={backgroundColor} />
        {summary}
      </th>
      {Array.from({ length: DAY / HOUR }, (_, index) => (
        <td
          className="bg-[color:var(--color)]"
          key={index}
          style={
            {
              '--color': `${backgroundColor}${getOpacity(hourly[index], max)}`,
            } as React.CSSProperties
          }
        >
          {number(hourly[index])}
        </td>
      ))}
      <td className={darkened}>{number(total)}</td>
    </tr>
  );
}

const number = (number: number): string => formatNumber(Math.round(number));

const getOpacity = (value: number, max: number): string =>
  Math.floor((value / max) * (2 ** 8 - 1))
    .toString(16)
    .padStart(2, '0');

function TotalsRow({ times }: { readonly times: IR<DayHours> }): JSX.Element {
  const calendars = React.useContext(CalendarsContext)!;
  const totals = React.useMemo(
    () =>
      Array.from({ length: DAY / HOUR }, (_, index) =>
        calendars.reduce((total, { id }) => total + times[id].hourly[index], 0)
      ),
    [times, calendars]
  );
  return (
    <tr>
      <th className={`text-left ${darkened} ${stickyColumn}`} scope="row">
        <CalendarIndicator color="transparent" />
        {commonText('total')}
      </th>
      {totals.map((total, index) => (
        <td className={darkened} key={index}>
          {number(total)}
        </td>
      ))}
      <td className={extraDarkened}>
        {number(
          totals.map((total) => total).reduce((sum, total) => sum + total, 0)
        )}
      </td>
    </tr>
  );
}

export const exportsForTests = {
  getTimes,
  getOpacity,
};
