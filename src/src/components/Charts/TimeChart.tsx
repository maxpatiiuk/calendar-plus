import _default from 'chart.js/dist/plugins/plugin.tooltip';
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
        : getTimes(durations, mode),
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
      {durations === undefined || times === undefined || mode === undefined ? (
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
                  {/* FEATURE: display AM/PM when appropriate */}
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
              <CalendarRow
                calendar={calendar}
                durations={durations[calendar.id]}
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
const getTimes = (durations: EventsStore, mode: TimeChartMode): IR<DayHours> =>
  Object.fromEntries(
    Object.entries(durations).map(([id, durations]) => [
      id,
      getRowData(durations[summedDurations], mode),
    ])
  );

const getRowData = (data: IR<DayHours>, mode: TimeChartMode): DayHours =>
  summedTimes(
    Object.values(data),
    mode === 'total' ? toTotalHours : toAverageMinutes
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

function CalendarRow({
  calendar,
  times,
  durations,
}: {
  readonly calendar: CalendarListEntry;
  readonly times: DayHours;
  readonly durations: EventsStore[string];
}): JSX.Element {
  const [isCollapsed, setIsCollapsed] = React.useState(true);
  return (
    <>
      <Row
        backgroundColor={calendar.backgroundColor}
        collapseButton={
          <>
            <Button.Icon
              icon={isCollapsed ? 'chevronRight' : 'chevronDown'}
              title={
                isCollapsed ? commonText('expand') : commonText('collapse')
              }
              onClick={(): void => setIsCollapsed(!isCollapsed)}
            />
            <CalendarIndicator color={calendar.backgroundColor} />
          </>
        }
        label={calendar.summary}
        times={times}
      />
      {!isCollapsed && (
        <VirtualCalendarRows calendar={calendar} durations={durations} />
      )}
    </>
  );
}

function Row({
  label,
  backgroundColor,
  times: { hourly, total },
  collapseButton,
}: {
  readonly label: string;
  readonly backgroundColor: string;
  readonly times: DayHours;
  readonly collapseButton?: JSX.Element;
}): JSX.Element {
  const max = Math.max(...hourly, 1);
  return (
    <tr>
      <th
        className={`text-left ${
          collapseButton === undefined ? darkened : ''
        } ${stickyColumn}`}
        scope="row"
      >
        {collapseButton ?? (
          // Render invisible button to reserve the space
          <>
            <Button.Icon
              aria-hidden
              className="invisible"
              icon="chevronRight"
              title="hidden"
              onClick={console.error}
            />
            <CalendarIndicator color={backgroundColor} />
          </>
        )}
        {label}
      </th>
      {Array.from({ length: DAY / HOUR }, (_, index) => (
        <td
          className={` bg-[color:var(--color)]`}
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
      <td className={collapseButton === undefined ? extraDarkened : darkened}>
        {number(total)}
      </td>
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

function VirtualCalendarRows({
  calendar,
  durations,
}: {
  readonly calendar: CalendarListEntry;
  readonly durations: EventsStore[string];
}): JSX.Element {
  return (
    <>
      {Object.entries(durations).map(([virtualCalendar, row]) => (
        <VirtualCalendarRow
          backgroundColor={calendar.backgroundColor}
          key={virtualCalendar}
          label={virtualCalendar || calendar.summary}
          row={row}
        />
      ))}
    </>
  );
}

function VirtualCalendarRow({
  label,
  backgroundColor,
  row,
}: {
  readonly label: string;
  readonly backgroundColor: string;
  readonly row: IR<DayHours>;
}): JSX.Element {
  const [mode = 'total'] = useSimpleStorage('timeChartMode', 'total');
  const times = React.useMemo(() => getRowData(row, mode), [row, mode]);
  return (
    <Row
      backgroundColor={backgroundColor}
      collapseButton={undefined}
      label={label}
      times={times}
    />
  );
}

export const exportsForTests = {
  getTimes,
  getOpacity,
};
