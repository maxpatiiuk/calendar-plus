import { useAsyncState } from '../../hooks/useAsyncState';
import { ajax } from '../../utils/ajax';
import { commonText } from '../../localization/common';
import React from 'react';
import { RA } from '../../utils/types';

type CalendarListEntry = any;
// *FIX* gapi.client.calendar.CalendarListEntry has a type problem

export function ListCalendars(): JSX.Element {
  const [calendars] = useAsyncState<RA<CalendarListEntry>>(
    React.useCallback(
      () =>
        ajax('https://www.googleapis.com/calendar/v3/users/me/calendarList')
          .then((response) => response.json())
          .then((results) => results.items),
      []
    ),
    false
  );
  return (
    <pre>{JSON.stringify(calendars ?? commonText('loading'), null, 4)}</pre>
  );
}
