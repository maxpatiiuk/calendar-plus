import { GetSet, RA, setDevelopmentGlobal } from '../../utils/types';
import { useAsyncState } from '../../hooks/useAsyncState';
import React from 'react';
import type { WidgetDefinition } from './index';
import { defaultLayout } from './definitions';

export function useLayout(): GetSet<RA<WidgetDefinition>> {
  const [layout = [], setLayout] = useAsyncState<RA<WidgetDefinition>>(
    React.useCallback(
      () =>
        chrome.storage.sync.get('layout').then(({ layout }) => {
          setDevelopmentGlobal('_layout', layout);
          return (layout as RA<WidgetDefinition> | undefined) ?? defaultLayout;
        }),
      []
    ),
    false
  );
  const handleChange = React.useCallback((layout: RA<WidgetDefinition>) => {
    chrome.storage.local
      .set({
        layout,
      })
      .catch(console.error);
    setLayout(layout);
  }, []);
  return [layout, handleChange];
}
