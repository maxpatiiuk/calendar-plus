/**
 * Definitions for User Interface preferences
 */

import { commonText } from '../../localization/common';
import { preferencesText } from '../../localization/preferences';
import type { IR } from '../../utils/types';
import { ensure } from '../../utils/types';
import type { KeyboardShortcuts } from '../KeyboardShortcuts/config';
import { SetKeyboardShortcuts } from '../KeyboardShortcuts/Shortcuts';
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
const definePref = <VALUE,>(
  definition: PreferenceItem<VALUE>,
): PreferenceItem<VALUE> => definition;

const defineKeyboardShortcut = (
  title: string,
  /**
   * If defined a keyboard shortcut for one platform, it will be automatically
   * transformed (`ctrl -> cmd`) for the other platforms.
   *
   * Thus, you should define keyboard shortcuts for the "other" platform only,
   * unless you actually want to use different keyboard shortcuts on different
   * systems.
   */
  defaultValue: KeyboardShortcuts | string,
): PreferenceItem<KeyboardShortcuts> =>
  definePref<KeyboardShortcuts>({
    title,
    defaultValue:
      typeof defaultValue === 'string'
        ? { other: [defaultValue] }
        : defaultValue,
    renderer: SetKeyboardShortcuts,
  });

export type GenericPreferencesCategories = IR<{
  readonly title: string;
  readonly description?: string;
  readonly items: IR<PreferenceItem<any>>;
}>;

export const ghostEventShortcuts = [
  { value: 'none', title: preferencesText('disable') },
  { value: 'shift', title: preferencesText('shiftClick') },
  { value: 'cmd', title: preferencesText('cmdClick') },
  { value: 'ctrl', title: preferencesText('ctrlClick') },
] as const;

export const preferenceDefinitions = {
  behavior: {
    title: preferencesText('behavior'),
    items: {
      ignoreAllDayEvents: definePref<boolean>({
        title: preferencesText('ignoreAllDayEvents'),
        renderer: BooleanPref,
        defaultValue: true,
      }),
    },
  },
  feature: {
    title: preferencesText('features'),
    items: {
      openOverlayShortcut: defineKeyboardShortcut(
        preferencesText('openOverlayShortcut'),
        'Backquote',
      ),
      closeOverlayShortcut: defineKeyboardShortcut(
        preferencesText('closeOverlayShortcut'),
        'Backquote',
      ),
      ghostEventShortcut: definePref<'cmd' | 'ctrl' | 'none' | 'shift'>({
        title: preferencesText('ghostEvent'),
        description: preferencesText('ghostEventDescription'),
        renderer: pickListPref<'cmd' | 'ctrl' | 'none' | 'shift'>(
          ghostEventShortcuts,
        ),
        defaultValue: 'shift' as const,
      }),
      ghostEventOpacity: definePref<number>({
        title: preferencesText('ghostedEventOpacity'),
        renderer: rangePref({ min: 0, max: 100, step: 1 }),
        defaultValue: 30,
      }),
      condenseInterface: definePref<boolean>({
        title: preferencesText('condenseInterface'),
        renderer: BooleanPref,
        defaultValue: false,
      }),
    },
  },
  recurringEvents: {
    title: preferencesText('recurringEvents'),
    items: {
      hideEditAll: definePref<boolean>({
        title: preferencesText('hideEditAll'),
        description: preferencesText('hideEditAllDescription'),
        renderer: BooleanPref,
        defaultValue: false,
      }),
      lessInvasiveDialog: definePref<boolean>({
        title: preferencesText('lessInvasiveDialog'),
        description: preferencesText('lessInvasiveDialogDescription'),
        renderer: BooleanPref,
        defaultValue: false,
      }),
    },
  },
  export: {
    title: commonText('dataExport'),
    items: {
      format: definePref<'csv' | 'json' | 'tsv'>({
        title: preferencesText('exportFormat'),
        renderer: pickListPref<'csv' | 'json' | 'tsv'>([
          { value: 'json', title: preferencesText('json') },
          { value: 'tsv', title: preferencesText('tsv') },
          { value: 'csv', title: preferencesText('csv') },
        ]),
        defaultValue: 'csv' as const,
      }),
    },
  },
} as const;

export const noLabelRenderers = [SetKeyboardShortcuts];

export type Preferences = GenericPreferencesCategories &
  typeof preferenceDefinitions;

ensure<GenericPreferencesCategories>()(preferenceDefinitions);
