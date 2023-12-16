import { ArcElement, Chart, DoughnutController, Tooltip } from 'chart.js';
import React from 'react';
import { Doughnut } from 'react-chartjs-2';

import { useBooleanState } from '../../hooks/useBooleanState';
import { useTransitionDuration } from '../../hooks/useTransitionDuration';
import { commonText } from '../../localization/common';
import type { RA, WritableArray } from '../../utils/types';
import { writable } from '../../utils/types';
import { formatDuration } from '../Atoms/Internationalization';
import { CalendarsContext } from '../Contexts/CalendarsContext';
import type { EventsStore } from '../EventsStore';
import { summedDurations } from '../EventsStore';
import { WidgetContainer } from '../Widgets/WidgetContainer';

Chart.register(DoughnutController, ArcElement, Tooltip);

export function DoughnutChart({
  durations,
}: {
  readonly durations: EventsStore | undefined;
}): JSX.Element | null {
  const calendars = React.useContext(CalendarsContext);

  /**
   * In order for ChartJS to smoothly animate from one state to another rather
   * than re-render from scratch, need to mutate the data object rather than
   * give it a new one
   */
  const layers = useDataSets(durations, calendars);
  const [
    { data: outerData, labels: outerLabels, ...outerDataSet },
    { data: innerData, labels: innerLabels, ...innerDataSet },
  ] = layers;
  const [chart, setChart] = React.useState<
    Chart<'doughnut', RA<number>, string> | undefined
  >(undefined);
  const innerDataRef = React.useRef(innerData);
  const outerDataRef = React.useRef(outerData);
  const [loaded, handleLoaded] = useBooleanState();

  React.useEffect(() => {
    if (outerData.length > 0) handleLoaded();
    if (chart === undefined || outerDataRef.current === outerData) return;
    Array.from(
      {
        length: Math.max(chart.data.datasets[0].data.length, outerData.length),
      },
      (_, index) => {
        writable(chart.data.datasets[0].data)[index] = outerData[index];
      }
    );
    Array.from(
      {
        length: Math.max(chart.data.datasets[1].data.length, innerData.length),
      },
      (_, index) => {
        writable(chart.data.datasets[1].data)[index] = innerData[index];
      }
    );
    chart.update();
  }, [innerData, outerData, chart, handleLoaded]);

  const transitionDuration = useTransitionDuration();

  function getJsonExport() {
    const { data } = getCategoryData(durations, calendars);
    return getCalendarData(durations, calendars).map((minutes, index) => ({
      calendar: calendars?.[index]?.summary ?? index,
      minutes,
      virtualCalendars: data[index].map(({ minutes, label }) => ({
        virtualCalendar: label,
        minutes,
      })),
    }));
  }

  const getTsvExport = () =>
    getJsonExport()
      .flatMap(({ calendar, minutes, virtualCalendars }, index) => [
        {
          calendar,
          virtualCalendar: commonText('total'),
          minutes,
        },
        ...virtualCalendars.map(({ virtualCalendar, minutes }) => ({
          calendar,
          virtualCalendar:
            virtualCalendar ||
            (virtualCalendars.length === 1
              ? calendars?.[index].summary ?? index.toString()
              : commonText('other')),
          minutes,
        })),
      ])
      .map(({ calendar, virtualCalendar, minutes }) => ({
        [commonText('calendar')]: calendar,
        [commonText('virtualCalendar')]: virtualCalendar,
        [commonText('minutes')]: minutes,
      }));

  return (
    <WidgetContainer
      header={commonText('doughnutChart')}
      getJsonExport={getJsonExport}
      getTsvExport={getTsvExport}
    >
      {loaded ? (
        <Doughnut
          data={{
            datasets: [
              {
                ...outerDataSet,
                data: outerDataRef.current,
              },
              { ...innerDataSet, data: innerDataRef.current },
            ],
          }}
          options={{
            responsive: true,
            animation: {
              duration: transitionDuration,
            },
            plugins: {
              tooltip: {
                callbacks: {
                  label: ({ datasetIndex, dataIndex, parsed }) =>
                    `${
                      layers[datasetIndex].labels[dataIndex]
                    }: ${formatDuration(parsed)}`,
                },
              },
            },
          }}
          ref={(chart:Chart<'doughnut', RA<number>, string> | undefined | null) => setChart(chart ?? undefined)}
        />
      ) : (
        commonText('loading')
      )}
    </WidgetContainer>
  );
}

type Layer = {
  readonly data: RA<number>;
  readonly backgroundColor: RA<string>;
  readonly labels: RA<string>;
};

function useDataSets(
  durations: EventsStore | undefined,
  calendars: React.ContextType<typeof CalendarsContext>
): readonly [Layer, Layer] {
  return React.useMemo(() => {
    const { data, ...rest } = getCategoryData(durations, calendars);
    const categoryData = {
      data: data.flat().map(({ minutes }) => minutes),
      labels: data.flatMap((data, index) =>
        data.map(
          ({ label }) =>
            label ||
            (data.length === 1
              ? calendars?.[index].summary ?? index.toString()
              : commonText('other'))
        )
      ),
      ...rest,
    };
    const calendarData = getCalendarData(durations, calendars);
    return [
      categoryData,
      {
        data: calendarData,
        backgroundColor:
          calendars?.map(({ backgroundColor }) => backgroundColor) ?? [],
        labels: calendars?.map(({ summary }) => summary) ?? [],
      },
    ];
  }, [durations, calendars]);
}

function getCategoryData(
  durations: EventsStore | undefined,
  calendars: React.ContextType<typeof CalendarsContext>
): {
  readonly data: RA<RA<{ readonly label: string; readonly minutes: number }>>;
  readonly backgroundColor: RA<string>;
} {
  const partBackgroundColors: WritableArray<string> = [];
  const categoryData =
    durations === undefined
      ? []
      : calendars?.map(({ id, backgroundColor }) =>
          Object.entries(durations[id] ?? {}).map(([label, durations]) => {
            partBackgroundColors.push(backgroundColor);
            return {
              label,
              minutes: Object.values(durations).reduce(
                (total, durations) => total + durations.total,
                0
              ),
            };
          })
        ) ?? [];
  return {
    data: categoryData,
    backgroundColor: partBackgroundColors,
  };
}

const getCalendarData = (
  durations: EventsStore | undefined,
  calendars: React.ContextType<typeof CalendarsContext>
) =>
  durations === undefined
    ? []
    : calendars?.map(({ id }) =>
        Object.values(durations[id]?.[summedDurations] ?? {}).reduce(
          (total, durations) => total + durations.total,
          0
        )
      ) ?? [];
