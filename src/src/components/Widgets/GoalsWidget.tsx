import React from 'react';
import { commonText } from '../../localization/common';
import { WidgetContainer } from './WidgetContainer';

export function GoalsWidget(): JSX.Element {
  return (
    <WidgetContainer header={commonText('goals')}>
      {commonText('noGoals')}
    </WidgetContainer>
  );
}
