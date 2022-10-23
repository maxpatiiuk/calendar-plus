import React, { CSSProperties } from 'react';
import { State } from 'typesafe-reducer';
import { RA } from '../../utils/types';
import { EventsStore } from '../EventsStore';
import { useBooleanState } from '../../hooks/useBooleanState';
import { commonText } from '../../localization/common';
import { useLayout } from './useLayout';
import { defaultLayout, widgetGridColumnSizes } from './definitions';
import { Widget } from './Widget';
import type { BreakPoint } from './useBreakpoint';
import { useBreakpoint } from './useBreakpoint';
import { removeItem, replaceItem } from '../../utils/utils';
import { Button } from '../Atoms';

export type WidgetGridColumnSizes = Readonly<Record<BreakPoint, number>>;

export type WidgetDefinition = {
  readonly colSpan: WidgetGridColumnSizes;
  readonly rowSpan: WidgetGridColumnSizes;
  readonly definition:
    | State<'DoughnutChart'>
    | State<'StackedChart'>
    | State<'DataExport'>
    | State<'GoalsWidget'>
    | State<'QuickActions'>
    | State<'Suggestions'>;
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
  const [isEditing, _, __, handleToggle] = useBooleanState();

  const [layout, setLayout] = useLayout();
  const originalLayout = React.useRef<RA<WidgetDefinition>>([]);
  React.useEffect(() => {
    if (isEditing) originalLayout.current = layout;
  }, [isEditing]);

  const breakpoint = useBreakpoint();

  return (
    <div className="flex flex-col gap-2 p-2">
      <div className="flex gap-2">
        <h2>{commonText('calendarPlus')}</h2>
        <span className="-ml-2 flex-1" />
        {isEditing && (
          <>
            <Button.White
              onClick={(): void => setLayout(originalLayout.current)}
            >
              {commonText('cancel')}
            </Button.White>
            <Button.White onClick={(): void => setLayout(defaultLayout)}>
              {commonText('resetToDefault')}
            </Button.White>
          </>
        )}
        <Button.White onClick={handleToggle}>
          {isEditing ? commonText('save') : commonText('edit')}
        </Button.White>
      </div>
      <div className="overflow-y-auto overflow-x-hidden">
        <div
          className={`
          grid grid-cols-[repeat(var(--grid-cols-xs),1fr)]
          ${isEditing ? 'gap-4 p-2' : 'gap-2'}
          sm:grid-cols-[repeat(var(--grid-cols-sm),1fr)]
          md:grid-cols-[repeat(var(--grid-cols-md),1fr)]
          lg:grid-cols-[repeat(var(--grid-cols-lg),1fr)]
          xl:grid-cols-[repeat(var(--grid-cols-xl),1fr)]
          2xl:grid-cols-[repeat(var(--grid-cols-2xl),1fr)]
        `}
          style={gridSizeVariables as CSSProperties}
        >
          {layout.map((widget, index) => (
            <Widget
              key={index}
              widget={widget}
              onEdit={
                isEditing
                  ? (newWidget): void =>
                      setLayout(
                        newWidget === undefined
                          ? removeItem(layout, index)
                          : replaceItem(layout, index, newWidget)
                      )
                  : undefined
              }
              breakpoint={breakpoint}
              durations={durations}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
