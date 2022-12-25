import React from 'react';

import { useValidation } from '../../hooks/useValidation';
import { Input } from '../Atoms';

export function RegexInput({
  value,
  onChange: handleChange,
}: {
  readonly value: string;
  readonly onChange: (value: string) => void;
}): JSX.Element {
  const { validationRef, setValidation } = useValidation();
  return (
    <Input.Text
      forwardRef={validationRef}
      placeholder="a*b+c?"
      required
      value={value}
      onValueChange={handleChange}
      onBlur={(): void => {
        try {
          new RegExp(value);
          setValidation('');
        } catch (error) {
          setValidation((error as Error).message);
        }
      }}
    />
  );
}
