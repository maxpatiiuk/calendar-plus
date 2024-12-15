/**
 * On November 27, 2024 Google Calendar added light/dark mode switch.
 * The easiest way for Calendar Plus to detect current theme is based on the
 * value of the meta[name="theme-color"] tag in the <head>:
 *
 * ```html
 * <!-- Light -->
 * <meta name="theme-color" content="#F8FAFD">
 * <!-- OR Dark -->
 * <meta name="theme-color" content="#1B1B1B">
 * ```
 */

import React from 'react';

import { useAsyncState } from '../../hooks/useAsyncState';
import { useStorage } from '../../hooks/useStorage';
import { awaitElement } from './CalendarsContext';
import { output } from '../Errors/exceptions';

export function ThemeDetector(): null {
  const [_theme, setTheme] = useStorage('theme');

  useAsyncState(
    React.useCallback(async () => {
      const element = await awaitElement(
        () => document.querySelector('meta[name="theme-color"]') ?? undefined,
      );
      if (element === undefined) {
        output.error('Failed to find the meta[name="theme-color"] element');
        return;
      }
      const themeElement = element;

      function detectTheme() {
        const newTheme = themeElement.getAttribute('content');
        const isLight = newTheme?.toLowerCase() === lightThemeSignal;
        const isDark = newTheme?.toLowerCase() === darkThemeSignal;
        if (isLight) setTheme('light');
        else if (isDark) setTheme('dark');
        else {
          output.error('Unknown theme color', { newTheme, themeElement });
          return;
        }

        document.body.classList.toggle('calendar-plus-dark', isDark);
      }

      const observer = new MutationObserver(detectTheme);
      detectTheme();
      observer.observe(themeElement, {
        attributes: true,
        attributeFilter: ['content'],
      });
      return (): void => observer.disconnect();
    }, [setTheme]),
    false,
  );

  return null;
}

const lightThemeSignal = '#f8fafd';
const darkThemeSignal = '#1b1b1b';
