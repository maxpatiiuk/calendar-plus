import { EventsStore } from '../EventsStore';
import React from 'react';
import type { WidgetDefinition } from './index';
import { GoalsWidget } from '../Widgets/GoalsWidget';
import { Suggestions } from '../Widgets/Suggestions';
import { QuickActions } from '../Widgets/QuickActions';
import { DataExport } from '../Widgets/DataExport';
import { StackedChart } from '../Charts/StackedChart';
import { DoughnutChart } from '../Charts/DoughnutChart';

const widgets = {
  DoughnutChart,
  StackedChart,
  DataExport,
  GoalsWidget,
  QuickActions,
  Suggestions,
} as const;

export function WidgetContent({
  definition: { type, ...definition },
  durations,
}: {
  readonly definition: WidgetDefinition['definition'];
  readonly durations: EventsStore | undefined;
}): JSX.Element {
  const WidgetComponent = widgets[type];
  return (
    <div className="p-4">
      <WidgetComponent durations={durations} {...definition} />
    </div>
  );
}
