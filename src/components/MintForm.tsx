import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { useMintUSDT } from '@/services/mint';
import { config } from '@/config';
import { PublicKey } from '@solana/web3.js';
import { useNetwork } from '@/lib/wallet';

export const MintForm = () => {
  const { publicKey } = useWallet();
  const { network } = useNetwork();
  const { mintUSDT } = useMintUSDT();
  const [amount, setAmount] = useState<string>('100');
  const [mintAuthority, setMintAuthority] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; signature?: string } | null>(null);

  const handleMint = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const mintAmount = parseFloat(amount);
      if (isNaN(mintAmount) || mintAmount <= 0) {
        setResult({ success: false, message: 'Please enter a valid amount' });
        setLoading(false);
        return;
      }

      if (!mintAuthority) {
        setResult({ success: false, message: 'Please enter mint authority address' });
        setLoading(false);
        return;
      }

      let mintAuthorityPubkey: PublicKey;
      try {
        mintAuthorityPubkey = new PublicKey(mintAuthority);
      } catch {
        setResult({ success: false, message: 'Invalid mint authority address' });
        setLoading(false);
        return;
      }

      const mintResult = await mintUSDT(mintAmount, mintAuthorityPubkey);

      if (mintResult.success && mintResult.signature) {
        setResult({
          success: true,
          message: 'Tokens minted successfully!',
          signature: mintResult.signature,
        });
        setAmount('100');
      } else {
        setResult({
          success: false,
          message: mintResult.error || 'Failed to mint tokens',
        });
      }
    } catch (error: unknown) {
      const err = error as Error;
      setResult({
        success: false,
        message: err.message || 'An unexpected error occurred',
      });
    } finally {
      setLoading(false);
    }
  };

  const explorerUrl = network === WalletAdapterNetwork.Mainnet 
    ? 'https://solscan.io' 
    : 'https://solscan.io';

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white/5 border border-white/10 rounded-xl p-8 backdrop-blur-sm">
        <h2 className="text-2xl font-light mb-6 text-white tracking-tight">Mint USDT</h2>

        {/* Wallet Info */}
        <div className="mb-6 p-4 bg-white/5 rounded-lg border border-white/10">
          <p className="text-sm text-white/60 mb-1 font-light">Connected Wallet</p>
          <p className="font-mono text-sm break-all text-white">{publicKey?.toBase58()}</p>
        </div>

        {/* Network Info */}
        <div className="mb-6 p-4 bg-white/5 rounded-lg border border-white/10">
          <p className="text-sm text-white/60 mb-1 font-light">Network</p>
          <p className="font-light text-white capitalize">{network}</p>
        </div>

        {/* Mint Address Info */}
        <div className="mb-6 p-4 bg-white/5 rounded-lg border border-white/10">
          <p className="text-sm text-white/60 mb-1 font-light">USDT Mint Address</p>
          <p className="font-mono text-sm break-all text-white">{config.USDT_MINT_ADDRESS}</p>
        </div>

        {/* Mint Form */}
        <form onSubmit={handleMint} className="space-y-6">
          <div>
            <label htmlFor="mintAuthority" className="block text-sm font-light mb-2 text-white">
              Mint Authority Address *
            </label>
            <input
              id="mintAuthority"
              type="text"
              value={mintAuthority}
              onChange={(e) => setMintAuthority(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/30 text-white placeholder:text-white/40 font-light"
              placeholder="Enter mint authority address"
              disabled={loading}
              required
            />
            <p className="mt-2 text-sm text-white/60 font-light">
              The address that has permission to mint tokens
            </p>
          </div>

          <div>
            <label htmlFor="amount" className="block text-sm font-light mb-2 text-white">
              Amount to Mint
            </label>
            <input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/30 text-white placeholder:text-white/40 font-light"
              placeholder="Enter amount"
              disabled={loading}
              required
            />
            <p className="mt-2 text-sm text-white/60 font-light">
              Enter the amount of USDT tokens you want to mint
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-6 bg-white/10 hover:bg-white/20 text-white font-light rounded-lg border border-white/10 backdrop-blur-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Minting...
              </span>
            ) : (
              'Mint USDT'
            )}
          </button>
        </form>

        {/* Result Message */}
        {result && (
          <div className={`mt-6 p-4 rounded-lg border ${
            result.success
              ? 'bg-white/5 border-white/20 text-white'
              : 'bg-white/5 border-white/20 text-white'
          }`}>
            <p className="font-light">{result.message}</p>
            {result.signature && (
              <a
                href={`${explorerUrl}/tx/${result.signature}?cluster=${network}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 text-sm underline hover:no-underline block break-all text-white/80 font-light"
              >
                View Transaction: {result.signature.slice(0, 8)}...{result.signature.slice(-8)}
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

