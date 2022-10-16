import React from 'react';

export function WidgetContainer({
  header,
  children,
}: {
  readonly header: string;
  readonly children: React.ReactNode;
}): JSX.Element {
  return (
    <div className="flex flex-col gap-2">
      <h2>{header}</h2>
      <div className="flex-1">{children}</div>
    </div>
  );
}
