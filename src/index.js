import React from 'react';
import './assets/scss/main.scss';
import App from './App';
import ReactDOM from 'react-dom/client';
import Toaster from './components/UI_Primitives/toast/Toaster'
import Dialog from './components/UI_Primitives/dialog/Dialog';
import Modal from './components/UI_Primitives/modal/Modal';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './redux/app/store'
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/react-query'



const root = ReactDOM.createRoot(document.getElementById('root'));



root.render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <App />
            <Toaster />
            <Dialog />
            <Modal />
          </BrowserRouter>
        </QueryClientProvider>
      </PersistGate>
    </Provider>
  </React.StrictMode>
);

window.__TANSTACK_QUERY_CLIENT__ = queryClient;
