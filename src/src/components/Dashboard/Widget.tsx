import React from 'react';

import { commonText } from '../../localization/common';
import type { RR } from '../../utils/types';
import { ensure } from '../../utils/types';
import { Button } from '../Atoms';
import { icons } from '../Atoms/Icon';
import { DoughnutChart } from '../Charts/DoughnutChart';
import { StackedChart } from '../Charts/StackedChart';
import { TimeChart } from '../Charts/TimeChart';
import type { EventsStore } from '../EventsStore';
import { GoalsWidget } from '../Goals/Widget';
import { GhostedEvents } from '../Widgets/GhostedEvents';
import { Synonyms } from '../Widgets/Synonyms';
import { Unknown } from '../Widgets/Unknown';
import { VirtualCalendars } from '../Widgets/VirtualCalendars';
import type { WidgetDefinition } from './index';

/**
 * Holds definitions of available widgets for the dashboard
 */
const widgets = ensure<
  RR<
    WidgetDefinition['definition']['type'] | 'Unknown',
    (props: {
      readonly label: string;
      readonly definition: WidgetDefinition['definition'];
      readonly durations: EventsStore | undefined;
    }) => JSX.Element | null
  >
>()({
  DoughnutChart,
  StackedChart,
  GoalsWidget,
  VirtualCalendars,
  Synonyms,
  GhostedEvents,
  Unknown,
  TimeChart,
} as const);

export const widgetLabels: RR<keyof typeof widgets, string> = {
  DoughnutChart: commonText('doughnutChart'),
  StackedChart: commonText('stackedChart'),
  GoalsWidget: commonText('goals'),
  VirtualCalendars: commonText('virtualCalendars'),
  Synonyms: commonText('shortNames'),
  Unknown: commonText('unknownWidget'),
  TimeChart: commonText('timeChart'),
  GhostedEvents: commonText('ghostedEvents'),
};

export function WidgetContent({
  definition: { type, ...definition },
  durations,
}: {
  readonly definition: WidgetDefinition['definition'];
  readonly durations: EventsStore | undefined;
}): JSX.Element {
  const WidgetComponent = widgets[type] ?? widgets.Unknown;
  return (
    <div className="h-full p-4">
      <WidgetComponent
        durations={durations}
        label={widgetLabels[type]}
        {...definition}
      />
    </div>
  );
}

export function AddWidgetButton({
  onClick: handleClick,
}: {
  readonly onClick: () => void;
}): JSX.Element {
  return (
    <Button.Blue
      aria-label={commonText('addWidget')}
      className="h-full justify-center"
      title={commonText('addWidget')}
      onClick={handleClick}
    >
      {icons.plus}
    </Button.Blue>
  );
}
