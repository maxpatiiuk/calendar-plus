/**
 * Utilities for dealing with user preferences
 */
import type { Preferences } from './definitions';
import { preferenceDefinitions } from './definitions';

export const getPrefDefinition = <
  CATEGORY extends keyof Preferences,
  ITEM extends keyof Preferences[CATEGORY]['items']
>(
  category: CATEGORY,
  item: ITEM
): Preferences[CATEGORY]['items'][ITEM] =>
  // @ts-expect-error
  preferenceDefinitions[category].items[item];

export type UserPreferences = {
  readonly [CATEGORY in keyof Preferences]?: {
    readonly [ITEM in keyof Preferences[CATEGORY]['items']]?: Preferences[CATEGORY]['items'][ITEM]['defaultValue'];
  };
};
