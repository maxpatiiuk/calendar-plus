import React from 'react';

import { listen } from '../utils/events';

function useMedia(query: string): boolean {
  const media = React.useMemo(() => globalThis.matchMedia(query), [query]);
  const [matches, setMatches] = React.useState(media.matches);
  React.useEffect(() => {
    const handleChange = (): void => setMatches(media.matches);
    handleChange();
    return listen(media, 'change', handleChange);
  }, [media]);
  return matches;
}

function useReducedMotion(): boolean {
  return useMedia('(prefers-reduced-motion: reduce)');
}

const defaultTransitionDuration = 100;

export function useTransitionDuration(): number {
  const reduceMotion = useReducedMotion();
  return React.useMemo(
    () => (reduceMotion ? 0 : defaultTransitionDuration),
    [reduceMotion]
  );
}
