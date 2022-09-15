import './css/main.css';

import React from 'react';
import ReactDOM from 'react-dom/client';

import {App} from './components';
import {Contexts} from './components/Core/Contexts';

const container = document.querySelector('header div[aria-label="Search"]')?.parentElement?.parentElement ?? undefined;
console.log({container});
if(typeof container === 'object'){
  const reactContainer = document.createElement('div');
  container.prepend(reactContainer);
  const root = ReactDOM.createRoot(reactContainer);
  root.render(
    <React.StrictMode>
      <Contexts>
        <App/>
      </Contexts>
    </React.StrictMode>
  );
}
else
  console.error('Failed to attach plugin');

