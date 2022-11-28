import type { RA } from '../../utils/types';
import type { WidgetDefinition, WidgetGridColumnSizes } from './index';

export const singleRow = {
  xs: 1,
  sm: 1,
  md: 1,
  lg: 1,
  xl: 1,
  '2xl': 1,
} as const;

export const defaultLayout: RA<WidgetDefinition> = [
  {
    colSpan: {
      '2xl': 2,
      lg: 2,
      md: 3,
      sm: 1,
      xl: 2,
      xs: 1,
    },
    rowSpan: {
      '2xl': 1,
      lg: 1,
      md: 1,
      sm: 1,
      xl: 1,
      xs: 1,
    },
    definition: {
      type: 'GoalsWidget',
    },
  },
  {
    colSpan: {
      '2xl': 4,
      lg: 4,
      md: 3,
      sm: 1,
      xl: 4,
      xs: 1,
    },
    rowSpan: {
      '2xl': 1,
      lg: 1,
      md: 1,
      sm: 1,
      xl: 1,
      xs: 1,
    },
    definition: {
      type: 'StackedChart',
    },
  },
  {
    colSpan: {
      '2xl': 2,
      lg: 2,
      md: 3,
      sm: 1,
      xl: 2,
      xs: 1,
    },
    rowSpan: {
      '2xl': 2,
      lg: 2,
      md: 1,
      sm: 1,
      xl: 2,
      xs: 1,
    },
    definition: {
      type: 'DoughnutChart',
    },
  },
  {
    colSpan: {
      xs: 1,
      sm: 1,
      md: 3,
      lg: 4,
      xl: 4,
      '2xl': 4,
    },
    rowSpan: {
      xs: 1,
      sm: 1,
      md: 1,
      lg: 7,
      xl: 11,
      '2xl': 9,
    },
    definition: {
      type: 'VirtualCalendars',
    },
  },
  {
    colSpan: {
      xs: 1,
      sm: 1,
      md: 1,
      lg: 2,
      xl: 2,
      '2xl': 2,
    },
    rowSpan: {
      xs: 1,
      sm: 1,
      md: 1,
      lg: 1,
      xl: 1,
      '2xl': 1,
    },
    definition: {
      type: 'DataExport',
    },
  },
  {
    colSpan: {
      xs: 1,
      sm: 1,
      md: 2,
      lg: 2,
      xl: 2,
      '2xl': 2,
    },
    rowSpan: {
      xs: 1,
      sm: 1,
      md: 1,
      lg: 1,
      xl: 1,
      '2xl': 1,
    },
    definition: {
      type: 'Shortcuts',
    },
  },
  {
    colSpan: {
      xs: 1,
      sm: 1,
      md: 2,
      lg: 2,
      xl: 2,
      '2xl': 2,
    },
    rowSpan: {
      xs: 1,
      sm: 1,
      md: 1,
      lg: 1,
      xl: 1,
      '2xl': 1,
    },
    definition: {
      type: 'QuickActions',
    },
  },
  {
    colSpan: {
      xs: 1,
      sm: 1,
      md: 1,
      lg: 2,
      xl: 2,
      '2xl': 2,
    },
    rowSpan: {
      xs: 1,
      sm: 1,
      md: 1,
      lg: 1,
      xl: 1,
      '2xl': 1,
    },
    definition: {
      type: 'Suggestions',
    },
  },
];

export const widgetGridColumnSizes: WidgetGridColumnSizes = {
  xs: 1,
  sm: 1,
  md: 3,
  lg: 6,
  xl: 6,
  '2xl': 6,
};
