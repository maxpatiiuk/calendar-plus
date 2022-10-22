import React, { CSSProperties } from 'react';
import { State } from 'typesafe-reducer';
import { RA } from '../../utils/types';
import { EventsStore } from '../EventsStore';
import { useBooleanState } from '../../hooks/useBooleanState';
import { commonText } from '../../localization/common';
import { useLayout } from './useLayout';
import { defaultLayout, widgetGridColumnSizes } from './definitions';
import { Widget } from './Widget';

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
  const originalLayout = React.useRef<RA<Widget>>([]);
  React.useEffect(() => {
    if (isEditing) originalLayout.current = layout;
  }, [isEditing]);

  return (
    <div>
      {isEditing && (
        <>
          <button
            type="button"
            onClick={(): void => setLayout(originalLayout.current)}
          >
            {commonText('cancel')}
          </button>
          <button type="button" onClick={(): void => setLayout(defaultLayout)}>
            {commonText('resetToDefault')}
          </button>
        </>
      )}
      <button type="button" onClick={handleToggle}>
        {isEditing ? commonText('save') : commonText('edit')}
      </button>
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
    </div>
  );
}
