import { GetSet, RA, setDevelopmentGlobal } from '../../utils/types';
import { useAsyncState } from '../../hooks/useAsyncState';
import React from 'react';
import { Widget } from './index';
import { defaultLayout } from './definitions';

export function useLayout(): GetSet<RA<Widget>> {
  const [layout = [], setLayout] = useAsyncState<RA<Widget>>(
    React.useCallback(
      () =>
        chrome.storage.sync.get('layout').then((layout) => {
          setDevelopmentGlobal('_layout', layout);
          return (layout as RA<Widget> | undefined) ?? defaultLayout;
        }),
      []
    ),
    false
  );
  const handleChange = React.useCallback((layout: RA<Widget>) => {
    chrome.storage.local
      .set({
        layout,
      })
      .catch(console.error);
    setLayout(layout);
  }, []);
  return [layout, handleChange];
}
