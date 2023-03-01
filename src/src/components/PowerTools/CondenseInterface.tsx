import React from 'react';

import { usePref } from '../Preferences/usePref';

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
