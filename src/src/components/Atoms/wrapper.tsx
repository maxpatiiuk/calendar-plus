import React from 'react';

import type { IR, RR } from '../../utils/types';

type HtmlTag = keyof React.JSX.IntrinsicElements;
type RawTagProps<TAG extends HtmlTag> = React.ComponentPropsWithRef<TAG>;

/**
 * Forbid using regular "ref" since it needs to be forwarded
 * React.forwardRef has some typing issues when used with generics:
 * https://stackoverflow.com/questions/58469229/react-with-typescript-generics-while-using-react-forwardref/58473012
 * Instead, provide ref as a forwardRef. This does not change the runtime
 * behaviour
 */
export type TagProps<TAG extends HtmlTag> = Omit<RawTagProps<TAG>, 'ref'> & {
  readonly ref?: 'Use "forwardRef" instead or "ref"';
  readonly forwardRef?: RawTagProps<TAG>['ref'];
};

export type HtmlElementFromTagName<TAG extends HtmlTag> =
  React.ComponentRef<TAG>;

/**
 * Add default className and props to common HTML elements in a type-safe way
 * Essentially function currying, but for React Components
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function wrap<
  TAG extends HtmlTag,
  /*
   * Allows to define extra props that should be passed to the wrapped component
   * For example, can make some optional props be required, forbid passing
   * children, or mutate extra props using mergeProps callback
   */
  EXTRA_PROPS extends IR<unknown> = RR<never, never>,
>(
  // Would be shown in React DevTools
  name: string,
  tagName: TAG,
  className: string,
  initialProps?:
    | TagProps<TAG>
    | ((props: Readonly<EXTRA_PROPS> & TagProps<TAG>) => TagProps<TAG>),
) {
  const wrapped = (
    props: Readonly<EXTRA_PROPS> & TagProps<TAG>,
  ): React.JSX.Element => {
    // Merge classNames
    const fullClassName =
      typeof props?.className === 'string'
        ? `${className} ${props.className}`
        : className;
    const {
      forwardRef,
      ref: _,
      ...mergedProps
    } = typeof initialProps === 'function'
      ? initialProps({ ...props, className: fullClassName })
      : { ...initialProps, ...props, className: fullClassName };
    /*
     * Using React.createElement rather than <tagName>, because the tag name is
     * dynamic, and that can only be done using React.createElement
     */
    return React.createElement(tagName, {
      ...mergedProps,
      ref: forwardRef,
    });
  };
  wrapped.displayName = name;
  return wrapped;
}
