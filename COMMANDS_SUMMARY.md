# Commands Summary - Token Creation & Setup

This document summarizes all the commands and steps used to set up and create Token-2022 tokens with metadata on Solana.

## Table of Contents

1. [Initial Setup](#initial-setup)
2. [Environment Configuration](#environment-configuration)
3. [Wallet Configuration](#wallet-configuration)
4. [Token Creation Commands](#token-creation-commands)
5. [Token Minting Commands](#token-minting-commands)
6. [Metadata Updates](#metadata-updates)
7. [Verification Commands](#verification-commands)

---

## Initial Setup

### Install Dependencies

```bash
# Install dotenv for environment variable support
npm install --save-dev dotenv
```

---

## Environment Configuration

### Create .env File

```bash
# Copy example file
cp .env.example .env
```

### .env File Contents

```env
# Solana Network Configuration
RPC_URL_MAINNET=https://api.mainnet-beta.solana.com
RPC_URL_DEVNET=https://api.devnet.solana.com

# Wallet Private Key (JSON array format)
WALLET_PRIVATE_KEY=[29,243,245,142,182,150,254,127,150,39,71,80,71,155,157,157,61,204,26,53,19,36,233,51,190,9,50,222,213,24,149,46,69,57,77,35,248,187,38,31,223,53,49,12,150,97,46,154,245,35,39,79,205,68,118,145,238,14,133,166,228,109,37,24]

# Frontend Configuration (for web UI)
VITE_USDT_MINT_ADDRESS=pXfZ6Hg2s78m1iSRVsdzos9TmfkqkQdv5MmQrr77ZQK
VITE_RPC_URL_DEVNET=https://api.devnet.solana.com
VITE_RPC_URL_MAINNET=https://api.mainnet-beta.solana.com
```

---

## Wallet Configuration

### Convert Private Key to Solana CLI Keypair

```bash
# Create keypair file from .env private key
node -e "require('dotenv').config(); const key = process.env.WALLET_PRIVATE_KEY; if (key) { const arr = JSON.parse(key); const fs = require('fs'); const path = require('path'); const os = require('os'); const keypairPath = path.join(os.homedir(), '.config', 'solana', 'id.json'); const keypairDir = path.dirname(keypairPath); if (!fs.existsSync(keypairDir)) { fs.mkdirSync(keypairDir, { recursive: true }); } fs.writeFileSync(keypairPath, JSON.stringify(arr)); console.log('✅ Created keypair file at:', keypairPath); }"
```

### Configure Solana CLI

```bash
# Set Solana CLI to use the keypair file
solana config set --keypair ~/.config/solana/id.json --url devnet

# Verify configuration
solana config get

# Check wallet address
solana address --url devnet

# Check balance
solana balance --url devnet
```

### Wallet Information

- **Wallet Address**: `5fDouaPirsm7g5BXvMECS2Jb7iKkbHdRmnufZ4nzE7bM`
- **Network**: Devnet (can switch to mainnet-beta)

---

## Token Creation Commands

### Create Token with USDT Name and CoinGecko Logo

#### Method 1: Using npm script with metadata URI

```bash
# Generate metadata URI with CoinGecko logo
METADATA_URI=$(python3 -c "import json, urllib.parse; data = {'name': 'USDT', 'symbol': 'USDT', 'description': 'USDT is a stablecoin pegged to the US Dollar.', 'image': 'https://assets.coingecko.com/coins/images/325/large/Tether-logo.png'}; print('data:application/json,' + urllib.parse.quote(json.dumps(data)))")

# Create token on devnet
npm run create-token -- \
  --name "USDT" \
  --symbol "USDT" \
  --network devnet \
  --amount 1000000 \
  --metadata-uri "$METADATA_URI"
```

#### Method 2: Direct spl-token commands

```bash
# Step 1: Create token with metadata enabled
spl-token --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb create-token --enable-metadata --url devnet

# Step 2: Initialize metadata (replace MINT_ADDRESS with actual mint)
spl-token initialize-metadata MINT_ADDRESS "USDT" "USDT" "METADATA_URI" --url devnet

# Step 3: Create Associated Token Account (ATA)
spl-token create-account MINT_ADDRESS --url devnet

# Step 4: Mint tokens
spl-token mint MINT_ADDRESS 1000000 --url devnet
```

### Created Tokens

#### Token 1: Initial Test Token
- **Mint Address**: `FB9GH9awNod93ytTRZoFEpxA1DjLMfTRst8w6wpTKJdE`
- **Name**: "Test Token"
- **Symbol**: "TEST"
- **Amount**: 1,000 tokens

#### Token 2: USDT Token (First Attempt)
- **Mint Address**: `7z9ft7bCxPUJSqzML8USq6r8UrjxM4CgsuwzKTu14gmh`
- **Name**: "Tether USD"
- **Symbol**: "USDT"
- **Amount**: 1,000 tokens

#### Token 3: USDT Token (Updated)
- **Mint Address**: `3c29e5Zxsb58LPVojci5hfwxC3WPdGEudoD3txuM6gw5`
- **Name**: "Tether USD"
- **Symbol**: "USDT"
- **Amount**: 1,000 tokens

#### Token 4: USDT Token (Final - Updated Name)
- **Mint Address**: `FCirHxJUVz44dHYtBkHeKG9CKXmAaaP9GSUGHB9dtqXK`
- **Name**: "USDT" (updated from "Tether USD")
- **Symbol**: "USDT"
- **Amount**: 1,001,000 tokens (1,000 initial + 1,000,000 minted)
- **Logo**: CoinGecko Tether logo

#### Token 5: USDT Token (Final - Correct Name from Start)
- **Mint Address**: `A7NdRy4VhUGjLsKUr2pvigbRBLZVrLyLDigzfgkK21yC`
- **Name**: "USDT"
- **Symbol**: "USDT"
- **Amount**: 1,000,000 tokens
- **Logo**: CoinGecko Tether logo (`https://assets.coingecko.com/coins/images/325/large/Tether-logo.png`)

---

## Token Minting Commands

### Mint Additional Tokens to Existing Token

```bash
# Mint 1 million tokens to existing token account
spl-token mint FCirHxJUVz44dHYtBkHeKG9CKXmAaaP9GSUGHB9dtqXK 1000000 --url devnet
```

### Mint to Specific Address

```bash
# Mint tokens to a specific recipient address
spl-token mint MINT_ADDRESS AMOUNT RECIPIENT_ADDRESS --url devnet
```

---

## Metadata Updates

### Update Token Name

```bash
# Update token name
spl-token update-metadata FCirHxJUVz44dHYtBkHeKG9CKXmAaaP9GSUGHB9dtqXK name "USDT" --url devnet
```

### Update Metadata URI

```bash
# Generate updated metadata URI
METADATA_URI=$(python3 -c "import json, urllib.parse; data = {'name': 'USDT', 'symbol': 'USDT', 'description': 'USDT is a stablecoin pegged to the US Dollar.', 'image': 'https://assets.coingecko.com/coins/images/325/large/Tether-logo.png'}; print('data:application/json,' + urllib.parse.quote(json.dumps(data)))")

# Update metadata URI
spl-token update-metadata FCirHxJUVz44dHYtBkHeKG9CKXmAaaP9GSUGHB9dtqXK uri "$METADATA_URI" --url devnet
```

### Update Other Metadata Fields

```bash
# Update symbol
spl-token update-metadata MINT_ADDRESS symbol "SYMBOL" --url devnet

# Update URI
spl-token update-metadata MINT_ADDRESS uri "METADATA_URI" --url devnet
```

---

## Verification Commands

### Check Token Account Balance

```bash
# List all token accounts
spl-token accounts --url devnet

# Get specific token account info
spl-token account-info MINT_ADDRESS --url devnet

# Check balance for specific token
spl-token balance MINT_ADDRESS --url devnet
```

### Check Token Metadata

```bash
# Display token information
spl-token display MINT_ADDRESS --url devnet

# Get token supply
spl-token supply MINT_ADDRESS --url devnet
```

### Check Wallet Balance

```bash
# Check SOL balance
solana balance --url devnet

# Check wallet address
solana address --url devnet

# Check Solana CLI configuration
solana config get
```

### Verify Token on Explorer

- **Devnet Explorer**: https://explorer.solana.com/address/MINT_ADDRESS?cluster=devnet
- **Mainnet Explorer**: https://explorer.solana.com/address/MINT_ADDRESS

---

## Network Switching

### Switch to Mainnet

```bash
# Set Solana CLI to mainnet
solana config set --url mainnet-beta

# Verify network
solana config get
```

### Switch to Devnet

```bash
# Set Solana CLI to devnet
solana config set --url devnet

# Verify network
solana config get
```

---

## Complete Token Creation Workflow

### For Devnet Testing

```bash
# 1. Set network
solana config set --url devnet

# 2. Generate metadata URI
METADATA_URI=$(python3 -c "import json, urllib.parse; data = {'name': 'USDT', 'symbol': 'USDT', 'description': 'USDT is a stablecoin pegged to the US Dollar.', 'image': 'https://assets.coingecko.com/coins/images/325/large/Tether-logo.png'}; print('data:application/json,' + urllib.parse.quote(json.dumps(data)))")

# 3. Create token with metadata
npm run create-token -- \
  --name "USDT" \
  --symbol "USDT" \
  --network devnet \
  --amount 1000000 \
  --metadata-uri "$METADATA_URI"

# 4. Verify token
spl-token accounts --url devnet
```

### For Mainnet Production

```bash
# 1. Set network to mainnet
solana config set --url mainnet-beta

# 2. Verify balance (need real SOL)
solana balance --url mainnet-beta

# 3. Generate metadata URI
METADATA_URI=$(python3 -c "import json, urllib.parse; data = {'name': 'USDT', 'symbol': 'USDT', 'description': 'USDT is a stablecoin pegged to the US Dollar.', 'image': 'https://assets.coingecko.com/coins/images/325/large/Tether-logo.png'}; print('data:application/json,' + urllib.parse.quote(json.dumps(data)))")

# 4. Create token with metadata
npm run create-token -- \
  --name "USDT" \
  --symbol "USDT" \
  --network mainnet-beta \
  --amount 1000000 \
  --metadata-uri "$METADATA_URI"

# 5. Verify token
spl-token accounts --url mainnet-beta
```

---

## Metadata JSON Structure

### Standard Metadata Format

```json
{
  "name": "USDT",
  "symbol": "USDT",
  "description": "USDT is a stablecoin pegged to the US Dollar.",
  "image": "https://assets.coingecko.com/coins/images/325/large/Tether-logo.png"
}
```

### Generate Metadata URI

```bash
# Python script to generate URL-encoded metadata URI
python3 -c "
import json
import urllib.parse

data = {
    'name': 'USDT',
    'symbol': 'USDT',
    'description': 'USDT is a stablecoin pegged to the US Dollar.',
    'image': 'https://assets.coingecko.com/coins/images/325/large/Tether-logo.png'
}

metadata_uri = 'data:application/json,' + urllib.parse.quote(json.dumps(data))
print(metadata_uri)
"
```

---

## Important Notes

### Security

- **Never commit `.env` file** - It's already in `.gitignore`
- **Never share private keys** - Keep them secure
- **Use separate wallets** - Consider using a dedicated wallet for CLI operations
- **Test on devnet first** - Always test before using mainnet

### Costs

Approximate costs on mainnet:
- Token creation: ~0.01-0.02 SOL
- Metadata initialization: ~0.01-0.02 SOL
- ATA creation: ~0.002 SOL
- Minting tokens: ~0.000005 SOL per transaction
- **Total for full setup: ~0.03-0.05 SOL**

### Troubleshooting

#### "Insufficient funds" Error
```bash
# Check balance
solana balance --url devnet

# Airdrop SOL on devnet (if needed)
solana airdrop 1 $(solana address) --url devnet
```

#### "Invalid private key" Error
- Ensure private key is in JSON array format: `[1,2,3,...]`
- Check that `.env` file exists and is properly formatted
- Verify keypair file exists: `~/.config/solana/id.json`

#### "Network mismatch" Error
```bash
# Check current network
solana config get

# Set correct network
solana config set --url devnet  # or mainnet-beta
```

---

## Quick Reference

### Most Used Commands

```bash
# Create token with metadata
npm run create-token -- --name "USDT" --symbol "USDT" --network devnet --amount 1000000 --metadata-uri "$METADATA_URI"

# Mint more tokens
spl-token mint MINT_ADDRESS AMOUNT --url devnet

# Check token balance
spl-token accounts --url devnet

# Check SOL balance
solana balance --url devnet

# Switch network
solana config set --url devnet  # or mainnet-beta
```

---

## Files Created/Modified

1. **`.env`** - Environment variables (wallet, RPC URLs)
2. **`~/.config/solana/id.json`** - Solana CLI keypair file
3. **`metadata-usdt-coingecko.json`** - Metadata JSON file
4. **`metadata-usdt-updated.json`** - Updated metadata file

---

## References

- [Solana CLI Documentation](https://docs.solana.com/cli)
- [SPL Token Program](https://spl.solana.com/token)
- [Token-2022 Extensions](https://spl.solana.com/token-2022)
- [CoinGecko Tether Logo](https://assets.coingecko.com/coins/images/325/large/Tether-logo.png)

---

**Last Updated**: November 2024
**Network**: Devnet (tested) / Mainnet (ready)
**Wallet**: `5fDouaPirsm7g5BXvMECS2Jb7iKkbHdRmnufZ4nzE7bM`

