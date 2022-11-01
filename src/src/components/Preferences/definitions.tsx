/**
 * Definitions for User Interface preferences (scoped to a SpecifyUser)
 */

import { preferencesText } from '../../localization/preferences';
import type { IR } from '../../utils/types';
import { ensure } from '../../utils/types';
import { BooleanPref, pickListPref } from './Renderers';

/**
 * Represents a single preference option
 *
 * The concept seems similar to the "Feature Gates" in Firefox:
 * https://firefox-source-docs.mozilla.org/toolkit/components/featuregates/featuregates/
 */
export type PreferenceItem<VALUE> = {
  readonly title: JSX.Element | string;
  readonly description?: JSX.Element | string;
  readonly defaultValue: VALUE;
  readonly renderer: PreferenceRenderer<VALUE>;
};

// Custom Renderer for a preference item
export type PreferenceRenderer<VALUE> = (props: {
  readonly definition: PreferenceItem<VALUE>;
  readonly value: VALUE;
  readonly onChange: (value: VALUE) => void;
}) => JSX.Element;

/**
 * This is used to enforce the same generic value be used inside a PreferenceItem
 */
const defineItem = <VALUE,>(
  definition: PreferenceItem<VALUE>
): PreferenceItem<VALUE> => definition;

export type GenericPreferencesCategories = IR<{
  readonly title: string;
  readonly description?: string;
  readonly items: IR<PreferenceItem<any>>;
}>;
export const preferenceDefinitions = {
  behavior: {
    title: preferencesText('behavior'),
    items: {
      includeAllDayEvents: defineItem<boolean>({
        title: preferencesText('includeAllDayEvents'),
        renderer: BooleanPref,
        defaultValue: true,
      }),
    },
  },
  features: {
    title: preferencesText('features'),
    items: {
      ghostEventShortcut: defineItem<'cmd' | 'ctrl' | 'none' | 'shift'>({
        title: preferencesText('ghostEvent'),
        description: preferencesText('ghostEventDescription'),
        renderer: pickListPref<'cmd' | 'ctrl' | 'none' | 'shift'>([
          { value: 'none', title: preferencesText('disable') },
          { value: 'shift', title: preferencesText('shiftClick') },
          { value: 'cmd', title: preferencesText('cmdClick') },
          { value: 'ctrl', title: preferencesText('ctrlClick') },
        ]),
        defaultValue: 'shift' as const,
      }),
    },
  },
} as const;

export type Preferences = GenericPreferencesCategories &
  typeof preferenceDefinitions;

ensure<GenericPreferencesCategories>()(preferenceDefinitions);
