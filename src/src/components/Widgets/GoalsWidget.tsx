import React from 'react';
import { commonText } from '../../localization/common';
import { WidgetContainer } from './WidgetContainer';

export function GoalsWidget({
  label,
}: {
  readonly label: string;
}): JSX.Element {
  return (
    <WidgetContainer header={label}>{commonText('noGoals')}</WidgetContainer>
  );
}
