import React from 'react';
import { PortalContext } from '../Molecules/Portal';

/**
 * Find a TailWind breakpoint corresponding to current portal container width
 */
export function useBreakpoint(): BreakPoint {
  const container = React.useContext(PortalContext);
  if (container === undefined)
    throw new Error('Cannot invoke usePortalWidth outside a portal');

  const [breakpoint, setBreakpoint] = React.useState(() =>
    resolveBreakpoint(container.clientWidth)
  );

  React.useEffect(() => {
    const resizeObserver = new ResizeObserver(() =>
      setBreakpoint(resolveBreakpoint(container.clientWidth))
    );

    resizeObserver.observe(container);
    return (): void => resizeObserver.disconnect();
  });

  return breakpoint;
}

const breakpointsTailwind = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};
const breakpoints = Object.entries(breakpointsTailwind).reverse();

export type BreakPoint = keyof typeof breakpointsTailwind;

const resolveBreakpoint = (width: number) =>
  breakpoints.find(([_name, breakpoint]) => width > breakpoint)?.[0] ?? 'xs';
