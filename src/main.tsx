import React from 'react';
import ReactDOM from 'react-dom/client';
import { WalletContextProvider } from '@/lib/wallet';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WalletContextProvider>
      <App />
    </WalletContextProvider>
  </React.StrictMode>
);

