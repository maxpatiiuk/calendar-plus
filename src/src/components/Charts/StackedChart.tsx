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
import { useTransitionDuration } from '../../hooks/useTransitionDuration';
import { commonText } from '../../localization/common';
import type { RA, WritableArray } from '../../utils/types';
import { group } from '../../utils/utils';
import {
  formatDateLabel,
  formatDuration,
  months,
} from '../Atoms/Internationalization';
import { CalendarsContext } from '../Contexts/CalendarsContext';
import type { SupportedView } from '../Contexts/CurrentViewContext';
import { CurrentViewContext } from '../Contexts/CurrentViewContext';
import type { EventsStore } from '../EventsStore';
import { summedDurations } from '../EventsStore';
import { WidgetContainer } from '../Widgets/WidgetContainer';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

export function StackedChart({
  durations,
}: {
  readonly durations: EventsStore | undefined;
}): JSX.Element | null {
  const { view } = React.useContext(CurrentViewContext)!;
  const calendars = React.useContext(CalendarsContext);
  const labels = React.useMemo(
    () => getLabels(durations, view),
    [durations, view],
  );
  const dataSets = React.useMemo(
    () => getDataSets(durations, calendars, view),
    [durations, calendars, view],
  );
  const [loaded, handleLoaded] = useBooleanState();
  const isEmpty = dataSets.length === 0;
  const transitionDuration = useTransitionDuration();
  React.useEffect(
    () => (dataSets.length > 0 ? handleLoaded() : undefined),
    [dataSets, handleLoaded],
  );

  const getJsonExport = () =>
    dataSets.map(({ label, data }) => ({
      calendar: label,
      virtualCalendars: data.map((value, index) => ({
        date: labels[index],
        duration: value,
      })),
    }));

  const getTsvExport = () =>
    getJsonExport().flatMap(({ calendar, virtualCalendars }) =>
      virtualCalendars.map(({ date, duration }) => ({
        [commonText('calendar')]: calendar,
        [commonText('date')]: date,
        [commonText('duration')]: duration,
      })),
    );

  return (
    <WidgetContainer
      getJsonExport={isEmpty ? undefined : getJsonExport}
      getTsvExport={isEmpty ? undefined : getTsvExport}
      header={commonText('stackedChart')}
      className="aspect-[2/1]"
    >
      {loaded ? (
        <Bar
          data={{
            labels,
            datasets: dataSets,
          }}
          datasetIdKey="id"
          options={{
            plugins: {
              tooltip: {
                callbacks: {
                  label: ({ dataset, parsed }) =>
                    `${dataset.label!}: ${formatDuration(parsed.y)}`,
                },
              },
            },
            responsive: true,
            animation: {
              duration: transitionDuration,
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
      ) : (
        commonText('loading')
      )}
    </WidgetContainer>
  );
}

const getLabels = (durations: EventsStore | undefined, view: SupportedView) =>
  view === 'year'
    ? (months as WritableArray<string>)
    : Object.keys(
        Object.values(durations ?? {})[0]?.[summedDurations] ?? [],
      ).map((duration) => formatDateLabel(new Date(duration), view));

const getDataSets = (
  durations: EventsStore | undefined,
  calendars: React.ContextType<typeof CalendarsContext>,
  view: SupportedView,
): WritableArray<{
  readonly id: string;
  readonly label: string;
  readonly data: RA<number>;
  readonly backgroundColor: string;
}> =>
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
                    [new Date(date).getMonth(), duration.total] as const,
                ),
              ).map(([_key, values]) =>
                values.reduce((total, value) => total + value, 0),
              )
            : Object.values(durations[id]?.[summedDurations] ?? {}).map(
                ({ total }) => total,
              ),
      }));
