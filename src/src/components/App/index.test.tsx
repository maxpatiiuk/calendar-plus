import React from 'react';
import { App } from './index';
import { mount } from '../../tests/reactUtils';
import { commonText } from '../../localization/common';

test('renders a button', () => {
  const { getByRole } = mount(<App />);
  const linkElement = getByRole('button', {
    name: commonText('calendarPlus'),
  });
  expect(linkElement).toBeInTheDocument();
});
