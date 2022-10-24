import React from 'react';
import { WidgetContainer } from './WidgetContainer';
import { Button } from '../Atoms';
import { EventsStore } from '../EventsStore';
import { CalendarsContext } from '../Contexts/CalendarsContext';
import { downloadFile } from '../../utils/utils';
import { commonText } from '../../localization/common';

export function DataExport({
  label,
  durations,
}: {
  readonly label: string;
  readonly durations: EventsStore | undefined;
}): JSX.Element {
  const calendars = React.useContext(CalendarsContext);

  function createExport(type: 'csv' | 'tsv') {
    if (durations === undefined || calendars === undefined) return;
    const separator = type === 'csv' ? ',' : '\t';
    const data = [
      [commonText('calendar'), commonText('date'), commonText('duration')],
      ...calendars.flatMap(({ id, summary }) =>
        Object.entries(durations[id] ?? {}).map(([date, duration]) => [
          type === 'csv' && summary.includes(',')
            ? `"${summary.replaceAll('"', '""')}"`
            : summary,
          date,
          duration,
        ])
      ),
    ]
      .map((row) => row.join(separator))
      .join('\n');

    downloadFile(`calendar-plus.${type}`, data).catch(console.error);
  }

  return (
    <WidgetContainer header={label}>
      <div className="flex flex-wrap gap-2">
        <Button.White
          onClick={() => createExport('csv')}
          disabled={durations === undefined || calendars === undefined}
        >
          {commonText('exportToCsv')}
        </Button.White>
        <Button.White
          onClick={() => createExport('tsv')}
          disabled={durations === undefined || calendars === undefined}
        >
          {commonText('exportToCsv')}
        </Button.White>
      </div>
    </WidgetContainer>
  );
}
