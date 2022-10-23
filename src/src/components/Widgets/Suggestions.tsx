import React from 'react';
import { commonText } from '../../localization/common';
import { WidgetContainer } from './WidgetContainer';

export function Suggestions({
  label,
}: {
  readonly label: string;
}): JSX.Element {
  return (
    <WidgetContainer header={label}>
      {commonText('noSuggestions')}
    </WidgetContainer>
  );
}
