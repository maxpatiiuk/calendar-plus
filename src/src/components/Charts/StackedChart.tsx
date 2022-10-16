import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { EventsStore } from '../EventsStore';
import { commonText } from '../../localization/common';
import { CalendarsContext } from '../Contexts/CalendarsContext';
import { RA, WritableArray } from '../../utils/types';
import { CurrentViewContext } from '../Contexts/CurrentViewContext';
import { formatLabel } from '../Atoms/Internationalization';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

export function StackedChart({
  durations,
}: {
  readonly durations: EventsStore | undefined;
}): JSX.Element {
  const calendars = React.useContext(CalendarsContext);
  const labels = useLabels(durations);
  const dataSets = useDataSets(durations, calendars);
  return (
    <Bar
      data={{
        labels,
        datasets: dataSets,
      }}
      datasetIdKey="id"
      options={{
        responsive: true,
        scales: {
          x: {
            title: {
              display: true,
              text: commonText('date'),
            },
            stacked: true,
          },
          y: {
            title: {
              display: true,
              text: commonText('duration'),
            },
            stacked: true,
          },
        },
      }}
    />
  );
}

function useLabels(durations: EventsStore | undefined): WritableArray<string> {
  const currentView = React.useContext(CurrentViewContext)!;
  return React.useMemo(
    () =>
      Object.keys(Object.values(durations ?? {})[0] ?? {}).map((duration) =>
        formatLabel(new Date(duration), currentView)
      ),
    [durations, currentView]
  );
}

function useDataSets(
  durations: EventsStore | undefined,
  calendars: React.ContextType<typeof CalendarsContext>
): WritableArray<{
  readonly id: string;
  readonly label: string;
  readonly data: RA<number>;
  readonly backgroundColor: string;
}> {
  return React.useMemo(
    () =>
      durations === undefined || calendars === undefined
        ? []
        : calendars.map(({ id, summary, backgroundColor }) => ({
            id,
            label: summary,
            backgroundColor,
            data: Object.values(durations[id]),
          })),
    [durations, calendars]
  );
}