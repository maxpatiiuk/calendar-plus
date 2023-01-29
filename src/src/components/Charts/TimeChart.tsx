import React from 'react';

import { useSimpleStorage } from '../../hooks/useStorage';
import { commonText } from '../../localization/common';
import type { IR, RA } from '../../utils/types';
import { Button } from '../Atoms';
import { formatNumber, HOUR, MINUTE } from '../Atoms/Internationalization';
import { CalendarsContext } from '../Contexts/CalendarsContext';
import type { DayHours, EventsStore } from '../EventsStore';
import { summedDurations } from '../EventsStore';
import { CalendarIndicator } from '../Molecules/CalendarIndicator';
import { WidgetContainer } from '../Widgets/WidgetContainer';

export type TimeChartMode = 'average' | 'total';
const stickyColumn = 'sticky left-0 bg-white';

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
        : getTimes(durations, mode),
    [durations, mode]
  );
  const rowMax = React.useMemo(
    () =>
      times === undefined
        ? undefined
        : Object.fromEntries(
            Object.entries(times).map(([id, durations]) => [
              id,
              Math.max(...durations.hourly, 1),
            ])
          ),
    [times]
  );

  const totals = React.useMemo(
    () =>
      times === undefined
        ? undefined
        : Array.from({ length: 24 }, (_, index) =>
            calendars.reduce(
              (total, { id }) => total + times[id].hourly[index],
              0
            )
          ),
    [times, calendars]
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
      {times === undefined ||
      totals === undefined ||
      rowMax === undefined ||
      mode === undefined ? (
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
              <th scope="col" className={stickyColumn}>
                <span className="sr-only">{commonText('calendars')}</span>
              </th>
              {Array.from({ length: 24 }, (_, index) => (
                <th className="justify-center" key={index} scope="col">
                  {/* FIXME: display AM/PM when appropriate */}
                  {index}
                </th>
              ))}
              <th className="justify-center" scope="col">
                {commonText('total')}
              </th>
            </tr>
          </thead>
          <tbody>
            {calendars.map(({ id, summary, backgroundColor }) => (
              <tr key={id}>
                <th className={`text-left ${stickyColumn}`} scope="row">
                  <CalendarIndicator color={backgroundColor} />
                  {summary}
                </th>
                {Array.from({ length: 24 }, (_, index) => (
                  <td
                    className="bg-[color:var(--color)]"
                    key={index}
                    style={
                      {
                        '--color': `${backgroundColor}${getOpacity(
                          times[id].hourly[index],
                          rowMax[id]
                        )}`,
                      } as React.CSSProperties
                    }
                  >
                    {number(times[id].hourly[index])}
                  </td>
                ))}
                <td>{number(times[id].total)}</td>
              </tr>
            ))}
            <tr>
              <th className={`text-left ${stickyColumn}`} scope="row">
                <CalendarIndicator color="transparent" />
                {commonText('total')}
              </th>
              {totals.map((total, index) => (
                <td key={index}>{number(total)}</td>
              ))}
              <td>
                {number(
                  totals
                    .map((total) => total)
                    .reduce((sum, total) => sum + total, 0)
                )}
              </td>
            </tr>
          </tbody>
        </table>
      )}
    </WidgetContainer>
  );
}

const number = (number: number) => formatNumber(Math.round(number));

/**
 * Sum durations for the current period
 */
const getTimes = (durations: EventsStore, mode: TimeChartMode): IR<DayHours> =>
  Object.fromEntries(
    Object.entries(durations).map(([id, durations]) => [
      id,
      summedTimes(
        Object.values(durations[summedDurations]),
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
  hourly: Array.from({ length: 24 }, (_, index) =>
    aggregate(durations.map(({ hourly }) => hourly[index]))
  ),
});

const getOpacity = (value: number, max: number): string =>
  Math.floor((value / max) * (2 ** 8 - 1))
    .toString(16)
    .padStart(2, '0');

export const exportsForTests = {
  getTimes,
  getOpacity,
};
