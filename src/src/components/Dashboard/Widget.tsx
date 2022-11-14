import { EventsStore, RawEventsStore } from '../EventsStore';
import React from 'react';
import type { WidgetDefinition } from './index';
import { GoalsWidget } from '../Goals/Widget';
import { Suggestions } from '../Widgets/Suggestions';
import { QuickActions } from '../Widgets/QuickActions';
import { DataExport } from '../Widgets/DataExport';
import { StackedChart } from '../Charts/StackedChart';
import { DoughnutChart } from '../Charts/DoughnutChart';
import { commonText } from '../../localization/common';
import { RR } from '../../utils/types';
import { icon } from '../Atoms/Icon';
import { Button } from '../Atoms';
import { VirtualCalendars } from '../Widgets/VirtualCalendars';

const widgets = {
  DoughnutChart,
  StackedChart,
  DataExport,
  GoalsWidget,
  QuickActions,
  Suggestions,
  VirtualCalendars,
} as const;

export const widgetLabels: RR<keyof typeof widgets, string> = {
  DoughnutChart: commonText('doughnutChart'),
  StackedChart: commonText('stackedChart'),
  DataExport: commonText('dataExport'),
  GoalsWidget: commonText('goals'),
  QuickActions: commonText('quickActions'),
  Suggestions: commonText('suggestions'),
  VirtualCalendars: commonText('virtualCalendars'),
};

export function WidgetContent({
  definition: { type, ...definition },
  eventsStore,
  durations,
}: {
  readonly definition: WidgetDefinition['definition'];
  readonly eventsStore: React.MutableRefObject<RawEventsStore> | undefined;
  readonly durations: EventsStore | undefined;
}): JSX.Element {
  const WidgetComponent = widgets[type];
  return (
    <div className="h-full p-4">
      <WidgetComponent
        durations={durations}
        eventsStore={eventsStore}
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
      onClick={handleClick}
      className="h-full justify-center"
      title={commonText('addWidget')}
      aria-label={commonText('addWidget')}
    >
      {icon.plus}
    </Button.Blue>
  );
}
