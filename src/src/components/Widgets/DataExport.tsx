import React from 'react';

import { commonText } from '../../localization/common';
import { downloadFile } from '../../utils/utils';
import { Button } from '../Atoms';
import { CalendarsContext } from '../Contexts/CalendarsContext';
import type { EventsStore } from '../EventsStore';
import { WidgetContainer } from './WidgetContainer';

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

  function createExportToJson() {
    if (durations === undefined || calendars === undefined) return;
    const data = [
      [commonText('calendar'), commonText('date'), commonText('duration')],
      ...calendars.flatMap(({ id, summary }) =>
        Object.entries(durations[id] ?? {}).map(([date, duration]) => [
          summary,
          date,
          duration,
        ])
      ),
    ]
    const jsonString = JSON.stringify(data);
    downloadFile(`calendar-plus.json`, jsonString).catch(console.error);
  }

  return (
    <WidgetContainer header={label}>
      <div className="flex flex-wrap gap-2">
        <Button.White
          disabled={durations === undefined || calendars === undefined}
          onClick={() => createExport('csv')}
        >
          {commonText('exportToCsv')}
        </Button.White>
        <Button.White
          disabled={durations === undefined || calendars === undefined}
          onClick={() => createExport('tsv')}
        >
          {commonText('exportToTsv')}
        </Button.White>
        <Button.White
          disabled={durations === undefined || calendars === undefined}
          onClick={() => createExportToJson()}
        >
          {'Export To Json'}
        </Button.White>
      </div>
    </WidgetContainer>
  );
}
