import { commonText } from '../../localization/common';
import { WidgetContainer } from './WidgetContainer';
import React from 'react';

export function Unknown({ label }: { readonly label: string }): JSX.Element {
  return (
    <WidgetContainer header={label}>
      {commonText('unknownWidgetDescription')}
    </WidgetContainer>
  );
}
