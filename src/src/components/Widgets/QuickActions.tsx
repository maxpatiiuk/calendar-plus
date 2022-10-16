import React from 'react';
import { commonText } from '../../localization/common';
import { WidgetContainer } from './WidgetContainer';

export function QuickActions(): JSX.Element {
  return (
    <WidgetContainer header={commonText('quickActions')}>
      {commonText('noQuickActions')}
    </WidgetContainer>
  );
}
