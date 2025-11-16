# Frontend Setup Guide

This project now includes a beautiful dark-themed web UI for minting USDT tokens on Solana Token-22.

## Features

- 🎨 **Beautiful Dark Theme UI** with neural network hero animation
- 🔌 **Wallet Integration** - Connect with Phantom, Solflare, or Torus wallets
- 🌐 **Network Toggle** - Switch between Mainnet and Devnet
- 💰 **Direct Minting** - Users can mint USDT tokens themselves
- ⚡ **Fast & Modern** - Built with Vite, React, and TypeScript

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

## Installation

1. Install all dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

3. Update `.env` with your USDT mint address:
```env
VITE_USDT_MINT_ADDRESS=your_mint_address_here
VITE_RPC_URL_DEVNET=https://api.devnet.solana.com
VITE_RPC_URL_MAINNET=https://api.mainnet-beta.solana.com
```

## Running the Development Server

```bash
npm run dev:web
```

The app will be available at `http://localhost:3000`

## Building for Production

```bash
npm run build:web
```

The built files will be in the `dist-web` directory.

## Project Structure

```
src/
├── components/
│   ├── ui/
│   │   └── neural-network-hero.tsx  # Animated hero component
│   ├── MintForm.tsx                   # Minting form component
│   └── NetworkToggle.tsx             # Network switcher
├── lib/
│   └── wallet.tsx                    # Wallet adapter setup
├── services/
│   └── mint.ts                       # Minting service
├── config.ts                         # Configuration
├── App.tsx                           # Main app component
├── main.tsx                          # Entry point
└── index.css                         # Global styles
```

## Usage

1. **Start the development server**: `npm run dev:web`
2. **Connect your wallet**: Click the "Select Wallet" button
3. **Choose network**: Toggle between Mainnet and Devnet using the toggle button
4. **Enter mint authority**: Input the address that has permission to mint tokens
5. **Enter amount**: Specify how many USDT tokens to mint
6. **Mint**: Click "Mint USDT" and approve the transaction in your wallet

## Important Notes

- **Mint Authority**: You need to provide the mint authority address that has permission to mint tokens. This is typically the address that created the token.
- **Network**: Make sure you're on the correct network (Mainnet/Devnet) that matches your token.
- **Wallet**: Ensure your wallet is connected to the same network you've selected.

## Troubleshooting

### Wallet Connection Issues
- Make sure you have a Solana wallet extension installed (Phantom, Solflare, etc.)
- Check that your wallet is unlocked
- Try disconnecting and reconnecting

### Minting Fails
- Verify the mint authority address is correct
- Ensure you have sufficient SOL for transaction fees
- Check that the token mint address is correct for the selected network
- Verify the mint authority has permission to mint tokens

### Build Errors
- Make sure all dependencies are installed: `npm install`
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check Node.js version: `node --version` (should be 18+)

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_USDT_MINT_ADDRESS` | Your USDT token mint address | Required |
| `VITE_RPC_URL_DEVNET` | Devnet RPC endpoint | `https://api.devnet.solana.com` |
| `VITE_RPC_URL_MAINNET` | Mainnet RPC endpoint | `https://api.mainnet-beta.solana.com` |

## Technologies Used

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **@solana/wallet-adapter-react** - Wallet integration
- **@react-three/fiber** - 3D graphics (hero animation)
- **GSAP** - Animations
- **Three.js** - 3D rendering

## License

MIT

