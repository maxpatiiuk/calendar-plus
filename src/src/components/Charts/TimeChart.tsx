import React from 'react';

import { commonText } from '../../localization/common';
import type { IR, RA } from '../../utils/types';
import { formatNumber, HOUR, MINUTE } from '../Atoms/Internationalization';
import { CalendarsContext } from '../Contexts/CalendarsContext';
import type { DayHours, EventsStore } from '../EventsStore';
import { summedDurations } from '../EventsStore';
import { CalendarIndicator } from '../Molecules/CalendarIndicator';
import { WidgetContainer } from '../Widgets/WidgetContainer';

export function TimeChart({
  label,
  durations,
}: {
  readonly label: string;
  readonly durations: EventsStore | undefined;
}): JSX.Element {
  const editing = React.useState<boolean>(false);
  const calendars = React.useContext(CalendarsContext)!;
  const times = React.useMemo(
    () => (durations === undefined ? undefined : getTimes(durations)),
    [durations]
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
  // FEATURE: average/total switch
  return (
    <WidgetContainer editing={editing} header={label}>
      {times === undefined || totals === undefined || rowMax === undefined ? (
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
              <th scope="col">
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
                <th className="text-left" scope="row">
                  <CalendarIndicator color={backgroundColor} />
                  {summary}
                </th>
                {Array.from({ length: 24 }, (_, index) => (
                  <td
                    key={index}
                    className="bg-[color:var(--color)]"
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
              <th className="text-left" scope="row">
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
const getTimes = (durations: EventsStore): IR<DayHours> =>
  Object.fromEntries(
    Object.entries(durations).map(([id, durations]) => [
      id,
      summedTimes(Object.values(durations[summedDurations])),
    ])
  );

const summedTimes = (durations: RA<DayHours>): DayHours => ({
  total: durations.reduce((sum, { total }) => sum + total, 0) / (HOUR / MINUTE),
  hourly: Array.from(
    { length: 24 },
    (_, index) =>
      durations.reduce((total, { hourly }) => total + hourly[index], 0) /
      (HOUR / MINUTE)
  ),
});

const getOpacity = (value: number, max: number): string =>
  Math.floor((value / max) * (2 ** 8 - 1))
    .toString(16)
    .padStart(2, '0');
