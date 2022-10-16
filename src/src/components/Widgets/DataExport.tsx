import React from 'react';
import { commonText } from '../../localization/common';
import { WidgetContainer } from './WidgetContainer';

export function DataExport(): JSX.Element {
  return (
    <WidgetContainer header={commonText('dataExport')}>{''}</WidgetContainer>
  );
}
