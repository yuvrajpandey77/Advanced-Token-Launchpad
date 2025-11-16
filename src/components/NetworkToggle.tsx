import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { useNetwork } from '@/lib/wallet';

export const NetworkToggle = () => {
  const { network, setNetwork } = useNetwork();

  const toggleNetwork = () => {
    setNetwork(
      network === WalletAdapterNetwork.Mainnet
        ? WalletAdapterNetwork.Devnet
        : WalletAdapterNetwork.Mainnet
    );
  };

  return (
    <button
      onClick={toggleNetwork}
      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-sm hover:bg-white/10 transition-colors duration-200"
    >
      <span className="text-xs font-light tracking-tight text-white/80">
        {network === WalletAdapterNetwork.Mainnet ? 'Mainnet' : 'Devnet'}
      </span>
      <div className={`relative w-10 h-5 rounded-full transition-colors duration-200 border border-white/10 ${
        network === WalletAdapterNetwork.Mainnet ? 'bg-white/20' : 'bg-white/10'
      }`}>
        <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
          network === WalletAdapterNetwork.Mainnet ? 'translate-x-5' : 'translate-x-0'
        }`} />
      </div>
    </button>
  );
};

