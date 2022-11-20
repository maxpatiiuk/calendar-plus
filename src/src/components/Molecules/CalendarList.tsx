import React from 'react';

import { commonText } from '../../localization/common';
import { f } from '../../utils/functools';
import type { RA } from '../../utils/types';
import { Select } from '../Atoms';
import type { CalendarListEntry } from '../Contexts/CalendarsContext';
import type { VirtualCalendar } from '../Widgets/VirtualCalendars';

export function CalendarList({
  value,
  calendars,
  onChange: handleChange,
}: {
  readonly value: string;
  readonly calendars: RA<CalendarListEntry>;
  readonly onChange: (id: string) => void;
}): JSX.Element {
  return (
    <Select
      aria-label={commonText('calendar')}
      required
      title={commonText('calendar')}
      value={value}
      onValueChange={handleChange}
    >
      {calendars.map(({ id, summary }) => (
        <option key={id} value={id}>
          {summary}
        </option>
      ))}
    </Select>
  );
}

export function VirtualCalendarsList({
  value,
  calendarId,
  virtualCalendars,
  onChange: handleChange,
}: {
  readonly value: string | undefined;
  readonly calendarId: string;
  readonly virtualCalendars: RA<VirtualCalendar>;
  readonly onChange: (name: string | undefined) => void;
}): JSX.Element {
  const categories = React.useMemo(
    () =>
      f
        .unique(
          virtualCalendars
            .filter(
              (virtualCalendar) => virtualCalendar.calendarId === calendarId
            )
            .map(({ virtualCalendar }) => virtualCalendar)
        )
        .filter((category) => category !== undefined),
    [virtualCalendars, calendarId]
  );
  return (
    <Select
      aria-label={commonText('calendar')}
      required
      title={commonText('calendar')}
      value={value ?? ''}
      onValueChange={(value): void => handleChange(value || undefined)}
    >
      <option value="">{commonText('allCategories')}</option>
      {categories.map((virtualCalendar) => (
        <option key={virtualCalendar} value={virtualCalendar}>
          {virtualCalendar}
        </option>
      ))}
    </Select>
  );
}
