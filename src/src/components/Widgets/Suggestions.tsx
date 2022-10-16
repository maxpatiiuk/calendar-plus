import React from 'react';
import { commonText } from '../../localization/common';
import { WidgetContainer } from './WidgetContainer';

export function Suggestions(): JSX.Element {
  return (
    <WidgetContainer header={commonText('suggestions')}>
      {commonText('noSuggestions')}
    </WidgetContainer>
  );
}
