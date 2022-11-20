import React from 'react';
import { App } from '../App';
import { mount } from '../../../tests/reactUtils';
import { commonText } from '../../../localization/common';
import { CurrentViewContext } from '../../Contexts/CurrentViewContext';
import { testTime } from '../../../tests/helpers';
import { act } from '@testing-library/react';
import { VersionsContextProvider } from '../../Contexts/VersionsContext';

test('does not render until current date is extracted', () =>
  act(() => {
    const { container } = mount(
      <CurrentViewContext.Provider value={undefined}>
        <VersionsContextProvider>
          <App />
        </VersionsContextProvider>
      </CurrentViewContext.Provider>
    );
    expect(container.textContent).toEqual('');
  }));

test.skip('renders a button after current date is extracted', () =>
  act(() => {
    const { getByRole } = mount(
      <CurrentViewContext.Provider
        value={{
          view: 'day',
          selectedDay: testTime,
          firstDay: testTime,
          lastDay: testTime,
        }}
      >
        <VersionsContextProvider>
          <App />
        </VersionsContextProvider>
      </CurrentViewContext.Provider>
    );
    const linkElement = getByRole('button', {
      name: commonText('calendarPlus'),
    });
    expect(linkElement).toBeInTheDocument();
  }));
