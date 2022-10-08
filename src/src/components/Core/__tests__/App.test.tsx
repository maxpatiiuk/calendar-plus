import React from 'react';
import { App } from '../App';
import { mount } from '../../../tests/reactUtils';
import { commonText } from '../../../localization/common';
import { CurrentViewContext } from '../../Contexts/CurrentViewContext';
import { testTime } from '../../../tests/helpers';

test('does not render until current date is extracted', () => {
  const { container } = mount(
    <CurrentViewContext.Provider value={undefined}>
      <App />
    </CurrentViewContext.Provider>
  );
  expect(container.textContent).toEqual('');
});

test('renders a button after current date is extracted', () => {
  const { getByRole } = mount(
    <CurrentViewContext.Provider
      value={{
        view: 'day',
        selectedDay: testTime,
        firstDay: testTime,
        lastDay: testTime,
      }}
    >
      <App />
    </CurrentViewContext.Provider>
  );
  const linkElement = getByRole('button', {
    name: commonText('calendarPlus'),
  });
  expect(linkElement).toBeInTheDocument();
});
