import React from 'react';
import ReactDOM from 'react-dom/client';
import './assets/scss/main.scss';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './redux/app/store'
import Toaster from './components/UI_Primitives/toast/Toaster'
import Dialog from './components/UI_Primitives/dialog/Dialog';
import Modal from './components/UI_Primitives/modal/Modal';



const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <BrowserRouter>
          <App />
          <Toaster />
          <Dialog />
          <Modal />
        </BrowserRouter>
      </PersistGate>
    </Provider>
  </React.StrictMode>
);

