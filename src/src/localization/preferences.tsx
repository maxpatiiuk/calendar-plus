/**
 * Localization strings for user preferences
 */

import { createDictionary } from './utils';

// Refer to "Guidelines for Programmers" in ./README.md before editing this file

export const preferencesText = createDictionary({
  behavior: { 'en-us': 'Behavior' },
  features: { 'en-us': 'Features' },
  ghostEvent: { 'en-us': 'A keyboard shortcut to display event as a ghost' },
  ghostEventDescription: {
    'en-us':
      'Ghost events are displayed as semi-transparent and non-interactive',
  },
  ghostedEventOpacity: { 'en-us': 'Ghosted Event Opacity' },
  disable: { 'en-us': 'Disable' },
  shiftClick: { 'en-us': 'Shift+Click' },
  cmdClick: { 'en-us': 'Cmd+Click' },
  ctrlClick: { 'en-us': 'Ctrl+Click' },
  ignoreAllDayEvents: { 'en-us': 'Ignore All-Day Events' },
  openOverlayShortcut: { 'en-us': 'Open Overlay Shortcut' },
  closeOverlayShortcut: { 'en-us': 'Close Overlay Shortcut' },
  pressKeys: { 'en-us': 'Press some keys...' },
  noKeyAssigned: { 'en-us': 'No key assigned' },
  recurringEvents: { 'en-us': 'Recurring Events' },
  lessInvasiveDialog: {
    'en-us': 'Less Invasive "Edit recurring event" Dialog',
  },
  lessInvasiveDialogDescription: {
    'en-us': `
      Any edits to a recurring event in Google Calendar triggers an "Edit
      recurring event" dialog. Most of the time you only want to edit "This
      event", thus the dialog is a bit annoying. This Calendar Plus option will
      auto-select the "This event" option from the dialog without prompting you.
      The behavior can be temporary suppressed by holding the Shift key.
    `,
  },
  hideEditAll: { 'en-us': 'Hide edit "All Events" option' },
  hideEditAllDescription: {
    'en-us': `
      If enabled, "All Events" option in a "Edit recurring event" dialog would
      be hidden until hover over the dialog for three seconds. This saves from
      miss click on a potentially dangerous option
    `,
  },
  exportFormat: {
    'en-us': 'Export File Format',
  },
  csv: { 'en-us': 'CSV' },
  tsv: { 'en-us': 'TSV' },
  json: { 'en-us': 'JSON' },
  condenseInterface: {
    'en-us': 'Condense Interface',
  },
  alt: {
    comment: 'Alt key on the keyboard',
    'en-us': 'Alt',
  },
  macOption: {
    comment: 'Option key on the macOS keyboard',
    'en-us': '⌥',
  },
  ctrl: {
    comment: 'Ctrl key on the keyboard',
    'en-us': 'Ctrl',
  },
  macControl: {
    comment: 'Control key on the macOS keyboard',
    'en-us': '⌃',
  },
  macMeta: {
    comment: 'Meta/Command key on the macOS keyboard',
    'en-us': '⌘',
  },
  macShift: {
    comment: 'Shift key on the macOS keyboard',
    'en-us': '⇧',
  },
  shift: {
    comment: 'Shift key on the keyboard',
    'en-us': 'Shift',
  },
  keyboardShortcuts: {
    'en-us': 'Keyboard Shortcuts',
  },
  autocompleteFromCurrentWeek: {
    'en-us': 'Autocomplete event names based on events from current week',
  },
});
