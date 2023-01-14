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
import { formatLabel, months } from '../Atoms/Internationalization';
import { CalendarsContext } from '../Contexts/CalendarsContext';
import {
  CurrentViewContext,
  SupportedView,
} from '../Contexts/CurrentViewContext';
import type { EventsStore } from '../EventsStore';
import { summedDurations } from '../EventsStore';
import useReducedMotion from '../../hooks/useReducedMotion';
import { group } from '../../utils/utils';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

export function StackedChart({
  durations,
}: {
  readonly durations: EventsStore | undefined;
}): JSX.Element | null {
  const { view } = React.useContext(CurrentViewContext)!;
  const calendars = React.useContext(CalendarsContext);
  const labels = useLabels(durations, view);
  const dataSets = useDataSets(durations, calendars, view);
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

function useLabels(
  durations: EventsStore | undefined,
  view: SupportedView
): WritableArray<string> {
  const currentView = React.useContext(CurrentViewContext)!;
  return React.useMemo(
    () =>
      view === 'year'
        ? (months as WritableArray<string>)
        : Object.keys(
            Object.values(durations ?? {})[0]?.[summedDurations] ?? []
          ).map((duration) => formatLabel(new Date(duration), currentView)),
    [view, durations, currentView]
  );
}

function useDataSets(
  durations: EventsStore | undefined,
  calendars: React.ContextType<typeof CalendarsContext>,
  view: SupportedView
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
            data:
              view === 'year'
                ? group(
                    Object.entries(durations[id]?.[summedDurations] ?? {}).map(
                      ([date, duration]) =>
                        [new Date(date).getMonth(), duration] as const
                    )
                  ).map(([_key, values]) =>
                    values.reduce((total, value) => total + value, 0)
                  )
                : Object.values(durations[id]?.[summedDurations] ?? {}),
          })),
    [durations, calendars]
  );
}
