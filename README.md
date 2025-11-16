# Token-22 with Metadata

A comprehensive toolkit for creating Solana Token-22 tokens with metadata support.

## 🚀 Features

- Create Token-22 tokens with metadata enabled
- Initialize on-chain metadata
- Create Associated Token Accounts (ATA)
- Mint tokens
- Full TypeScript support
- CLI and programmatic interfaces

## 📋 Prerequisites

1. **Solana CLI Tools**: Install the Solana CLI and SPL Token CLI
   ```bash
   sh -c "$(curl -sSfL https://release.solana.com/stable/install)"
   export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
   
   # Install SPL Token CLI
   cargo install spl-token-cli
   ```

2. **Node.js**: Version 18 or higher

3. **Wallet**: A Solana wallet with some SOL for transaction fees

## 🛠️ Installation

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build
```

## ⚙️ Configuration

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Configure your environment variables:
   ```bash
   # Set your RPC endpoint
   RPC_URL=https://api.devnet.solana.com  # or mainnet-beta
   
   # Set your wallet (choose one):
   # Option 1: Private key as JSON array
   WALLET_PRIVATE_KEY=[123,45,67,...]
   
   # Option 2: Path to keypair file
   KEYPAIR_PATH=~/.config/solana/id.json
   ```

3. Set your Solana CLI config:
   ```bash
   solana config set --url devnet  # or mainnet-beta
   solana config set --keypair ~/.config/solana/id.json
   ```

## 📖 Usage

### Quick Start (All-in-One)

Create a token with metadata in one command:

```bash
npm run create-token -- \
  --name "100xx" \
  --symbol "100xxx" \
  --metadata-uri "https://cdn.100xdevs.com/metadata.json" \
  --amount 1000
```

### Step-by-Step

#### 1. Create Token with Metadata Enabled

```bash
spl-token --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb create-token --enable-metadata
```

This will output a mint address like: `pXfZ6Hg2s78m1iSRVsdzos9TmfkqkQdv5MmQrr77ZQK`

#### 2. Initialize Metadata

```bash
npm run initialize-metadata -- \
  pXfZ6Hg2s78m1iSRVsdzos9TmfkqkQdv5MmQrr77ZQK \
  "100xx" \
  "100xxx" \
  "https://cdn.100xdevs.com/metadata.json"
```

Or using CLI directly:
```bash
spl-token initialize-metadata \
  pXfZ6Hg2s78m1iSRVsdzos9TmfkqkQdv5MmQrr77ZQK \
  "100xx" \
  "100xxx" \
  "https://cdn.100xdevs.com/metadata.json"
```

#### 3. Create Associated Token Account (ATA)

```bash
npm run create-ata -- pXfZ6Hg2s78m1iSRVsdzos9TmfkqkQdv5MmQrr77ZQK
```

Or using CLI directly:
```bash
spl-token create-account pXfZ6Hg2s78m1iSRVsdzos9TmfkqkQdv5MmQrr77ZQK
```

#### 4. Mint Tokens

```bash
npm run mint -- pXfZ6Hg2s78m1iSRVsdzos9TmfkqkQdv5MmQrr77ZQK 1000
```

Or using CLI directly:
```bash
spl-token mint pXfZ6Hg2s78m1iSRVsdzos9TmfkqkQdv5MmQrr77ZQK 1000
```

## 📝 Metadata Format

The metadata JSON should follow this format:

```json
{
  "name": "Token x",
  "symbol": "Token x",
  "description": "This is an example fungible token for demonstration purposes.",
  "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSg600Xa4ws6jp54kMDNGYF232lIhY51QJqEA&s"
}
```

Example metadata URL: `https://cdn.100xdevs.com/metadata.json`

## 🔍 Verify Token

After minting, check your wallet to see the token with its metadata. The token should display:
- Name: "100xx"
- Symbol: "100xxx"
- Image from the metadata JSON
- Description

## 📚 Scripts

- `npm run create-token` - Create token with metadata (all-in-one)
- `npm run initialize-metadata` - Initialize metadata for existing token
- `npm run create-ata` - Create Associated Token Account
- `npm run mint` - Mint tokens to ATA
- `npm run build` - Build TypeScript
- `npm run dev` - Run development mode

## 🏗️ Project Structure

```
.
├── src/
│   ├── index.ts              # Main CLI interface
│   ├── createToken.ts        # Token creation script
│   ├── initializeMetadata.ts # Metadata initialization
│   ├── createATA.ts          # ATA creation
│   ├── mint.ts               # Token minting
│   ├── types.ts              # TypeScript types
│   └── utils/
│       ├── connection.ts     # Solana connection utilities
│       └── keypair.ts        # Keypair loading utilities
├── package.json
├── tsconfig.json
└── README.md
```

## 🔐 Security Notes

- Never commit your `.env` file or private keys
- Use environment variables or secure key management
- Test on devnet before using mainnet
- Keep your keypair file secure

## 🌐 Networks

- **Devnet**: `https://api.devnet.solana.com` (for testing)
- **Mainnet**: `https://api.mainnet-beta.solana.com` (production)

## 🐛 Troubleshooting

### Insufficient Balance
Make sure your wallet has enough SOL for transaction fees (typically 0.01-0.1 SOL).

### CLI Not Found
Ensure `spl-token` is installed and in your PATH:
```bash
which spl-token
cargo install spl-token-cli
```

### Transaction Failed
- Check your network connection
- Verify you have sufficient balance
- Ensure the RPC endpoint is correct
- Check transaction logs in Solana Explorer

## 📖 References

- [Solana Token Extensions](https://spl.solana.com/token-extensions)
- [SPL Token CLI Documentation](https://spl.solana.com/token)
- [Token-2022 Program](https://spl.solana.com/token-2022)

## 📄 License

MIT

