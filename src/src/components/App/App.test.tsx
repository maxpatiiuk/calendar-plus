import React from 'react';
import { App } from './App';
import {mount} from '../../tests/reactUtils';

test('renders a button', () => {
  const {getByRole } = mount(<App />);
  const linkElement = getByRole('button', { name: /Click me/u });
  expect(linkElement).toBeInTheDocument();
});
