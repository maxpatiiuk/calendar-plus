import React from 'react';

import { commonText } from '../../localization/common';
import type { GetSet, IR, RA } from '../../utils/types';
import { isDefined } from '../../utils/types';
import { Button, H3 } from '../Atoms';
import { downloadFile } from '../Molecules/FilePicker';
import { usePref } from '../Preferences/usePref';
import { output } from '../Errors/exceptions';

export function WidgetContainer({
  header,
  buttons = <span className="-ml-2 flex-1" />,
  children,
  editing,
  className = '',
  getJsonExport,
  getTsvExport,
}: {
  readonly header: string;
  readonly buttons?: JSX.Element;
  readonly children: React.ReactNode;
  readonly className?: string;
  readonly editing?: GetSet<boolean>;
  readonly getJsonExport: (() => RA<unknown>) | undefined;
  readonly getTsvExport:
    | (() => RA<IR<number | string | undefined>>)
    | undefined;
}): JSX.Element {
  const [exportFormat] = usePref('export', 'format');
  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex gap-2">
        <H3 className="pr-2">{header}</H3>
        {buttons}
        {typeof getJsonExport === 'function' &&
        typeof getTsvExport === 'function' ? (
          <Button.White
            onClick={(): void =>
              void downloadFile(
                `${header}.${exportFormat}`,
                exportFormat === 'json'
                  ? JSON.stringify(getJsonExport(), null, 4)
                  : objectToTsv(getTsvExport(), exportFormat),
              ).catch(output.error)
            }
          >
            {commonText('export')}
          </Button.White>
        ) : undefined}
        {editing !== undefined && (
          <Button.White
            aria-pressed={editing[0] ? true : undefined}
            onClick={(): void => editing[1](!editing[0])}
          >
            {editing[0] ? commonText('save') : commonText('edit')}
          </Button.White>
        )}
      </div>
      <div className={`flex flex-1 flex-col gap-4 ${className}`}>
        {children}
      </div>
    </div>
  );
}

function objectToTsv(
  data: RA<IR<number | string | undefined>>,
  format: 'csv' | 'tsv',
): string {
  const delimiter = format === 'csv' ? ',' : '\t';
  const keys = Object.entries(data[0] ?? {})
    .map(([key, value]) => (typeof value === 'object' ? undefined : key))
    .filter(isDefined);
  return [keys, ...data.map((values) => keys.map((key) => values[key] ?? ''))]
    .map((row) => row.join(delimiter))
    .join('\n');
}
