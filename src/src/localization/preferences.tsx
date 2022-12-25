import { createDictionary } from './utils';

// Refer to "Guidelines for Programmers" in ./README.md before editing this file

/* eslint-disable react/jsx-no-literals */
/* eslint-disable @typescript-eslint/naming-convention */
export const preferencesText = createDictionary({
  behavior: { 'en-us': 'Behavior' },
  features: { 'en-us': 'Features' },
  ghostEvent: { 'en-us': 'A keyboard shortcut to display event as a ghost' },
  ghostEventDescription: {
    'en-us':
      'Ghost events are displayed as semi-transparent and non-interactive',
  },
  disable: { 'en-us': 'Disable' },
  shiftClick: { 'en-us': 'Shift+Click' },
  cmdClick: { 'en-us': 'Cmd+Click' },
  ctrlClick: { 'en-us': 'Ctrl+Click' },
  ignoreAllDayEvents: { 'en-us': 'Ignore All-Day Events' },
  openOverlayShortcut: { 'en-us': 'Open Overlay Shortcut' },
  closeOverlayShortcut: { 'en-us': 'Close Overlay Shortcut' },
  ctrl: { 'en-us': 'Ctrl' },
  cmd: { 'en-us': 'Cmd' },
  shift: { 'en-us': 'Shift' },
  alt: { 'en-us': 'Alt' },
  meta: { 'en-us': 'Cmd' },
  pressKeys: { 'en-us': 'Press some keys...' },
  recurringEvents: { 'en-us': 'Recurring Events' },
  lessInvasiveDialog: {
    'en-us': 'Less Invasive "Edit recurring event" Dialog',
  },
  lessInvasiveDialogDescription: {
    'en-us': `
      Any edits to a recurring event trigger an "Edit recurring event" dialog.
      Most of the time you only want to edit "This event", thus the dialog is
      a bit annoying. This option makes the dialog less invasive by replacing it
      with a smaller overlay at the bottom of the screen. Additionally, if you
      click outside the dialog, "This event" option is automatically selected.
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
});
/* eslint-enable react/jsx-no-literals */
/* eslint-enable @typescript-eslint/naming-convention */
