import React from 'react';

import type { GetSet, IR } from '../../utils/types';
import { removeKey } from '../../utils/utils';
import { PreferencesContext } from './Context';
import type { preferenceDefinitions, Preferences } from './Definitions';
import { getPrefDefinition } from './helpers';

/**
 * React Hook to listen to preferences changes
 * (this allows to change UI preferences without restarting the application)
 */
export function usePref<
  CATEGORY extends keyof Preferences,
  ITEM extends CATEGORY extends keyof typeof preferenceDefinitions
    ? string & keyof Preferences[CATEGORY]['items']
    : never
>(
  category: CATEGORY,
  item: ITEM
): GetSet<Preferences[CATEGORY]['items'][ITEM]['defaultValue']> {
  const [preferences, setPreferences] = React.useContext(PreferencesContext);
  const definition = getPrefDefinition(category, item);
  const value = preferences[category]?.[item] ?? definition.defaultValue;

  const updatePref = React.useCallback(
    (newPref: Preferences[CATEGORY]['items'][ITEM]['defaultValue']): void => {
      const isDefault = definition.defaultValue === newPref;
      if (isDefault) {
        const items = removeKey(
          (preferences[category] as IR<unknown>) ?? {},
          item
        );
        setPreferences(
          Object.keys(items).length === 0
            ? removeKey(preferences, category)
            : {
                ...preferences,
                [category]: items,
              }
        );
      } else
        setPreferences({
          ...preferences,
          [category]: {
            ...preferences[category],
            [item]: newPref,
          },
        });
    },
    [category, item, preferences, setPreferences]
  );

  return [value, updatePref] as const;
}
