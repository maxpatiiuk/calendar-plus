import React from 'react';
import { TagProps, wrap } from './wrapper';

export const H2 = wrap('H2', 'h2', 'm-0 flex items-center gap-2');
export const H3 = wrap('H2', 'h2', 'm-0 flex items-center gap-2');

/**
 * Make button match Google Calendar's styling
 */
const googleButton = `
  border border-solid p-2 rounded flex items-center gap-2 cursor-pointer
`;

export const Button = {
  White: wrap(
    'Button.White',
    'button',
    `${googleButton} bg-white border-[#dadce0] active:bg-[#dadce0]
      [&[aria-pressed]]:bg-[#dadce0] hover:bg-gray-100`,
    {
      type: 'button',
    }
  ),
  Blue: wrap(
    'Button.Blue',
    'button',
    `${googleButton} border-blue-600 bg-blue-600 hover:bg-blue-700 active:bg-blue-500 text-white`,
    {
      type: 'button',
    }
  ),
  Red: wrap(
    'Button.Blue',
    'button',
    `${googleButton} border-red-600 bg-red-600 hover:bg-red-700 active:bg-red-500 text-white`,
    {
      type: 'button',
    }
  ),
};

export const Label = {
  Block: wrap('Label.Block', 'label', 'flex flex-col'),
};

export const Input = {
  Number({
    isReadOnly,
    className,
    value,
    onValueChange: handleValueChange,
    ...props
  }: Omit<TagProps<'input'>, 'type' | 'readOnly' | 'children'> & {
    readonly isReadOnly?: boolean;
    readonly onValueChange?: (value: number) => void;
  }): JSX.Element {
    const [hasValue, setHasValue] = React.useState(true);
    React.useEffect(() => setHasValue(true), [value]);
    return (
      <input
        {...props}
        value={hasValue ? value : ''}
        className={`w-full ${googleButton} ${className ?? ''}`}
        type="number"
        readOnly={isReadOnly}
        onChange={(event): void => {
          const rawHumber = Number.parseInt(
            (event.target as HTMLInputElement).value
          );
          const number = Number.isNaN(rawHumber) ? undefined : rawHumber;
          if (number === undefined) setHasValue(false);
          else {
            if (!hasValue) setHasValue(true);
            handleValueChange?.(number);
          }

          props.onChange?.(event);
        }}
      />
    );
  },
  Checkbox: wrap<
    'input',
    {
      readonly onValueChange?: (isChecked: boolean) => void;
      readonly readOnly?: never;
      readonly isReadOnly?: boolean;
      readonly type?: never;
      readonly children?: undefined;
    }
  >(
    'Input.Checkbox',
    'input',
    `rounded-xs`,
    ({ onValueChange, isReadOnly, ...props }) => ({
      ...props,
      type: 'checkbox',
      onChange(event): void {
        // Disable onChange when readOnly
        if (props.disabled === true || isReadOnly === true) return;
        onValueChange?.((event.target as HTMLInputElement).checked);
        props.onChange?.(event);
      },
      readOnly: isReadOnly,
    })
  ),
};

export const Select = wrap<
  'select',
  {
    readonly onValueChange?: (value: string) => void;
  }
>(
  'Select',
  'select',
  `w-full pr-5 bg-right ${googleButton}`,
  ({ onValueChange: handleValueChange, ...props }) => ({
    ...props,
    onChange(event): void {
      const value = (event.target as HTMLSelectElement).value;

      /*
       * Workaround for Safari weirdness. See more:
       * https://github.com/specify/specify7/issues/1371#issuecomment-1115156978
       */
      if (typeof props.size !== 'number' || props.size < 2 || value !== '')
        handleValueChange?.(value);
      props.onChange?.(event);
    },
  })
);
