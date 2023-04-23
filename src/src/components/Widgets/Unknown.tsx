import React from 'react';

import { commonText } from '../../localization/common';
import { WidgetContainer } from './WidgetContainer';

/**
 * Placeholder for usage when rendering unknown widget (might happen if
 * we removed or renamed a widget) - hopefully won't be seen by users
 */
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
