import { RA } from '../../utils/types';
import type { WidgetDefinition } from './index';
import { WidgetGridColumnSizes } from './index';

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
      '2xl': 1,
      lg: 2,
      md: 3,
      sm: 1,
      xl: 2,
      xs: 1,
    },
    definition: {
      type: 'GoalsWidget',
    },
    rowSpan: singleRow,
  },
  {
    colSpan: {
      '2xl': 1,
      lg: 1,
      md: 3,
      sm: 1,
      xl: 1,
      xs: 1,
    },
    definition: {
      type: 'QuickActions',
    },
    rowSpan: singleRow,
  },
  {
    colSpan: {
      '2xl': 3,
      lg: 3,
      md: 3,
      sm: 1,
      xl: 3,
      xs: 1,
    },
    definition: {
      type: 'StackedChart',
    },
    rowSpan: singleRow,
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
    definition: {
      type: 'DoughnutChart',
    },
    rowSpan: {
      '2xl': 2,
      lg: 3,
      md: 3,
      sm: 1,
      xl: 2,
      xs: 1,
    },
  },
  {
    colSpan: {
      '2xl': 1,
      lg: 3,
      md: 3,
      sm: 1,
      xl: 2,
      xs: 1,
    },
    definition: {
      type: 'DataExport',
    },
    rowSpan: singleRow,
  },
  {
    colSpan: {
      '2xl': 1,
      lg: 3,
      md: 3,
      sm: 1,
      xl: 2,
      xs: 1,
    },
    definition: {
      type: 'Suggestions',
    },
    rowSpan: singleRow,
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
