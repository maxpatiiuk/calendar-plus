import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { EventsStore } from '../EventsStore';
import { CalendarsContext } from '../Contexts/CalendarsContext';
import { RA, WritableArray } from '../../utils/types';
import {
  Chart,
  DoughnutController,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

Chart.register(DoughnutController, ArcElement, Tooltip, Legend);

export function DoughnutChart({
  durations,
}: {
  readonly durations: EventsStore | undefined;
}): JSX.Element {
  const calendars = React.useContext(CalendarsContext);
  const labels = useLabels(calendars);
  const dataSets = useDataSets(durations, calendars);
  return (
    <Doughnut
      data={{
        labels,
        datasets: [dataSets],
      }}
      options={{
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
        },
      }}
    />
  );
}

function useLabels(
  calendars: React.ContextType<typeof CalendarsContext> | undefined
): WritableArray<string> {
  return React.useMemo(
    () =>
      calendars === undefined ? [] : calendars.map(({ summary }) => summary),
    [calendars]
  );
}

function useDataSets(
  durations: EventsStore | undefined,
  calendars: React.ContextType<typeof CalendarsContext>
): { readonly data: RA<number>; readonly backgroundColor: RA<string> } {
  return React.useMemo(
    () => ({
      data:
        durations === undefined
          ? []
          : calendars?.map(({ id }) =>
              Object.values(durations[id]).reduce(
                (total, durations) => total + durations,
                0
              )
            ) ?? [],
      backgroundColor: calendars?.map(({ borderColor }) => borderColor) ?? [],
    }),
    [durations, calendars]
  );
}
