import React from 'react';
import { WidgetDefinition } from './index';

export function WidgetEditor({
  definition,
  onEdit: handleEdit,
}: {
  readonly definition: WidgetDefinition['definition'];
  readonly onEdit: (newWidget: WidgetDefinition['definition']) => void;
}): JSX.Element {
  return <div className="p-8"></div>;
}
