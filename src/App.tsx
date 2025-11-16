import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import { MintForm } from '@/components/MintForm';
import { NetworkToggle } from '@/components/NetworkToggle';
import Hero from '@/components/ui/neural-network-hero';

function App() {
  const { connected } = useWallet();

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Hero Section */}
      <Hero
        title="Mint USDT on Solana"
        description="Connect your wallet and mint USDT tokens directly on Solana Token-22. No intermediaries, full control."
        badgeText="Token-22 Protocol"
        badgeLabel="New"
        ctaButtons={[
          { text: "Start Minting", href: "#mint", primary: true },
        ]}
        microDetails={["Secure", "Fast", "Decentralized"]}
      />

      {/* Main Content */}
      <section id="mint" className="relative min-h-screen py-24 px-4 bg-black">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <header className="mb-12 text-center">
            <div className="flex items-center justify-center gap-4 mb-6">
              <h2 className="text-4xl font-extralight tracking-tight text-white">
                USDT Mint Portal
              </h2>
            </div>
            <div className="flex items-center justify-center gap-4 mb-4 flex-wrap">
              <NetworkToggle />
              <WalletMultiButton />
            </div>
            <p className="text-white/60 text-lg max-w-2xl mx-auto font-light">
              {connected 
                ? 'Enter the mint authority address and amount to mint USDT tokens'
                : 'Connect your Solana wallet to start minting USDT tokens'}
            </p>
          </header>

          {/* Mint Form */}
          {connected ? (
            <MintForm />
          ) : (
            <div className="max-w-md mx-auto mt-16">
              <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center backdrop-blur-sm">
                <div className="text-6xl mb-4">🔐</div>
                <h3 className="text-2xl font-light mb-2 text-white">Connect Your Wallet</h3>
                <p className="text-white/60 mb-6 font-light">
                  Please connect your Solana wallet to continue
                </p>
                <WalletMultiButton />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-16 text-center text-white/40 text-sm py-8 border-t border-white/10">
        <p className="font-light">Built on Solana Token-22 Program</p>
      </footer>
    </div>
  );
}

export default App;

