import React from 'react';
import { State } from 'typesafe-reducer';
import { RA } from '../../utils/types';
import { EventsStore } from '../EventsStore';
import { useBooleanState } from '../../hooks/useBooleanState';
import { commonText } from '../../localization/common';
import { defaultLayout, singleRow, widgetGridColumnSizes } from './definitions';
import { AddWidgetButton, WidgetContent } from './Widget';
import type { BreakPoint } from './useBreakpoint';
import { useBreakpoint } from './useBreakpoint';
import { removeItem, replaceItem } from '../../utils/utils';
import { Button, H2 } from '../Atoms';
import { WidgetEditorOverlay } from './WidgetEditorOverlay';
import { useStorage } from '../../hooks/useStorage';

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

const widgetClassName = `
  relative
  col-[span_var(--col-span)_/_span_var(--col-span)] 
  row-[span_var(--row-span)_/_span_var(--row-span)]
  flex flex-col gap-2 rounded bg-white
`;

export function Dashboard({
  durations,
}: {
  readonly durations: EventsStore | undefined;
}): JSX.Element {
  const [isEditing, _, __, handleToggle] = useBooleanState();

  const [layout = [], setLayout] = useStorage('layout', defaultLayout);
  const originalLayout = React.useRef<RA<WidgetDefinition>>([]);
  React.useEffect(() => {
    if (isEditing) originalLayout.current = layout;
  }, [isEditing]);

  const breakpoint = useBreakpoint();
  const className = `${widgetClassName} ${isEditing ? '' : 'overflow-y-auto'}`;

  return (
    <div className="flex flex-col gap-2 p-2">
      <div className="flex gap-2">
        <H2>{commonText('calendarPlus')}</H2>
        <span className="-ml-2 flex-1" />
        {isEditing && (
          <>
            <Button.White
              onClick={(): void => {
                setLayout(originalLayout.current);
                handleToggle();
              }}
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
            grid grid-cols-[repeat(var(--grid-cols),1fr)]
            ${isEditing ? 'gap-4 p-2' : 'gap-2'}
          `}
          style={
            {
              '--grid-cols': widgetGridColumnSizes[breakpoint],
            } as React.CSSProperties
          }
        >
          {layout.map((widget, index) => (
            <section
              key={index}
              className={className}
              style={
                {
                  '--col-span': widget.colSpan[breakpoint],
                  '--row-span': widget.rowSpan[breakpoint],
                } as React.CSSProperties
              }
            >
              {isEditing ? (
                <WidgetEditorOverlay
                  key={index}
                  widget={widget}
                  breakpoint={breakpoint}
                  onEdit={(newWidget): void =>
                    setLayout(
                      newWidget === undefined
                        ? removeItem(layout, index)
                        : replaceItem(layout, index, newWidget)
                    )
                  }
                />
              ) : (
                <WidgetContent
                  durations={durations}
                  definition={widget.definition}
                />
              )}
            </section>
          ))}
          {isEditing && (
            <section
              className={className}
              style={
                {
                  '--col-span': 1,
                  '--row-span': 1,
                } as React.CSSProperties
              }
            >
              <AddWidgetButton
                onClick={(): void =>
                  setLayout([
                    ...layout,
                    {
                      colSpan: singleRow,
                      rowSpan: singleRow,
                      definition: {
                        type: 'DoughnutChart',
                      },
                    },
                  ])
                }
              />
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
