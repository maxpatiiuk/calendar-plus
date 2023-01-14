import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  LinearScale,
  Tooltip,
} from 'chart.js';
import React from 'react';
import { Bar } from 'react-chartjs-2';

import { useBooleanState } from '../../hooks/useBooleanState';
import { commonText } from '../../localization/common';
import type { RA, WritableArray } from '../../utils/types';
import { formatLabel } from '../Atoms/Internationalization';
import { CalendarsContext } from '../Contexts/CalendarsContext';
import { CurrentViewContext } from '../Contexts/CurrentViewContext';
import type { EventsStore } from '../EventsStore';
import { summedDurations } from '../EventsStore';
import useReducedMotion from '../../hooks/useReducedMotion';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

export function StackedChart({
  durations,
}: {
  readonly durations: EventsStore | undefined;
}): JSX.Element | null {
  const calendars = React.useContext(CalendarsContext);
  const labels = useLabels(durations);
  const dataSets = useDataSets(durations, calendars);
  const [loaded, handleLoaded] = useBooleanState();
  const reducedMotion: boolean = useReducedMotion(false);
  React.useEffect(
    () => (dataSets.length > 0 ? handleLoaded() : undefined),
    [dataSets]
  );
  return loaded ? (
    <Bar
      data={{
        labels,
        datasets: dataSets,
      }}
      datasetIdKey="id"
      options={{
        responsive: true,
        animation: {
          duration: reducedMotion ? 0 : 1000,
        },
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
  ) : null;
}

function useLabels(durations: EventsStore | undefined): WritableArray<string> {
  const currentView = React.useContext(CurrentViewContext)!;
  return React.useMemo(
    () =>
      Object.keys(
        Object.values(durations ?? {})[0]?.[summedDurations] ?? []
      ).map((duration) => formatLabel(new Date(duration), currentView)),
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
            data: Object.values(durations[id]?.[summedDurations] ?? {}),
          })),
    [durations, calendars]
  );
}
