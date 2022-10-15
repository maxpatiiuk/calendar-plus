import React, { CSSProperties } from 'react';
import { DoughnutChart } from '../Charts/DoughnutChart';
import { StackedChart } from '../Charts/StackedChart';
import { GoalsWidget } from '../Widgets/GoalsWidget';
import { State } from 'typesafe-reducer';
import { RA } from '../../utils/types';
import { EventsStore } from '../EventsStore';

const widgets = {
  DoughnutChart,
  StackedChart,
  GoalsWidget,
} as const;

const breakpointsTailwind = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

type BreakPoint = keyof typeof breakpointsTailwind;

export type WidgetGridColumnSizes = Readonly<Record<BreakPoint, number>>;

export type Widget = {
  readonly colSpan: WidgetGridColumnSizes;
  readonly rowSpan: WidgetGridColumnSizes;
  readonly definition:
    | State<'DoughnutChart'>
    | State<'StackedChart'>
    | State<'GoalsWidget'>;
};

const singleRow = {
  xs: 1,
  sm: 1,
  md: 1,
  lg: 1,
  xl: 1,
  '2xl': 1,
} as const;

const defaultLayout: RA<Widget> = [
  {
    colSpan: {
      xs: 12,
      sm: 12,
      md: 3,
      lg: 2,
      xl: 2,
      '2xl': 2,
    },
    rowSpan: singleRow,
    definition: { type: 'GoalsWidget' },
  },
  {
    colSpan: {
      xs: 12,
      sm: 12,
      md: 6,
      lg: 3,
      xl: 3,
      '2xl': 3,
    },
    rowSpan: singleRow,
    definition: { type: 'StackedChart' },
  },
  {
    colSpan: {
      xs: 12,
      sm: 12,
      md: 4,
      lg: 3,
      xl: 3,
      '2xl': 3,
    },
    rowSpan: {
      xs: 1,
      sm: 1,
      md: 4,
      lg: 3,
      xl: 3,
      '2xl': 3,
    },
    definition: { type: 'DoughnutChart' },
  },
];

const widgetGridColumnSizes: WidgetGridColumnSizes = {
  xs: 1,
  sm: 1,
  md: 3,
  lg: 6,
  xl: 6,
  '2xl': 6,
};

const gridSizeVariables = Object.fromEntries(
  Object.entries(widgetGridColumnSizes).map(([breakpoint, size]) => [
    `--grid-cols-${breakpoint}`,
    size,
  ])
);

export function Dashboard({
  durations,
}: {
  readonly durations: EventsStore | undefined;
}): JSX.Element {
  return (
    <div className="overflow-y-auto overflow-x-hidden">
      <div
        className={`
          grid grid-cols-[repeat(var(--grid-cols-xs),1fr)] gap-2
          p-2
          sm:grid-cols-[repeat(var(--grid-cols-sm),1fr)]
          md:grid-cols-[repeat(var(--grid-cols-md),1fr)]
          lg:grid-cols-[repeat(var(--grid-cols-lg),1fr)]
          xl:grid-cols-[repeat(var(--grid-cols-xl),1fr)]
          2xl:grid-cols-[repeat(var(--grid-cols-2xl),1fr)]
        `}
        style={gridSizeVariables as CSSProperties}
      >
        {defaultLayout.map((widget, index) => (
          <Widget widget={widget} key={index} durations={durations} />
        ))}
      </div>
    </div>
  );
}

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

function Widget({
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
