import React from 'react';

export function CalendarIndicator({
  color,
}: {
  readonly color: string;
}): JSX.Element {
  return (
    <div
      aria-hidden
      className="h-5 w-5 rounded-full bg-[var(--color)]"
      style={{ '--color': color } as React.CSSProperties}
    />
  );
}
