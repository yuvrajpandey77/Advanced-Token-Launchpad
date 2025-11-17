import React, { useMemo, useState, createContext, useContext, useEffect, useRef } from 'react';
import { ConnectionProvider, WalletProvider, useWallet } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { config } from '@/config.ts';

// Import wallet adapter CSS
import '@solana/wallet-adapter-react-ui/styles.css';

interface NetworkContextType {
  network: WalletAdapterNetwork;
  setNetwork: (network: WalletAdapterNetwork) => void;
  rpcUrl: string;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export const useNetwork = () => {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error('useNetwork must be used within NetworkProvider');
  }
  return context;
};

// Component to handle wallet disconnection on network change
const WalletNetworkHandler: React.FC<{ children: React.ReactNode; network: WalletAdapterNetwork }> = ({ children, network }) => {
  const { disconnect, connected } = useWallet();
  const prevNetworkRef = useRef(network);

  useEffect(() => {
    // Only disconnect if network actually changed and wallet is connected
    if (prevNetworkRef.current !== network && connected) {
      disconnect().catch(() => {
        // Ignore errors if wallet is already disconnected
      });
    }
    prevNetworkRef.current = network;
  }, [network, connected, disconnect]);

  return <>{children}</>;
};

interface WalletContextProviderProps {
  children: React.ReactNode;
}

export const WalletContextProvider: React.FC<WalletContextProviderProps> = ({ children }) => {
  const [network, setNetwork] = useState<WalletAdapterNetwork>(WalletAdapterNetwork.Devnet);
  
  const rpcUrl = useMemo(() => {
    return network === WalletAdapterNetwork.Mainnet
      ? config.RPC_URL_MAINNET
      : config.RPC_URL_DEVNET;
  }, [network]);

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new TorusWalletAdapter(),
    ],
    []
  );

  const networkValue = useMemo(
    () => ({ network, setNetwork, rpcUrl }),
    [network, rpcUrl]
  );

  return (
    <NetworkContext.Provider value={networkValue}>
      <ConnectionProvider endpoint={rpcUrl}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            <WalletNetworkHandler network={network}>
              {children}
            </WalletNetworkHandler>
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </NetworkContext.Provider>
  );
};

