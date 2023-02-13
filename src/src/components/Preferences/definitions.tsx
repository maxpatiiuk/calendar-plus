/**
 * Definitions for User Interface preferences (scoped to a SpecifyUser)
 */

import { preferencesText } from '../../localization/preferences';
import type { IR } from '../../utils/types';
import { ensure } from '../../utils/types';
import type { KeyboardShortcuts } from '../Molecules/KeyboardShortcut';
import { SetKeyboardShortcuts } from '../Molecules/KeyboardShortcut';
import { BooleanPref, pickListPref, rangePref } from './Renderers';

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
      ignoreAllDayEvents: defineItem<boolean>({
        title: preferencesText('ignoreAllDayEvents'),
        renderer: BooleanPref,
        defaultValue: true,
      }),
    },
  },
  feature: {
    title: preferencesText('features'),
    items: {
      openOverlayShortcut: defineItem<KeyboardShortcuts>({
        title: preferencesText('openOverlayShortcut'),
        renderer: SetKeyboardShortcuts,
        defaultValue: {
          linux: [{ modifiers: [], keys: ['`'] }],
          macOS: [{ modifiers: [], keys: ['`'] }],
          windows: [{ modifiers: [], keys: ['`'] }],
        },
      }),
      closeOverlayShortcut: defineItem<KeyboardShortcuts>({
        title: preferencesText('closeOverlayShortcut'),
        renderer: SetKeyboardShortcuts,
        defaultValue: {
          linux: [{ modifiers: [], keys: ['`'] }],
          macOS: [{ modifiers: [], keys: ['`'] }],
          windows: [{ modifiers: [], keys: ['`'] }],
        },
      }),
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
      ghostEventOpacity: defineItem<number>({
        title: preferencesText('ghostedEventOpacity'),
        renderer: rangePref({ min: 0, max: 100, step: 1 }),
        defaultValue: 30,
      }),
    },
  },
  recurringEvents: {
    title: preferencesText('recurringEvents'),
    items: {
      hideEditAll: defineItem<boolean>({
        title: preferencesText('hideEditAll'),
        description: preferencesText('hideEditAllDescription'),
        renderer: BooleanPref,
        defaultValue: false,
      }),
      lessInvasiveDialog: defineItem<boolean>({
        title: preferencesText('lessInvasiveDialog'),
        description: preferencesText('lessInvasiveDialogDescription'),
        renderer: BooleanPref,
        defaultValue: false,
      }),
    },
  },
} as const;

export const noLabelRenderers = [SetKeyboardShortcuts];

export type Preferences = GenericPreferencesCategories &
  typeof preferenceDefinitions;

ensure<GenericPreferencesCategories>()(preferenceDefinitions);
