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
import { icon } from '../Atoms/Icon';
import { BreakPoint } from './useBreakpoint';
import { widgetGridColumnSizes } from './definitions';

const widgetClassName = `
  bg-gray-200 dark:bg-neutral-900 flex flex-col gap-2 rounded relative
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

const buttonCommon = `
  rounded-full border-none flex p-0.5 active:brightness-80 disabled:bg-gray-400
  text-white disabled:text-black disabled:border disabled:border-neutral-700
`;
const resizeButton = `
  ${buttonCommon} absolute pointer-events-auto bg-blue-600 hover:bg-blue-700
`;

export function Widget({
  durations,
  breakpoint,
  widget,
  onEdit: handleEdit,
}: {
  readonly durations: EventsStore | undefined;
  readonly breakpoint: BreakPoint;
  readonly widget: WidgetDefinition;
  readonly onEdit:
    | ((newWidget: WidgetDefinition | undefined) => void)
    | undefined;
}): JSX.Element {
  const {
    colSpan,
    rowSpan,
    definition: { type, ...definition },
  } = widget;
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
      {typeof handleEdit === 'function' && (
        <WidgetEditor
          breakpoint={breakpoint}
          widget={widget}
          onEdit={handleEdit}
        />
      )}
      <div className="p-4">
        <WidgetComponent durations={durations} {...definition} />
      </div>
    </section>
  );
}

function WidgetEditor({
  breakpoint,
  widget,
  onEdit: handleEdit,
}: {
  readonly breakpoint: BreakPoint;
  readonly widget: WidgetDefinition;
  readonly onEdit: (newWidget: WidgetDefinition | undefined) => void;
}): JSX.Element {
  const colSpan = widget.colSpan[breakpoint];
  const rowSpan = widget.rowSpan[breakpoint];
  const maxCols = widgetGridColumnSizes[breakpoint];
  return (
    <>
      <div className="pointer-events-none absolute flex h-full w-full items-center justify-between">
        <button
          type="button"
          onClick={() =>
            handleEdit({
              ...widget,
              colSpan: {
                ...widget.colSpan,
                [breakpoint]: colSpan - 1,
              },
            })
          }
          disabled={colSpan === 1}
          title={commonText('decreaseWidth')}
          aria-label={commonText('decreaseWidth')}
          className={`${resizeButton} -left-1`}
        >
          {icon.minus}
        </button>
        <button
          type="button"
          onClick={() =>
            handleEdit({
              ...widget,
              colSpan: {
                ...widget.colSpan,
                [breakpoint]: Math.min(colSpan + 1, maxCols),
              },
            })
          }
          disabled={colSpan === maxCols}
          title={commonText('increaseWidth')}
          aria-label={commonText('increaseWidth')}
          className={`${resizeButton} -right-1`}
        >
          {icon.plus}
        </button>
      </div>
      <div className="pointer-events-none absolute flex h-full w-full flex-col items-center justify-between">
        <button
          type="button"
          onClick={() =>
            handleEdit({
              ...widget,
              rowSpan: {
                ...widget.rowSpan,
                [breakpoint]: rowSpan - 1,
              },
            })
          }
          disabled={rowSpan === 1}
          title={commonText('decreaseHeight')}
          aria-label={commonText('decreaseHeight')}
          className={`${resizeButton} -top-1`}
        >
          {icon.minus}
        </button>
        <button
          type="button"
          onClick={() =>
            handleEdit({
              ...widget,
              rowSpan: {
                ...widget.rowSpan,
                [breakpoint]: rowSpan + 1,
              },
            })
          }
          title={commonText('increaseHeight')}
          aria-label={commonText('increaseHeight')}
          className={`${resizeButton} -bottom-1`}
        >
          {icon.plus}
        </button>
      </div>
      <div className="absolute -top-1 -right-1">
        <button
          type="button"
          onClick={() => handleEdit(undefined)}
          title={commonText('remove')}
          aria-label={commonText('remove')}
          className={`${buttonCommon} bg-red-600 hover:bg-red-700`}
        >
          {icon.trash}
        </button>
      </div>
    </>
  );
}
