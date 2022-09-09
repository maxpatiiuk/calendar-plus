import React from 'react';
import { App } from './App';
import {mount} from '../../tests/reactUtils';

test('renders learn react link', () => {
  const {getByRole } = mount(<App />);
  const linkElement = getByRole('link', { name: /learn react/i })
  expect(linkElement).toBeInTheDocument();
});
