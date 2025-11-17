import { useState } from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import { MintForm } from '@/components/MintForm';
import { TokenCreationForm } from '@/components/TokenCreationForm';
import { NetworkToggle } from '@/components/NetworkToggle';
import Hero, { ShaderBackground } from '@/components/ui/neural-network-hero';

function App() {
  const { connected } = useWallet();
  const [activeTab, setActiveTab] = useState<'create' | 'mint'>('create');

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden scroll-smooth">
      {/* Hero Section */}
      <Hero
        title="Token Launchpad on Solana"
        description="Create your own Token-2022 tokens with USDT branding or mint existing tokens. Full control, no intermediaries."
        badgeText="Token-22 Protocol"
        badgeLabel="New"
        ctaButtons={[
          { text: "Create Token", href: "#create", primary: true },
          { text: "Mint Tokens", href: "#mint", primary: false },
        ]}
        microDetails={["Secure", "Fast", "Decentralized"]}
      />

      {/* Main Content */}
      <section id="create" className="relative min-h-screen py-24 px-4 scroll-smooth overflow-hidden">
        <ShaderBackground className="" style={{ opacity: 0.5 }} />
        <div className="container mx-auto max-w-7xl relative z-10">
          {/* Header */}
          <header className="mb-12 text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <svg className="w-8 h-8 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
              </svg>
              <h2 className="text-4xl font-extralight tracking-tight text-white">
                Token Launchpad
              </h2>
            </div>
            <div className="flex items-center justify-center gap-4 mb-6 flex-wrap">
              <NetworkToggle />
              <WalletMultiButton />
            </div>
            
            {/* Tab Navigation */}
            <div className="flex items-center justify-center gap-2 mb-6">
              <button
                onClick={() => setActiveTab('create')}
                className={`px-6 py-2 rounded-xl border transition-colors font-light ${
                  activeTab === 'create'
                    ? 'bg-white/10 border-white/30 text-white'
                    : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                }`}
              >
                Create Token
              </button>
              <button
                onClick={() => setActiveTab('mint')}
                className={`px-6 py-2 rounded-xl border transition-colors font-light ${
                  activeTab === 'mint'
                    ? 'bg-white/10 border-white/30 text-white'
                    : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                }`}
              >
                Mint Tokens
              </button>
            </div>

            <p className="text-white/60 text-lg max-w-2xl mx-auto font-light">
              {activeTab === 'create'
                ? (connected 
                    ? 'Create your own Token-2022 token with USDT branding. You pay fees and sign transactions.'
                    : 'Connect your Solana wallet to create tokens')
                : (connected 
                    ? 'Enter the mint authority address and amount to mint tokens'
                    : 'Connect your Solana wallet to start minting tokens')}
            </p>
          </header>

          {/* Forms */}
          {connected ? (
            activeTab === 'create' ? (
              <TokenCreationForm />
            ) : (
              <MintForm />
            )
          ) : (
            <div className="max-w-md mx-auto mt-16">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center backdrop-blur-sm">
                <div className="mb-6 flex justify-center">
                  <svg className="w-16 h-16 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-light mb-2 text-white tracking-tight">Connect Your Wallet</h3>
                <p className="text-white/60 mb-6 font-light">
                  Please connect your Solana wallet to continue
                </p>
                <div className="flex justify-center">
                  <WalletMultiButton />
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative mt-16 text-center text-white/40 text-sm py-8 border-t border-white/10">
        <div className="container mx-auto max-w-7xl px-4">
          <p className="font-light">Built on Solana Token-22 Program</p>
        </div>
      </footer>
    </div>
  );
}

export default App;

