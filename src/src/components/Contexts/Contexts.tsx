import React from 'react';

import { useBooleanState } from '../../hooks/useBooleanState';
import { commonText } from '../../localization/common';
import type { RA } from '../../utils/types';
import { ErrorBoundary } from '../Errors/ErrorBoundary';
import { PreferencesProvider } from '../Preferences/Context';
import { AuthenticationProvider } from './AuthContext';
import { CalendarsSpy } from './CalendarsContext';
import { TrackCurrentView } from './CurrentViewContext';
import { SettingsProvider } from './SettingsContext';
import { VersionsContextProvider } from './VersionsContext';
import { output } from '../Errors/exceptions';

/**
 * Provide contexts used by other components
 *
 * It is best practice to use context as little as possible, as they make
 * components more dependent on their parents.
 *
 * Thus, contexts were used only when necessary, and defined as higher up
 * the tree as possible, so that code refactoring does not lead to a
 * situation where context is accessed before it is defined.
 *
 * Defining contexts very high also allows the top ErrorBoundary to have
 * access to them.
 */
export function Contexts({
  children,
}: {
  readonly children: React.ReactNode;
}): JSX.Element {
  // Loading Context
  const holders = React.useRef<RA<number>>([]);
  const [isLoading, handleLoading, handleLoaded] = useBooleanState();
  const loadingHandler = React.useCallback(
    (promise: Promise<unknown>): void => {
      const holderId = holders.current.length;
      holders.current = [...holders.current, holderId];
      handleLoading();
      promise
        .finally(() => {
          holders.current = holders.current.filter((item) => item !== holderId);
          if (holders.current.length === 0) handleLoaded();
        })
        .catch(output.error);
    },
    [handleLoading, handleLoaded],
  );

  return (
    <ErrorBoundary>
      <LoadingContext.Provider key="loadingContext" value={loadingHandler}>
        {/* FEATURE: replace this with a toast, dialog, or status line*/}
        {isLoading && commonText('loading')}
        <React.Suspense fallback={<>{commonText('loading')}</>}>
          <PreferencesProvider>
            <AuthenticationProvider>
              <SettingsProvider>
                <TrackCurrentView>
                  <VersionsContextProvider>
                    <CalendarsSpy>{children}</CalendarsSpy>
                  </VersionsContextProvider>
                </TrackCurrentView>
              </SettingsProvider>
            </AuthenticationProvider>
          </PreferencesProvider>
        </React.Suspense>
      </LoadingContext.Provider>
    </ErrorBoundary>
  );
}

/**
 * Display a modal loading dialog while promise is resolving.
 * Also, catch and handle erros if promise is rejected.
 * If multiple promises are resolving at the same time, the dialog is
 * visible until all promises are resolved.
 * This prevents having more than one loading dialog visible at the same time.
 */
export const LoadingContext = React.createContext<
  (promise: Promise<unknown>) => void
>(() => output.throw('Loading context not yet defined'));
LoadingContext.displayName = 'LoadingContext';
