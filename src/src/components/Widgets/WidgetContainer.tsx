import React from 'react';
import { GetSet } from '../../utils/types';
import { commonText } from '../../localization/common';
import { Button, H3 } from '../Atoms';

export function WidgetContainer({
  header,
  buttons = <span className="-ml-2 flex-1" />,
  children,
  editing,
}: {
  readonly header: string;
  readonly buttons?: JSX.Element;
  readonly children: React.ReactNode;
  readonly editing?: GetSet<boolean>;
}): JSX.Element {
  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex gap-4">
        <H3>{header}</H3>
        {buttons}
        {editing !== undefined && (
          <Button.White
            aria-pressed={editing[0] ? true : undefined}
            onClick={(): void => editing[1](!editing[0])}
          >
            {editing[0] ? commonText('save') : commonText('edit')}
          </Button.White>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2">{children}</div>
    </div>
  );
}
