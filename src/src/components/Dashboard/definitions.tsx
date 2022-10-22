import { RA } from '../../utils/types';
import { Widget, WidgetGridColumnSizes } from './index';

const singleRow = {
  xs: 1,
  sm: 1,
  md: 1,
  lg: 1,
  xl: 1,
  '2xl': 1,
} as const;

export const defaultLayout: RA<Widget> = [
  {
    colSpan: {
      xs: 1,
      sm: 1,
      md: 3,
      lg: 2,
      xl: 1,
      '2xl': 1,
    },
    rowSpan: singleRow,
    definition: { type: 'GoalsWidget' },
  },
  {
    colSpan: {
      xs: 1,
      sm: 1,
      md: 3,
      lg: 2,
      xl: 1,
      '2xl': 1,
    },
    rowSpan: singleRow,
    definition: { type: 'QuickActions' },
  },
  {
    colSpan: {
      xs: 1,
      sm: 1,
      md: 3,
      lg: 2,
      xl: 1,
      '2xl': 1,
    },
    rowSpan: singleRow,
    definition: { type: 'Suggestions' },
  },
  {
    colSpan: {
      xs: 1,
      sm: 1,
      md: 3,
      lg: 3,
      xl: 3,
      '2xl': 3,
    },
    rowSpan: singleRow,
    definition: { type: 'StackedChart' },
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
      md: 2,
      lg: 2,
      xl: 2,
      '2xl': 2,
    },
    definition: { type: 'DoughnutChart' },
  },
  {
    colSpan: {
      xs: 1,
      sm: 1,
      md: 3,
      lg: 2,
      xl: 1,
      '2xl': 1,
    },
    rowSpan: singleRow,
    definition: { type: 'DataExport' },
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
