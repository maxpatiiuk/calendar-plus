import React from 'react';

import { H2 } from '../Atoms';

export function PageHeader({
  label,
  children,
}: {
  readonly label: string;
  readonly children: React.ReactNode;
}): JSX.Element {
  return (
    <div className="flex gap-2">
      <H2>{label}</H2>
      <span className="-ml-2 flex-1" />
      {children}
    </div>
  );
}
