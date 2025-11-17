# 🚀 Advanced Token Launchpad

Create and mint Token-2022 tokens on Solana with a beautiful, lag-free UI.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yuvrajpandey77/Advanced-Token-Launchpad)

## ✨ Features

- 🪙 **Create Token-2022 Tokens** - Deploy SPL Token-2022 mints
- 💰 **Mint Tokens** - Mint tokens to any address
- 🔗 **Multi-Network** - Support for Devnet and Mainnet
- 🎨 **Beautiful UI** - Smooth, lag-free gradient design
- 📱 **Responsive** - Works on desktop and mobile
- ⚡ **Fast** - Optimized bundle with zero lag
- 🔐 **Secure** - Client-side only, you control your keys

## 🏗️ Tech Stack

- **React 18** + **TypeScript**
- **Vite** - Lightning-fast build tool
- **Solana Web3.js** - Blockchain interaction
- **SPL Token** - Token-2022 support
- **Wallet Adapter** - Multiple wallet support
- **Tailwind CSS** - Styling
- **GSAP** - Smooth animations

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- A Solana wallet (Phantom, Solflare, etc.)
- Some SOL for transaction fees

### Installation

```bash
# Clone the repository
git clone https://github.com/yuvrajpandey77/Advanced-Token-Launchpad.git
cd Advanced-Token-Launchpad

# Install dependencies
npm install

# Start development server
npm run dev:web
```

Visit `http://localhost:3000` 🎉

## 📦 Build & Deploy

### Local Production Build

```bash
npm run build:web
npm run preview:web
```

### Deploy to Vercel

#### Option 1: One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yuvrajpandey77/Advanced-Token-Launchpad)

#### Option 2: Manual Deployment

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Use these settings:
   - **Framework:** Other
   - **Build Command:** `npm run vercel-build`
   - **Output Directory:** `dist-web`
   - **Install Command:** `npm install`
4. Click "Deploy"

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

## 📖 Usage

### Creating a Token

1. Connect your Solana wallet
2. Switch to your desired network (Devnet/Mainnet)
3. Fill in token details:
   - Name (e.g., "My Token")
   - Symbol (e.g., "MTK")
   - Decimals (default: 9)
   - Initial Supply (optional)
   - Metadata URI
4. Click "Create Token"
5. Approve the transaction in your wallet
6. Save the mint address!

### Minting Tokens

1. Connect your wallet (must be the mint authority)
2. Go to "Mint Tokens" tab
3. Enter:
   - Mint address
   - Amount to mint
   - Recipient address (optional)
4. Click "Mint Tokens"
5. Approve the transaction

## 🛠️ CLI Tools

The project also includes CLI tools for advanced users:

```bash
# Create a new token
npm run create-token

# Initialize metadata for existing token
npm run initialize-metadata -- <mint-address> "Name" "Symbol" "https://uri"

# Mint tokens
npm run mint
```

## 📁 Project Structure

```
├── src/
│   ├── components/         # React components
│   │   ├── MintForm.tsx
│   │   ├── TokenCreationForm.tsx
│   │   └── ui/
│   ├── services/           # Business logic
│   │   ├── createToken.ts
│   │   └── mint.ts
│   ├── config/             # Configuration
│   ├── App.tsx             # Main app
│   └── main.tsx            # Entry point
├── dist-web/              # Build output
├── vercel.json            # Vercel config
├── vite.config.ts         # Vite config
└── package.json           # Dependencies
```

## 🔧 Configuration

### RPC Endpoints

Default public endpoints are used. For production, configure custom RPC URLs:

Create `.env` file:

```env
VITE_SOLANA_RPC_MAINNET=https://your-mainnet-rpc.com
VITE_SOLANA_RPC_DEVNET=https://your-devnet-rpc.com
```

### Network Selection

Users can toggle between Devnet and Mainnet using the network switch in the UI.

## 🎨 Performance Optimizations

- ✅ Removed heavy Three.js dependencies (-63 packages)
- ✅ Lightweight CSS gradients instead of WebGL shaders
- ✅ Code splitting and tree shaking
- ✅ Optimized animations with GSAP
- ✅ Fast Vite build process
- ✅ Production bundle < 1MB gzipped

## 🐛 Troubleshooting

### "Insufficient funds" Error
- Ensure you have enough SOL for transaction fees (≈0.01 SOL)

### "Not the mint authority" Error
- You must use the wallet that created the token to mint

### Wallet Won't Connect
- Refresh the page
- Check if wallet extension is installed
- Try a different wallet

### Build Fails on Vercel
- Check that `vercel.json` exists
- Verify output directory is `dist-web`
- Clear Vercel build cache

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE)

## 🔗 Links

- [Solana Documentation](https://docs.solana.com)
- [SPL Token Program](https://spl.solana.com/token)
- [Token-2022 Extensions](https://spl.solana.com/token-2022)

## 💡 Support

For issues and questions:
- Open an [Issue](https://github.com/yuvrajpandey77/Advanced-Token-Launchpad/issues)
- Check [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment help

---

Built with ❤️ on Solana
