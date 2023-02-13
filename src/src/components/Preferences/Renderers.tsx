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
            <option key={option.value} value={option.value}>
              {option.title ?? option.value}
            </option>
          );
        })}
      </Select>
    );
  };

export const rangePref = ({
  min,
  max,
  step,
}: {
  readonly min: number;
  readonly max: number;
  readonly step: number;
}) =>
  function RangePref({
    value,
    onChange: handleChange,
  }: Parameters<PreferenceRenderer<number>>[0]): JSX.Element {
    return (
      <Input.Generic
        className="p-0"
        max={max}
        min={min}
        step={step}
        type="range"
        value={value}
        onValueChange={(value) => handleChange(Number.parseInt(value))}
      />
    );
  };
