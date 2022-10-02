import '../../css/main.css';
import React from 'react';
import ReactDOM from 'react-dom/client';

import { App } from './App';
import { Contexts } from './Contexts';

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
const container =
  Array.from(
    document.querySelectorAll('header div[aria-label][role="button"]')
  ).find((item) => item.querySelector('i')?.textContent === 'search')
    ?.parentElement?.parentElement ?? undefined;
if (typeof container === 'object') startApp(container).catch(console.error);
else console.error('Failed to attach Calendar Plus plugin');

async function startApp(container: Element) {
  const reactContainer = document.createElement('div');
  container.prepend(reactContainer);

  const root = ReactDOM.createRoot(reactContainer);
  root.render(
    <React.StrictMode>
      <Contexts>
        <App />
      </Contexts>
    </React.StrictMode>
  );
}
