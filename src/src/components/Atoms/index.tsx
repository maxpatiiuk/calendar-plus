import { wrap } from './wrapper';

export const H2 = wrap('H2', 'h2', 'm-0 flex items-center gap-2');

/**
 * Make button match Google Calendar's styling
 */
const googleButton = `
  border border-solid p-2 rounded flex tems-center gap-2 cursor-pointer
`;

export const Button = {
  White: wrap(
    'Button.White',
    'button',
    `${googleButton} bg-white border-[#dadce0] active:bg-[#dadce0] hover:bg-gray-100`,
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
};

export const Label = {
  Block: wrap('Label.Block', 'label', 'flex flex-col'),
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
    onChange:
      typeof handleValueChange === 'function'
        ? (event): void => {
            const value = (event.target as HTMLSelectElement).value;

            /*
             * Workaround for Safari weirdness. See more:
             * https://github.com/specify/specify7/issues/1371#issuecomment-1115156978
             */
            if (
              typeof props.size !== 'number' ||
              props.size < 2 ||
              value !== ''
            )
              handleValueChange?.(value);
            props.onChange?.(event);
          }
        : undefined,
  })
);
