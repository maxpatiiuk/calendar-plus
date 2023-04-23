import React from 'react';

import { commonText } from '../../localization/common';
import { Label, Select } from '../Atoms';
import type { WidgetDefinition } from './index';
import { widgetLabels } from './Widget';

/**
 * The contents of a widget when in editing mode. This can be extended in the
 * future to provide widget-specific configuration options (i.e, changing
 * chart configuration or other options)
 */
export function WidgetEditor({
  definition,
  onEdit: handleEdit,
}: {
  readonly definition: WidgetDefinition['definition'];
  readonly onEdit: (newWidget: WidgetDefinition['definition']) => void;
}): JSX.Element {
  return (
    <div className="p-8">
      <Label.Block>
        {commonText('type')}
        <Select
          required
          value={definition.type}
          onValueChange={(newType): void =>
            handleEdit({
              type: newType as WidgetDefinition['definition']['type'],
            })
          }
        >
          {Object.entries(widgetLabels).map(([type, label]) => (
            <option key={type} value={type}>
              {label}
            </option>
          ))}
        </Select>
      </Label.Block>
    </div>
  );
}
