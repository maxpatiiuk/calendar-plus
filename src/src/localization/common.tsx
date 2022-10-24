import { createDictionary } from './utils';

// Refer to "Guidelines for Programmers" in ./README.md before editing this file

/* eslint-disable react/jsx-no-literals */
/* eslint-disable @typescript-eslint/naming-convention */
// REFACTOR: get rid of "exampleDialogText" in favor of just "example" ?
export const commonText = createDictionary({
  calendarPlus: { 'en-us': 'Calendar Plus' },
  fullDate: { 'en-us': 'Full Date' },
  loading: { 'en-us': 'Loading...' },
  close: { 'en-us': 'Close' },
  dashboard: { 'en-us': 'Dashboard' },
  date: { 'en-us': 'Date' },
  duration: { 'en-us': 'Duration' },
  goals: { 'en-us': 'Goals' },
  noGoals: { 'en-us': 'No goals configured at the moment' },
  quickActions: { 'en-us': 'Quick Actions' },
  noQuickActions: { 'en-us': 'No quick actions available at the moment' },
  suggestions: { 'en-us': 'Suggestions' },
  noSuggestions: { 'en-us': 'No suggestions available at the moment' },
  dataExport: { 'en-us': 'Data Export' },
  save: { 'en-us': 'Save' },
  edit: { 'en-us': 'Edit' },
  cancel: { 'en-us': 'Cancel' },
  resetToDefault: { 'en-us': 'Reset to Default' },
  decreaseWidth: { 'en-us': 'Decrease Width' },
  increaseWidth: { 'en-us': 'Increase Width' },
  decreaseHeight: { 'en-us': 'Decrease Height' },
  increaseHeight: { 'en-us': 'Increase Height' },
  remove: { 'en-us': 'Remove' },
  doughnutChart: { 'en-us': 'Doughnut Chart' },
  stackedChart: { 'en-us': 'Stacked Chart' },
  type: { 'en-us': 'Type' },
  addWidget: { 'en-us': 'Add Widget' },
  addGoal: { 'en-us': 'Add Goal' },
  hours: { 'en-us': 'hours' },
  minutes: { 'en-us': 'minutes' },
  calendar: { 'en-us': 'Calendar' },
  aOutOfB: { 'en-us': (a: string, b: string) => `${a} out of ${b}` },
  exportToCsv: { 'en-us': 'Export to CSV' },
  exportToTsv: { 'en-us': 'Export to TSV' },
});
/* eslint-enable react/jsx-no-literals */
/* eslint-enable @typescript-eslint/naming-convention */
