import React from 'react';
import { Input } from '../Atoms';
import { MINUTES_IN_HOUR } from '../Atoms/Internationalization';
import { commonText } from '../../localization/common';

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
        min={0}
        step={1}
        max={maxHours}
        value={hours}
        required
        onValueChange={(hours): void =>
          handleChange(hours * MINUTES_IN_HOUR + minutes)
        }
        title={commonText('hours')}
        aria-label={commonText('hours')}
      />
      {':'}
      <Input.Number
        min={0}
        step={1}
        max={maxMinutes}
        value={minutes}
        required
        onValueChange={(minutes): void =>
          handleChange(hours * MINUTES_IN_HOUR + minutes)
        }
        title={commonText('minutes')}
        aria-label={commonText('minutes')}
      />
    </div>
  );
}
