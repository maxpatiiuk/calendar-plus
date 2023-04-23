import React from 'react';

import { usePref } from '../Preferences/usePref';

/**
 * Toggle the styling for a condensed UI
 */
export function CondenseInterface(): null {
  const [condenseInterface] = usePref('feature', 'condenseInterface');
  React.useEffect(
    () =>
      void document.body.classList.toggle(
        'condense-interface',
        condenseInterface
      ),
    [condenseInterface]
  );
  return null;
}
