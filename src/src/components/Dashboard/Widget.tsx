import { EventsStore } from '../EventsStore';
import React from 'react';
import type { Widget } from './index';
import { GoalsWidget } from '../Widgets/GoalsWidget';
import { Suggestions } from '../Widgets/Suggestions';
import { QuickActions } from '../Widgets/QuickActions';
import { DataExport } from '../Widgets/DataExport';
import { StackedChart } from '../Charts/StackedChart';
import { DoughnutChart } from '../Charts/DoughnutChart';

const widgetClassName = `
  bg-gray-200 dark:bg-neutral-900 flex flex-col gap-2 rounded p-4
  col-[span_var(--col-span-xs)_/_span_var(--col-span-xs)]
  sm:col-[span_var(--col-span-sm)_/_span_var(--col-span-sm)]
  md:col-[span_var(--col-span-md)_/_span_var(--col-span-md)]
  lg:col-[span_var(--col-span-lg)_/_span_var(--col-span-lg)]
  xl:col-[span_var(--col-span-xl)_/_span_var(--col-span-xl)]
  2xl:col-[span_var(--col-span-2xl)_/_span_var(--col-span-2xl)]
  row-[span_var(--row-span-xs)_/_span_var(--row-span-xs)] 
  sm:row-[span_var(--row-span-sm)_/_span_var(--row-span-sm)]
  md:row-[span_var(--row-span-md)_/_span_var(--row-span-md)]
  lg:row-[span_var(--row-span-lg)_/_span_var(--row-span-lg)]
  xl:row-[span_var(--row-span-xl)_/_span_var(--row-span-xl)]
  2xl:row-[span_var(--row-span-2xl)_/_span_var(--row-span-2xl)]
`;

const widgets = {
  DoughnutChart,
  StackedChart,
  DataExport,
  GoalsWidget,
  QuickActions,
  Suggestions,
} as const;

export function Widget({
  widget: {
    colSpan,
    rowSpan,
    definition: { type, ...definition },
  },
  durations,
}: {
  readonly widget: Widget;
  readonly durations: EventsStore | undefined;
}): JSX.Element {
  const colSpanVariables = React.useMemo(
    () => ({
      ...Object.fromEntries(
        Object.entries(colSpan).map(([breakpoint, size]) => [
          `--col-span${breakpoint === 'xs' ? '' : `-${breakpoint}`}`,
          size,
        ])
      ),
      ...Object.fromEntries(
        Object.entries(rowSpan).map(([breakpoint, size]) => [
          `--row-span${breakpoint === 'xs' ? '' : `-${breakpoint}`}`,
          size,
        ])
      ),
    }),
    [colSpan, rowSpan]
  );

  const WidgetComponent = widgets[type];
  return (
    <section style={colSpanVariables} className={widgetClassName}>
      <WidgetComponent durations={durations} {...definition} />
    </section>
  );
}
