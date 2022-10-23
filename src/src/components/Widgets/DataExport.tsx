import React from 'react';
import { WidgetContainer } from './WidgetContainer';

export function DataExport({ label }: { readonly label: string }): JSX.Element {
  return <WidgetContainer header={label}>{''}</WidgetContainer>;
}
