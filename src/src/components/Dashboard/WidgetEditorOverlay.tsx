import { BreakPoint } from './useBreakpoint';
import { WidgetDefinition } from './index';
import { widgetGridColumnSizes } from './definitions';
import { commonText } from '../../localization/common';
import { icons } from '../Atoms/Icon';
import React from 'react';
import { WidgetEditor } from './WidgetEditor';

const buttonCommon = `
  rounded-full border-none flex p-0.5 active:brightness-80 disabled:bg-gray-400
  text-white disabled:text-black disabled:border disabled:border-neutral-700
`;
const resizeButton = `
  ${buttonCommon} absolute pointer-events-auto bg-blue-600 hover:bg-blue-700
`;

export function WidgetEditorOverlay({
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
          {icons.minus}
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
          {icons.plus}
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
          {icons.minus}
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
          {icons.plus}
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
          {icons.trash}
        </button>
      </div>
      <WidgetEditor
        definition={widget.definition}
        onEdit={(definition): void =>
          handleEdit({
            ...widget,
            definition,
          })
        }
      />
    </>
  );
}
