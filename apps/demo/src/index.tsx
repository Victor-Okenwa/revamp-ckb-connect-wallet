import React from 'react';
import ReactDOM from 'react-dom/client';
import { ccc } from '@ckb-ccc/connector-react';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { ConnectWalletKitProvider } from 'ckb-connect-wallet-kit';

const isMainnet = import.meta.env.VITE_IS_MAINNET === "true";
const defaultClient = isMainnet
  ? new ccc.ClientPublicMainnet()
  : new ccc.ClientPublicTestnet();

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <ccc.Provider
      defaultClient={defaultClient}
      clientOptions={[
        { name: "CKB Testnet", client: new ccc.ClientPublicTestnet() },
        { name: "CKB Mainnet", client: new ccc.ClientPublicMainnet() },
      ]}
    >
      <ConnectWalletKitProvider>
        <App />
      </ConnectWalletKitProvider>
    </ccc.Provider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
