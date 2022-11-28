import { ArcElement, Chart, DoughnutController, Tooltip } from 'chart.js';
import React from 'react';
import { Doughnut } from 'react-chartjs-2';

import { useBooleanState } from '../../hooks/useBooleanState';
import { commonText } from '../../localization/common';
import type { RA, WritableArray } from '../../utils/types';
import { writable } from '../../utils/types';
import { formatDuration } from '../Atoms/Internationalization';
import { CalendarsContext } from '../Contexts/CalendarsContext';
import type { EventsStore } from '../EventsStore';
import { summedDurations } from '../EventsStore';
import useReducedMotion from '../../hooks/useRedecedMotion';

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
  const reducedMotion : boolean = useReducedMotion(false);
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

  return loaded ? (
    <Doughnut
      data={{
        labels: [...outerLabels, ...innerLabels] as WritableArray<string>,
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
        animation: {
          duration: reducedMotion ? 0 : 1000,
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: ({ datasetIndex, dataIndex, parsed }) =>
                `${layers[datasetIndex].labels[dataIndex]}: ${formatDuration(
                  parsed
                )}`,
            },
          },
        },
      }}
      ref={(chart) => setChart(chart ?? undefined)}
    />
  ) : null;
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
    const partBackgroundColors: WritableArray<string> = [];
    const labels: WritableArray<string> = [];
    const categoryData =
      durations === undefined
        ? []
        : calendars?.flatMap(({ id, summary, backgroundColor }) =>
            Object.entries(durations[id] ?? {}).map(
              ([label, durations], _, { length }) => {
                partBackgroundColors.push(backgroundColor);
                labels.push(
                  label || (length === 1 ? summary : commonText('other'))
                );
                return Object.values(durations).reduce(
                  (total, durations) => total + durations,
                  0
                );
              }
            )
          ) ?? [];
    const calendarData =
      durations === undefined
        ? []
        : calendars?.map(({ id }) =>
            Object.values(durations[id]?.[summedDurations] ?? {}).reduce(
              (total, durations) => total + durations,
              0
            )
          ) ?? [];
    return [
      {
        data: categoryData,
        backgroundColor: partBackgroundColors,
        labels,
      },
      {
        data: calendarData,
        backgroundColor:
          calendars?.map(({ backgroundColor }) => backgroundColor) ?? [],
        labels: calendars?.map(({ summary }) => summary) ?? [],
      },
    ];
  }, [durations, calendars]);
}
