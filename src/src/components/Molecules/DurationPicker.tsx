import React from 'react';

import { commonText } from '../../localization/common';
import { Input } from '../Atoms';
import { MINUTES_IN_HOUR } from '../Atoms/Internationalization';

const maxMinutes = MINUTES_IN_HOUR - 1;

export function DurationPicker({
  value,
  onChange: handleChange,
  maxHours,
}: {
  readonly value: number;
  readonly onChange: (newValue: number) => void;
  readonly maxHours?: number;
}): JSX.Element {
  const hours = Math.floor(value / MINUTES_IN_HOUR);
  const minutes = value % MINUTES_IN_HOUR;
  return (
    <div className="flex items-center gap-1">
      <Input.Number
        aria-label={commonText('hours')}
        max={maxHours}
        min={0}
        required
        step={1}
        title={commonText('hours')}
        value={hours}
        className="no-arrows"
        width="w-9"
        onValueChange={(hours): void =>
          handleChange(hours * MINUTES_IN_HOUR + minutes)
        }
      />
      :
      <Input.Number
        aria-label={commonText('minutes')}
        className="no-arrows"
        max={maxMinutes}
        min={0}
        required
        step={1}
        title={commonText('minutes')}
        value={minutes}
        width="w-9"
        onValueChange={(minutes): void =>
          handleChange(hours * MINUTES_IN_HOUR + minutes)
        }
      />
    </div>
  );
}
