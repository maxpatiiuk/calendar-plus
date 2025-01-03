/**
 * Wrappers arround HTML elements with some styling applied
 */

import React from 'react';

import type { IconProps } from './Icon';
import { icons } from './Icon';
import type { TagProps } from './wrapper';
import { wrap } from './wrapper';

export const H2 = wrap('H2', 'h2', 'm-0 flex items-center gap-2');
export const H3 = wrap('H3', 'h3', 'm-0 flex items-center gap-2');

/**
 * Make button match Google Calendar's styling
 */

const button = (name: string, classList: string) =>
  wrap<
    'button',
    {
      readonly onClick:
        | ((event: React.MouseEvent<HTMLButtonElement>) => void)
        | undefined;
    }
  >(
    name,
    'button',
    `${className.googleButton} ${classList}`,
    ({ onClick: handleClick, disabled = false, ...props }) => ({
      type: 'button' as const,
      onClick: handleClick,
      disabled: disabled || handleClick === undefined,
      ...props,
    }),
  );

export const className = {
  googleButton:
    'border border-solid p-2 rounded-xl flex items-center gap-2 cursor-pointer duration-100 text-[#202020] dark:text-[#e3e3e3]',
  buttonDefault: `bg-[#f8fafd] dark:bg-[#1c1c1c] border-[#747775]
    dark:border-[#8e918f] active:bg-[#d7d8db] dark:active:bg-[#444444] [&[aria-pressed]]:bg-[#d7d8db] [&[aria-pressed]]:dark:bg-[#444444]
    hover:bg-[#e9eaee] hover:dark:bg-[#303030]`,
};

export const Ul = wrap('Ul', 'ul', 'list-none p-0 m-0 flex flex-col gap-2', {
  role: 'list',
});

export const Button = {
  Default: button('Button.Default', className.buttonDefault),
  Blue: button(
    'Button.Blue',
    `border-blue-600 bg-blue-600 hover:bg-blue-700 active:bg-blue-500 text-white`,
  ),
  Red: button(
    'Button.Blue',
    `border-red-600 bg-red-600 hover:bg-red-700 active:bg-red-500 text-white`,
  ),
  Icon: wrap<
    'button',
    IconProps & {
      readonly onClick:
        | ((event: React.MouseEvent<HTMLButtonElement>) => void)
        | undefined;
    }
  >(
    'Button.Icon',
    'button',
    `calendar-plus-icon rounded`,
    ({ icon, ...props }) => ({
      ...props,
      'aria-label': props['aria-label'] ?? props.title,
      type: 'button',
      children: icons[icon],
    }),
  ),
};

export const Link = {
  LikeButton: wrap(
    'Link.White',
    'a',
    `${className.googleButton} ${className.buttonDefault}`,
  ),
  Default: wrap(
    'Link.Default',
    'a',
    '!text-blue-500 dark:!text-blue-300 hover:underline hover:!text-blue-600 dark:hover:!text-blue-500',
  ),
};

export const Label = {
  Block: wrap('Label.Block', 'label', 'flex flex-col'),
};

export const Input = {
  Number({
    isReadOnly,
    className: classList,
    value,
    onValueChange: handleValueChange,
    width = 'w-full',
    ...props
  }: Omit<TagProps<'input'>, 'children' | 'readOnly' | 'type'> & {
    readonly isReadOnly?: boolean;
    readonly onValueChange?: (value: number) => void;
    readonly width?: string;
  }): JSX.Element {
    const [hasValue, setHasValue] = React.useState(true);
    React.useEffect(() => setHasValue(true), [value]);
    return (
      <input
        {...props}
        className={`${width} ${className.googleButton} ${classList ?? ''}`}
        readOnly={isReadOnly}
        type="number"
        value={hasValue ? value : ''}
        onChange={(event): void => {
          const rawHumber = Number.parseInt(
            (event.target as HTMLInputElement).value,
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
    `rounded-xs m-0 w-4 h-4`,
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
    }),
  ),
  Text: wrap<
    'input',
    {
      readonly onValueChange?: (value: string) => void;
      readonly type?: 'If you need to specify type, use Input.Generic';
      readonly readOnly?: never;
      readonly isReadOnly?: boolean;
      readonly children?: undefined;
    }
  >(
    'Input.Text',
    'input',
    `w-full ${className.googleButton}`,
    ({ onValueChange, isReadOnly, ...props }) => ({
      ...props,
      type: 'text',
      onChange(event): void {
        onValueChange?.((event.target as HTMLInputElement).value);
        props.onChange?.(event);
      },
      readOnly: isReadOnly,
    }),
  ),
  Generic: wrap<
    'input',
    {
      readonly onValueChange?: (value: string) => void;
      readonly readOnly?: never;
      readonly isReadOnly?: boolean;
      readonly children?: undefined;
    }
  >(
    'Input.Generic',
    'input',
    `w-full ${className.googleButton}`,
    ({ onValueChange, isReadOnly, ...props }) => ({
      ...props,
      onChange(event): void {
        onValueChange?.((event.target as HTMLInputElement).value);
        props.onChange?.(event);
      },
      readOnly: isReadOnly,
    }),
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
  `w-full pr-5 bg-right ${className.googleButton}`,
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
  }),
);

export const Widget = wrap(
  'Widget',
  'section',
  'flex flex-col gap-2 rounded bg-white dark:bg-neutral-800',
);

export const Key = wrap(
  'Key',
  'kbd',
  'bg-gray-200 border-1 dark:border-none dark:bg-neutral-700 rounded-sm mx-1 p-0.5 text-xl',
);
