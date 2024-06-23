/**
 * Error Boundary for React Components. Catches exceptions and provides a
 * stack trace
 *
 * @module
 */

import React from 'react';
import type { State } from 'typesafe-reducer';
import { output } from './exceptions';

type ErrorBoundaryState =
  | State<
      'Error',
      {
        readonly hasError: true;
        readonly error: Error;
        readonly errorInfo: { readonly componentStack: string };
      }
    >
  | State<'Main'>
  | State<'Silenced'>;

export class ErrorBoundary extends React.Component<
  {
    readonly children: React.ReactNode;
    /*
     * Can wrap a component in an <ErrorBoundary> with silentErrors
     * to silence all errors from it (on error, the component is quietly
     * deRendered), if in production
     * Useful for ensuring non-critical and experimental components don't
     * crash the whole application
     */
    readonly silentErrors?: boolean;
    readonly dismissable?: boolean;
  },
  ErrorBoundaryState
> {
  public readonly state: ErrorBoundaryState = {
    type: 'Main',
  };

  public componentDidCatch(
    error: Error,
    errorInfo: { readonly componentStack: string },
  ): void {
    output.error(error.toString());
    this.setState({
      type: 'Error',
      error,
      errorInfo,
    });
  }

  public render(): React.ReactNode {
    if (
      (this.state.type === 'Error' &&
        this.props.silentErrors === true &&
        process.env.NODE_ENV !== 'development') ||
      this.state.type === 'Silenced'
    )
      return null;
    else
      return this.state.type === 'Error' ? (
        <pre>
          Unexpected error has occurred
          <br />
          {this.state.error?.toString()}
          <br />
          <pre>{this.state.errorInfo.componentStack}</pre>
        </pre>
      ) : (
        this.props.children ?? null
      );
  }
}
