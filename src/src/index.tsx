import './css/main.css';

import React from 'react';
import ReactDOM from 'react-dom/client';

import { App } from './components/App';
import { Contexts } from './components/Core/Contexts';

/**
 * Find a place where to mount our app. To make extension resilient to Google
 * Calendar DOM changes, we need to find the element using semantic selectors
 * like header and aria-label.
 * Currently, the selector finds the search button in the header, and selects
 * one of the parent containers of that button.
 */
const container =
  document.querySelector('header div[aria-label="Search"]')?.parentElement
    ?.parentElement ?? undefined;
if (typeof container === 'object') {
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
} else console.error('Failed to attach Calendar Plus plugin');
