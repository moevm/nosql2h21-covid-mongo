import React from 'react';
import ReactDOM from 'react-dom';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';

import App from 'App';
import store from 'store';

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </LocalizationProvider>
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);
