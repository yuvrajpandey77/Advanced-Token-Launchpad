import { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { useCreateToken, DEFAULT_USDT_METADATA } from '@/services/createToken';
import { useNetwork } from '@/lib/wallet';
import { PublicKey } from '@solana/web3.js';
import { getMint, TOKEN_2022_PROGRAM_ID } from '@solana/spl-token';

export const TokenCreationForm = () => {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const { network } = useNetwork();
  const { createToken } = useCreateToken();
  
  const [name, setName] = useState<string>(DEFAULT_USDT_METADATA.name);
  const [symbol, setSymbol] = useState<string>(DEFAULT_USDT_METADATA.symbol);
  const [description, setDescription] = useState<string>(DEFAULT_USDT_METADATA.description);
  const [imageUrl, setImageUrl] = useState<string>(DEFAULT_USDT_METADATA.image);
  const [decimals, setDecimals] = useState<string>('9');
  const [initialSupply, setInitialSupply] = useState<string>('1000');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; mintAddress?: string; signature?: string; metadataInitCommand?: string; metadataInitialized?: boolean; metadataError?: string } | null>(null);
  const [useDefaultMetadata, setUseDefaultMetadata] = useState(true);

  // Fetch USDT metadata from existing token if available
  useEffect(() => {
    const fetchUSDTMetadata = async () => {
      try {
        const usdtMint = new PublicKey('pXfZ6Hg2s78m1iSRVsdzos9TmfkqkQdv5MmQrr77ZQK');
        const mintInfo = await getMint(connection, usdtMint, 'confirmed', TOKEN_2022_PROGRAM_ID);
        // If we can fetch it, we could potentially get metadata, but for now use defaults
      } catch (error) {
        // Use defaults if fetch fails
      }
    };
    if (connection && useDefaultMetadata) {
      fetchUSDTMetadata();
    }
  }, [connection, useDefaultMetadata]);

  const handleUseDefaults = () => {
    setName(DEFAULT_USDT_METADATA.name);
    setSymbol(DEFAULT_USDT_METADATA.symbol);
    setDescription(DEFAULT_USDT_METADATA.description);
    setImageUrl(DEFAULT_USDT_METADATA.image);
    setUseDefaultMetadata(true);
  };

  const handleCreateToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      // Create metadata JSON
      const metadata = {
        name,
        symbol,
        description,
        image: imageUrl,
      };

      // In a real app, you'd upload this to IPFS or a CDN
      // For now, we'll create a data URI (or you can use a placeholder)
      const metadataUri = `data:application/json,${encodeURIComponent(JSON.stringify(metadata))}`;

      const decimalsNum = parseInt(decimals, 10);
      const initialSupplyNum = parseFloat(initialSupply);

      if (isNaN(decimalsNum) || decimalsNum < 0 || decimalsNum > 9) {
        setResult({ success: false, message: 'Decimals must be between 0 and 9' });
        setLoading(false);
        return;
      }

      if (isNaN(initialSupplyNum) || initialSupplyNum < 0) {
        setResult({ success: false, message: 'Initial supply must be a positive number' });
        setLoading(false);
        return;
      }

      const createResult = await createToken({
        name,
        symbol,
        uri: metadataUri,
        decimals: decimalsNum,
        initialSupply: initialSupplyNum,
      });

      if (createResult.success && createResult.mintAddress) {
        // Store the created mint address in localStorage for auto-fill
        const createdTokens = JSON.parse(localStorage.getItem('createdTokens') || '[]');
        createdTokens.unshift({
          mintAddress: createResult.mintAddress,
          name,
          symbol,
          timestamp: Date.now(),
        });
        // Keep only the last 10 created tokens
        localStorage.setItem('createdTokens', JSON.stringify(createdTokens.slice(0, 10)));
        
        // Dispatch custom event to notify other components
        window.dispatchEvent(new CustomEvent('tokenCreated'));

        const message = createResult.metadataInitialized
          ? 'Token created successfully with metadata! 🎉'
          : 'Token created successfully! Metadata initialization required.';
        
        setResult({
          success: true,
          message,
          mintAddress: createResult.mintAddress,
          signature: createResult.signature,
          metadataInitCommand: createResult.metadataInitCommand,
          metadataInitialized: createResult.metadataInitialized,
          metadataError: createResult.metadataError,
        });
        // Reset form
        if (!useDefaultMetadata) {
          setName('');
          setSymbol('');
          setDescription('');
          setImageUrl('');
        }
        setInitialSupply('1000');
      } else {
        setResult({
          success: false,
          message: createResult.error || 'Failed to create token',
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
      <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-6">
          <svg className="w-6 h-6 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
          </svg>
          <h2 className="text-2xl font-light text-white tracking-tight">Create Your Token</h2>
        </div>

        {/* Info Banner */}
        <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
          <p className="text-sm text-white/80 font-light mb-2">
            Create your own Token-2022 token with USDT branding. You'll pay transaction fees and sign with your wallet.
          </p>
          <p className="text-xs text-white/60 font-light">
            ✓ Token name, symbol, and logo will be automatically set. Your token will appear correctly in wallets!
          </p>
        </div>

        {/* Use Defaults Button */}
        <div className="mb-6">
          <button
            type="button"
            onClick={handleUseDefaults}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-sm text-white font-light transition-colors"
          >
            Use USDT Defaults
          </button>
        </div>

        <form onSubmit={handleCreateToken} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-light mb-2 text-white">
              Token Name *
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setUseDefaultMetadata(false);
              }}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/30 text-white placeholder:text-white/40 font-light transition-colors duration-200"
              placeholder="Tether USD"
              disabled={loading}
              required
            />
          </div>

          <div>
            <label htmlFor="symbol" className="block text-sm font-light mb-2 text-white">
              Token Symbol *
            </label>
            <input
              id="symbol"
              type="text"
              value={symbol}
              onChange={(e) => {
                setSymbol(e.target.value.toUpperCase());
                setUseDefaultMetadata(false);
              }}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/30 text-white placeholder:text-white/40 font-light transition-colors duration-200"
              placeholder="USDT"
              disabled={loading}
              required
              maxLength={10}
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-light mb-2 text-white">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setUseDefaultMetadata(false);
              }}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/30 text-white placeholder:text-white/40 font-light transition-colors duration-200 resize-none"
              placeholder="Token description..."
              rows={3}
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="imageUrl" className="block text-sm font-light mb-2 text-white">
              Image URL
            </label>
            <input
              id="imageUrl"
              type="url"
              value={imageUrl}
              onChange={(e) => {
                setImageUrl(e.target.value);
                setUseDefaultMetadata(false);
              }}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/30 text-white placeholder:text-white/40 font-light transition-colors duration-200"
              placeholder="https://..."
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="decimals" className="block text-sm font-light mb-2 text-white">
                Decimals *
              </label>
              <input
                id="decimals"
                type="number"
                min="0"
                max="9"
                value={decimals}
                onChange={(e) => setDecimals(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/30 text-white placeholder:text-white/40 font-light transition-colors duration-200"
                placeholder="9"
                disabled={loading}
                required
              />
            </div>

            <div>
              <label htmlFor="initialSupply" className="block text-sm font-light mb-2 text-white">
                Initial Supply
              </label>
              <input
                id="initialSupply"
                type="number"
                step="0.01"
                min="0"
                value={initialSupply}
                onChange={(e) => setInitialSupply(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/30 text-white placeholder:text-white/40 font-light transition-colors duration-200"
                placeholder="1000"
                disabled={loading}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl border border-white/10 px-5 py-3 text-sm font-light tracking-tight transition-colors focus:outline-none focus:ring-2 focus:ring-white/30 duration-300 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Token...
              </span>
            ) : (
              'Create Token'
            )}
          </button>
        </form>

        {/* Result Message */}
        {result && (
          <div className={`mt-6 p-4 rounded-xl border ${
            result.success
              ? 'bg-green-500/10 border-green-500/30 text-white'
              : 'bg-red-500/10 border-red-500/30 text-white'
          }`}>
            <div className="flex items-start gap-3">
              {result.success ? (
                <svg className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              <div className="flex-1">
                <p className="font-light">{result.message}</p>
                {result.mintAddress && (
                  <div className="mt-2 space-y-2">
                    <p className="text-xs text-white/60 font-mono break-all">
                      Mint Address: {result.mintAddress}
                    </p>
                    {result.signature && (
                      <a
                        href={`${explorerUrl}/tx/${result.signature}?cluster=${network}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs underline hover:no-underline inline-flex items-center gap-1 text-white/80 font-light"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        View Transaction
                      </a>
                    )}
                    {result.metadataInitialized ? (
                      <div className="mt-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                        <p className="text-xs text-green-300 font-semibold mb-2">✅ Metadata Initialized!</p>
                        <p className="text-xs text-white/80">
                          Your token metadata has been successfully initialized. The token should now display correctly in wallets!
                        </p>
                      </div>
                    ) : result.metadataInitCommand && (
                      <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                        <p className="text-xs text-yellow-300 font-semibold mb-2">⚠️ Initialize Metadata:</p>
                        {result.metadataError && (
                          <p className="text-xs text-red-300 mb-2">Error: {result.metadataError}</p>
                        )}
                        <p className="text-xs text-white/80 font-mono break-all bg-black/20 p-2 rounded">
                          {result.metadataInitCommand}
                        </p>
                        <p className="text-xs text-white/60 mt-2">
                          Copy and run this command in your terminal to initialize metadata for your token.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

