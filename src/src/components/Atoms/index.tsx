import { wrap } from './wrapper';

export const H2 = wrap('H2', 'h2', 'm-0 flex items-center gap-2');

export const Button = {
  White: wrap(
    'Button.White',
    'button',
    /**
     * Make button match Google Calendar's styling
     */
    `border border-solid border-[#dadce0] p-2 rounded flex
      items-center gap-2 cursor-pointer bg-white hover:bg-gray-100
      active:bg-[#dadce0]`,
    {
      type: 'button',
    }
  ),
};
