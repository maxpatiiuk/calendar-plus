import React from 'react';
import { WidgetDefinition } from './index';
import { widgetLabels } from './Widget';
import { commonText } from '../../localization/common';
import { Label, Select } from '../Atoms';

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
          value={definition.type}
          onValueChange={(newType): void =>
            handleEdit({
              type: newType as WidgetDefinition['definition']['type'],
            })
          }
          required
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
