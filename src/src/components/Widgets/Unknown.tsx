import React from 'react';

import { commonText } from '../../localization/common';
import { WidgetContainer } from './WidgetContainer';

export function Unknown({ label }: { readonly label: string }): JSX.Element {
  return (
    <WidgetContainer
      getJsonExport={undefined}
      getTsvExport={undefined}
      header={label}
    >
      {commonText('unknownWidgetDescription')}
    </WidgetContainer>
  );
}
