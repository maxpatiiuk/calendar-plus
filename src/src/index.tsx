import './css/main.css';

import React from 'react';
import ReactDOM from 'react-dom/client';

import {App} from './components';
import {Contexts} from './components/Core/Contexts';

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <Contexts>
      <App/>
    </Contexts>
  </React.StrictMode>
);
