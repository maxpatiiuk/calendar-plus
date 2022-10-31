import React from 'react';

import type { RA } from '../../utils/types';
import { Input, Select } from '../Atoms';
import type { PreferenceRenderer } from './definitions';

export const BooleanPref: PreferenceRenderer<boolean> = ({
  value,
  onChange: handleChange,
}): JSX.Element => (
  <span>
    <Input.Checkbox checked={value} onValueChange={handleChange} />
  </span>
);

export const pickListPref = <T extends string>(
  options:
    | RA<{
        readonly value: T;
        readonly title?: string;
      }>
    | RA<T>
) =>
  function PickListPref({
    value,
    onChange: handleChange,
  }: Parameters<PreferenceRenderer<T>>[0]): JSX.Element {
    return (
      <Select
        value={value}
        onValueChange={(value): void => handleChange(value as T)}
      >
        {options.map((rawOption) => {
          const option =
            typeof rawOption === 'string' ? { value: rawOption } : rawOption;
          return (
            <option key={option.value}>{option.title ?? option.value}</option>
          );
        })}
      </Select>
    );
  };
