import React from 'react';
import { formatNumber } from '../Atoms/Internationalization';

/**
 * UI for a gage/indicator
 *
 * @remarks
 * Based on https://www.youtube.com/watch?v=Ft73g5Kyknw
 */
export function Gage({
  value,
  max,
  label,
  color,
  size,
  fontSize,
}: {
  readonly value: number;
  readonly max: number;
  readonly label: string;
  readonly color: string;
  // Sizes in rem
  readonly size: number;
  readonly fontSize: number;
}): JSX.Element {
  const percentage = Math.round((value / max) * 100);
  const normalizedPercentage = Math.min(percentage, 100);
  /*
   * This radius is based on the viewBox of the SVG. The container itself
   * can resize without the need for changing this
   */
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  return (
    <div
      title={label}
      className="relative h-[var(--size)] w-[var(--size)]"
      style={{ '--size': `${size}rem` } as React.CSSProperties}
    >
      <svg
        className="relative h-full w-full stroke-gray-200 dark:stroke-neutral-600"
        viewBox="0 0 100 100"
      >
        <Circle radius={radius} className="translate-y-[8px]" />
        <Circle
          radius={radius}
          style={
            {
              '--circumference': circumference,
              '--value': normalizedPercentage,
            } as React.CSSProperties
          }
          strokeDasharray={circumference}
          className={`
            origin-center translate-y-[-8px] -rotate-90
            [stroke-dashoffset:calc(var(--circumference)-(var(--circumference)*var(--value))/100)]
            [stroke-dasharray:var(--circumference)]
          `}
          stroke={color}
        />
      </svg>
      <div
        className="text-[size:var(--font-size)] absolute inset-0 flex h-full w-full items-center justify-center"
        style={{ '--font-size': `${fontSize}rem` } as React.CSSProperties}
      >
        {`${formatNumber(percentage)}%`}
      </div>
      <meter
        min={0}
        max={100}
        className="sr-only"
        value={percentage}
        aria-label={label}
      />
    </div>
  );
}

function Circle({
  className = '',
  radius,
  ...props
}: React.SVGProps<SVGCircleElement> & {
  readonly radius: number;
}): JSX.Element {
  return (
    <circle
      cx={radius}
      cy={radius}
      r={radius}
      fill="none"
      strokeWidth={12}
      strokeLinecap="round"
      className={`translate-x-[8px] ${className}`}
      {...props}
    />
  );
}
