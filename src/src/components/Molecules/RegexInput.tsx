import { useValidation } from '../../hooks/useValidation';
import { Input } from '../Atoms';

/**
 * An input field for a regular expression with syntax validation
 */
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
          // User input - don't use strict mode
          // eslint-disable-next-line require-unicode-regexp
          new RegExp(value);
          setValidation('');
        } catch (error) {
          setValidation((error as Error).message);
        }
      }}
    />
  );
}
