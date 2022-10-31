import { createDictionary } from './utils';

// Refer to "Guidelines for Programmers" in ./README.md before editing this file

/* eslint-disable react/jsx-no-literals */
/* eslint-disable @typescript-eslint/naming-convention */
export const preferencesText = createDictionary({
  behavior: { 'en-us': 'Behavior' },
  includeAllDayEvents: { 'en-us': 'Include All-Day Events' },
  features: { 'en-us': 'Features' },
  ghostEvent: { 'en-us': 'Display event as a ghost' },
  ghostEventDescription: {
    'en-us': 'Display event as semi-transparent and non-interactive',
  },
  shiftClick: { 'en-us': 'Shift+Click' },
  cmdClick: { 'en-us': 'Cmd+Click' },
  ctrlClick: { 'en-us': 'Ctrl+Click' },
});
/* eslint-enable react/jsx-no-literals */
/* eslint-enable @typescript-eslint/naming-convention */
