/**
 * Add a "hide-edit-all" class name to body which hides the "Edit All" option
 * from the "Edit recurring event" dialog unless until user hover over the
 * dialog for 3 seconds.
 */
import React from 'react';

import { usePref } from '../Preferences/usePref';

const className = 'hide-edit-all';

export function HideEditAll(): null {
  const [hideEditAll] = usePref('recurringEvents', 'hideEditAll');
  React.useEffect(() => {
    if (!hideEditAll) return undefined;
    document.body.classList.add(className);
    return (): void => document.body.classList.remove(className);
  }, [hideEditAll]);
  return null;
}
