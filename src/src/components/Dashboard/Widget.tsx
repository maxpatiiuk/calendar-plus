import { EventsStore } from '../EventsStore';
import React from 'react';
import type { WidgetDefinition } from './index';
import { GoalsWidget } from '../Widgets/GoalsWidget';
import { Suggestions } from '../Widgets/Suggestions';
import { QuickActions } from '../Widgets/QuickActions';
import { DataExport } from '../Widgets/DataExport';
import { StackedChart } from '../Charts/StackedChart';
import { DoughnutChart } from '../Charts/DoughnutChart';
import { commonText } from '../../localization/common';
import { RR } from '../../utils/types';
import { icon } from '../Atoms/Icon';
import { Button } from '../Atoms';

const widgets = {
  DoughnutChart,
  StackedChart,
  DataExport,
  GoalsWidget,
  QuickActions,
  Suggestions,
} as const;

export const widgetLabels: RR<keyof typeof widgets, string> = {
  DoughnutChart: commonText('doughnutChart'),
  StackedChart: commonText('stackedChart'),
  DataExport: commonText('dataExport'),
  GoalsWidget: commonText('goals'),
  QuickActions: commonText('quickActions'),
  Suggestions: commonText('suggestions'),
};

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
      onClick={handleClick}
      className="justify-center"
      title={commonText('add')}
      aria-label={commonText('add')}
    >
      {icon.plus}
    </Button.Blue>
  );
}
