import { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { useMintToken } from '@/services/mint';
import { PublicKey } from '@solana/web3.js';
import { useNetwork } from '@/lib/wallet';
import { getMint, TOKEN_2022_PROGRAM_ID } from '@solana/spl-token';

export const MintForm = () => {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const { network } = useNetwork();
  const { mintToken } = useMintToken();
  const [mintAddress, setMintAddress] = useState<string>('');
  const [recipientAddress, setRecipientAddress] = useState<string>('');
  const [amount, setAmount] = useState<string>('100');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; signature?: string } | null>(null);
  const [actualMintAuthority, setActualMintAuthority] = useState<string | null>(null);
  const [fetchingMintInfo, setFetchingMintInfo] = useState(false);
  const [tokenName, setTokenName] = useState<string>('');
  const [tokenSymbol, setTokenSymbol] = useState<string>('');
  const [recentTokens, setRecentTokens] = useState<Array<{mintAddress: string; name: string; symbol: string; timestamp: number}>>([]);

  // Auto-fill recipient with connected wallet address
  useEffect(() => {
    if (publicKey && !recipientAddress) {
      setRecipientAddress(publicKey.toBase58());
    }
  }, [publicKey, recipientAddress]);

  // Load recent tokens from localStorage
  const loadRecentTokens = () => {
    try {
      const createdTokens = JSON.parse(localStorage.getItem('createdTokens') || '[]');
      setRecentTokens(createdTokens);
      // Auto-fill with most recent token if mint address is empty
      if (createdTokens.length > 0 && !mintAddress) {
        const mostRecent = createdTokens[0];
        setMintAddress(mostRecent.mintAddress);
        if (mostRecent.name) setTokenName(mostRecent.name);
        if (mostRecent.symbol) setTokenSymbol(mostRecent.symbol);
      }
    } catch (error) {
      console.error('Failed to load created tokens:', error);
    }
  };

  // Load on mount and listen for token creation events
  useEffect(() => {
    loadRecentTokens();
    
    // Listen for custom event when a new token is created
    const handleTokenCreated = () => {
      loadRecentTokens();
    };
    
    // Listen for storage changes (cross-tab updates)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'createdTokens') {
        loadRecentTokens();
      }
    };
    
    window.addEventListener('tokenCreated', handleTokenCreated);
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('tokenCreated', handleTokenCreated);
      window.removeEventListener('storage', handleStorageChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  // Fetch mint info when mint address changes
  useEffect(() => {
    const fetchMintInfo = async () => {
      if (!mintAddress || !connection) {
        setActualMintAuthority(null);
        setTokenName('');
        setTokenSymbol('');
        return;
      }

      try {
        setFetchingMintInfo(true);
        let mintPublicKey: PublicKey;
        try {
          mintPublicKey = new PublicKey(mintAddress);
        } catch {
          setActualMintAuthority(null);
          setFetchingMintInfo(false);
          return;
        }

        const mintInfo = await getMint(connection, mintPublicKey, 'confirmed', TOKEN_2022_PROGRAM_ID);
        
        if (mintInfo.mintAuthority) {
          setActualMintAuthority(mintInfo.mintAuthority.toBase58());
        } else {
          setActualMintAuthority(null);
        }

        // Try to get token metadata if available
        // Note: This is a simplified version - full metadata parsing would be more complex
        setTokenName('');
        setTokenSymbol('');
      } catch (error) {
        console.error('Failed to fetch mint info:', error);
        setActualMintAuthority(null);
        setTokenName('');
        setTokenSymbol('');
      } finally {
        setFetchingMintInfo(false);
      }
    };

    fetchMintInfo();
  }, [mintAddress, connection]);

  const handleMint = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      if (!mintAddress) {
        setResult({ success: false, message: 'Please enter a mint address' });
        setLoading(false);
        return;
      }

      const mintAmount = parseFloat(amount);
      if (isNaN(mintAmount) || mintAmount <= 0) {
        setResult({ success: false, message: 'Please enter a valid amount' });
        setLoading(false);
        return;
      }

      // Validate recipient address if provided
      if (recipientAddress) {
        try {
          new PublicKey(recipientAddress);
        } catch {
          setResult({ success: false, message: 'Invalid recipient address' });
          setLoading(false);
          return;
        }
      }

      const mintResult = await mintToken({
        mintAddress,
        amount: mintAmount,
        recipientAddress: recipientAddress || undefined,
      });

      if (mintResult.success && mintResult.signature) {
        setResult({
          success: true,
          message: `Successfully minted ${amount} tokens${recipientAddress && recipientAddress !== publicKey?.toBase58() ? ` to ${recipientAddress.slice(0, 8)}...${recipientAddress.slice(-8)}` : ' to your wallet'}!`,
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
      <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-6">
          <svg className="w-6 h-6 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-2xl font-light text-white tracking-tight">Mint Tokens</h2>
        </div>

        {/* Info Banner */}
        <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
          <p className="text-sm text-white/80 font-light">
            Mint tokens from any token you created (where you are the mint authority). You can mint to yourself or any other wallet address.
          </p>
        </div>

        {/* Mint Authority Info - shown when mint address is entered */}
        {mintAddress && (
          <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <p className="text-sm text-white/60 font-light">Mint Authority</p>
            </div>
            {fetchingMintInfo ? (
              <div className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white/60" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-sm text-white/60 font-light">Checking mint authority...</p>
              </div>
            ) : actualMintAuthority ? (
              <div>
                <p className="font-mono text-sm break-all text-white mb-2">{actualMintAuthority}</p>
                {publicKey && actualMintAuthority === publicKey.toBase58() ? (
                  <p className="text-xs text-green-400 font-light mb-2">✓ You are the mint authority - you can mint tokens</p>
                ) : (
                  <p className="text-xs text-red-400 font-light">✗ You are not the mint authority for this token</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-white/60 font-light">No mint authority (minting disabled for this token)</p>
            )}
          </div>
        )}

        {/* Mint Form */}
        <form onSubmit={handleMint} className="space-y-6">
          <div>
            <label htmlFor="mintAddress" className="block text-sm font-light mb-2 text-white">
              Token Mint Address *
            </label>
            <div className="space-y-2">
              {recentTokens.length > 0 && (
                <div className="mb-2">
                  <label className="block text-xs text-white/60 font-light mb-1">Quick Select:</label>
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        const selectedToken = recentTokens.find(t => t.mintAddress === e.target.value);
                        if (selectedToken) {
                          setMintAddress(selectedToken.mintAddress);
                          setTokenName(selectedToken.name);
                          setTokenSymbol(selectedToken.symbol);
                        }
                      }
                    }}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm font-light focus:outline-none focus:ring-2 focus:ring-white/30"
                    disabled={loading}
                  >
                    <option value="">Select a recently created token...</option>
                    {recentTokens.map((token) => (
                      <option key={token.mintAddress} value={token.mintAddress}>
                        {token.name} ({token.symbol}) - {token.mintAddress.slice(0, 8)}...{token.mintAddress.slice(-8)}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <input
                id="mintAddress"
                type="text"
                value={mintAddress}
                onChange={(e) => setMintAddress(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/30 text-white placeholder:text-white/40 font-light transition-colors duration-200"
                placeholder="Enter token mint address"
                disabled={loading}
                required
              />
            </div>
            <p className="mt-2 text-sm text-white/60 font-light">
              The mint address of the token you want to mint. You must be the mint authority for this token.
            </p>
          </div>

          <div>
            <label htmlFor="recipientAddress" className="block text-sm font-light mb-2 text-white">
              Recipient Address
            </label>
            <input
              id="recipientAddress"
              type="text"
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/30 text-white placeholder:text-white/40 font-light transition-colors duration-200"
              placeholder="Enter recipient address (defaults to your wallet)"
              disabled={loading}
            />
            <p className="mt-2 text-sm text-white/60 font-light">
              The wallet address to receive the minted tokens. Leave empty to mint to your own wallet.
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
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/30 text-white placeholder:text-white/40 font-light transition-colors duration-200"
              placeholder="Enter amount"
              disabled={loading}
              required
            />
            <p className="mt-2 text-sm text-white/60 font-light">
              Enter the amount of tokens you want to mint
            </p>
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
                Minting...
              </span>
            ) : (
              'Mint Tokens'
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
                {result.signature && (
                  <a
                    href={`${explorerUrl}/tx/${result.signature}?cluster=${network}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 text-sm underline hover:no-underline inline-flex items-center gap-1 text-white/80 font-light"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    View Transaction: {result.signature.slice(0, 8)}...{result.signature.slice(-8)}
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

