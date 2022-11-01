import React from 'react';

import { commonText } from '../../localization/common';
import type { RA } from '../../utils/types';
import { Select } from '../Atoms';
import type { CalendarListEntry } from '../Contexts/CalendarsContext';

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
