import '../../css/main.css';
import React from 'react';
import ReactDOM from 'react-dom/client';

import { App } from './App';
import { Contexts } from '../Contexts/Contexts';
import { output } from '../Errors/exceptions';

/**
 * Find a place where to mount our app. To make extension resilient to Google
 * Calendar DOM changes, we need to find the element using semantic selectors
 * like header and aria-label.
 * Currently, the selector finds the search button in the header, and selects
 * one of the parent containers of that button.
 *
 * Can't look for the search button by [aria-label] attribute, as that attribute
 * is localizable (has different value depending on user's language).
 */
const icon = Array.from(document.querySelectorAll('header i')).find(
  (icon) => icon?.textContent === 'search',
);
// Find an element that contains more that one icon
const findContainer = (element: Element | undefined): Element | undefined =>
  element === undefined
    ? undefined
    : element.querySelectorAll('i').length > 1
      ? element
      : findContainer(element.parentElement ?? undefined);
const container = findContainer(icon);
if (typeof container === 'object') {
  const reactContainer = document.createElement('div');
  reactContainer.id = 'calendar-plus';
  container.prepend(reactContainer);

  const root = ReactDOM.createRoot(reactContainer);
  root.render(
    <React.StrictMode>
      <Contexts>
        <App />
      </Contexts>
    </React.StrictMode>,
  );
} else output.error('Failed to attach Calendar Plus plugin');
