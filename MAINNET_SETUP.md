# Mainnet Setup Guide

This guide explains how to configure the CLI tools to work on Solana Mainnet instead of Devnet.

## ⚠️ Important Security Notes

**NEVER share your private key with anyone!** You can configure everything yourself using the methods below.

## Prerequisites

1. **Solana CLI installed** - Required for `spl-token` commands
   ```bash
   sh -c "$(curl -sSfL https://release.solana.com/stable/install)"
   ```

2. **Wallet with SOL on Mainnet** - You need real SOL for transaction fees (~0.01-0.1 SOL per transaction)

3. **Private Key Access** - You'll need access to your wallet's private key

## Method 1: Using Solana CLI Config (Recommended)

This is the easiest method if you have the Solana CLI installed.

### Step 1: Configure Solana CLI for Mainnet

```bash
# Set network to mainnet
solana config set --url mainnet-beta

# Verify configuration
solana config get
```

You should see:
```
Config File: /home/your-user/.config/solana/cli/config.yml
RPC URL: https://api.mainnet-beta.solana.com
WebSocket URL: wss://api.mainnet-beta.solana.com (computed)
Keypair Path: /home/your-user/.config/solana/id.json
Commitment: confirmed
```

### Step 2: Set Your Wallet Keypair

**Option A: Use existing keypair file**
```bash
# If your keypair is already at ~/.config/solana/id.json, you're done!
solana address  # Verify your wallet address
solana balance  # Check your balance
```

**Option B: Import your keypair**
```bash
# Copy your keypair file to the default location
cp /path/to/your/keypair.json ~/.config/solana/id.json

# Or set a custom path
solana config set --keypair /path/to/your/keypair.json
```

**Option C: Create keypair from private key**
```bash
# Create a keypair file from your private key array
echo '[1,2,3,...]' > ~/.config/solana/id.json
# Replace [1,2,3,...] with your actual private key array
```

### Step 3: Verify Setup

```bash
# Check your address
solana address

# Check your balance (should show real SOL)
solana balance

# Check network
solana config get | grep "RPC URL"
```

### Step 4: Use CLI Commands

Now you can use the CLI commands and they'll automatically use mainnet:

```bash
# Create token on mainnet
npm run create-token -- --name "My Token" --symbol "MTK" --network mainnet-beta

# Or explicitly set network
npm run create-token -- --name "My Token" --symbol "MTK" --network mainnet-beta --amount 1000
```

## Method 2: Using Environment Variables

This method gives you more control and doesn't require Solana CLI config changes.

### Step 1: Set Environment Variables

Create a `.env` file or export variables in your shell:

```bash
# Set network via RPC URL
export RPC_URL="https://api.mainnet-beta.solana.com"

# Or use specific mainnet RPC
export RPC_URL_MAINNET="https://api.mainnet-beta.solana.com"

# Set your wallet private key (JSON array format)
export WALLET_PRIVATE_KEY='[1,2,3,4,5,...]'

# Or use base64 format
export WALLET_PRIVATE_KEY="base64encodedkey..."

# Or specify keypair file path
export KEYPAIR_PATH="/path/to/your/keypair.json"
```

### Step 2: Use CLI Commands

```bash
# The CLI will automatically use mainnet RPC
npm run create-token -- --name "My Token" --symbol "MTK" --network mainnet-beta
```

## Method 3: Using --network Flag

The CLI now supports a `--network` flag:

```bash
# Explicitly specify mainnet
npm run create-token -- --name "My Token" --symbol "MTK" --network mainnet-beta

# Or devnet
npm run create-token -- --name "My Token" --symbol "MTK" --network devnet
```

## Getting Your Private Key

### From Phantom Wallet

1. Open Phantom wallet
2. Go to Settings → Security & Privacy
3. Click "Export Private Key"
4. Enter your password
5. Copy the private key (it's a JSON array like `[1,2,3,...]`)

### From Solflare Wallet

1. Open Solflare wallet
2. Go to Settings → Security
3. Click "Export Private Key"
4. Enter your password
5. Copy the private key

### From Command Line (if using Solana CLI)

```bash
# View your keypair (be careful!)
cat ~/.config/solana/id.json
```

## Private Key Formats

The CLI supports two formats:

### Format 1: JSON Array (Recommended)
```bash
export WALLET_PRIVATE_KEY='[1,2,3,4,5,...]'
```

### Format 2: Base64 Encoded
```bash
export WALLET_PRIVATE_KEY="base64encodedkey..."
```

## Example: Complete Mainnet Token Creation

```bash
# 1. Set environment variables
export RPC_URL="https://api.mainnet-beta.solana.com"
export WALLET_PRIVATE_KEY='[your-private-key-array]'

# 2. Verify connection
npm run dev  # Check the connection in the code

# 3. Create token on mainnet
npm run create-token -- \
  --name "My Awesome Token" \
  --symbol "MAT" \
  --metadata-uri "https://your-domain.com/metadata.json" \
  --amount 1000000 \
  --decimals 9 \
  --network mainnet-beta
```

## Using Custom RPC Endpoints

For better performance and reliability, use a custom RPC provider:

```bash
# Helius
export RPC_URL="https://mainnet.helius-rpc.com/?api-key=YOUR_API_KEY"

# QuickNode
export RPC_URL="https://your-endpoint.solana-mainnet.quiknode.pro/YOUR_API_KEY"

# Alchemy
export RPC_URL="https://solana-mainnet.g.alchemy.com/v2/YOUR_API_KEY"
```

## Troubleshooting

### "Insufficient funds" Error
- Make sure you have real SOL in your mainnet wallet
- Check balance: `solana balance` (on mainnet)
- You need at least 0.01 SOL for basic transactions

### "Invalid private key" Error
- Make sure your private key is in the correct format (JSON array or base64)
- Don't include quotes if using JSON array format directly
- Check that the keypair file exists and is readable

### "Network mismatch" Error
- Make sure Solana CLI config matches your RPC_URL
- Run `solana config get` to verify
- Use `solana config set --url mainnet-beta` to fix

### "Transaction failed" Error
- Check that you have enough SOL for fees
- Verify your RPC endpoint is working
- Try using a different RPC endpoint
- Check transaction on Solana Explorer: https://explorer.solana.com

## Security Best Practices

1. **Never commit private keys** - Add `.env` to `.gitignore`
2. **Use environment variables** - Don't hardcode keys in scripts
3. **Test on devnet first** - Always test on devnet before mainnet
4. **Use separate wallets** - Consider using a separate wallet for CLI operations
5. **Monitor transactions** - Keep track of all mainnet transactions
6. **Backup your keypair** - Store backups securely (encrypted)

## Cost Estimates

Approximate costs on mainnet:
- Token creation: ~0.01-0.02 SOL
- Metadata initialization: ~0.01-0.02 SOL
- ATA creation: ~0.002 SOL
- Minting tokens: ~0.000005 SOL per transaction
- **Total for full setup: ~0.03-0.05 SOL**

## Next Steps

After setting up mainnet:
1. Test with a small amount first
2. Verify your token appears correctly in wallets
3. Check metadata on Solana Explorer
4. Consider using a custom RPC for production

## Need Help?

- Check Solana CLI docs: https://docs.solana.com/cli
- Solana Discord: https://discord.gg/solana
- Project Issues: [GitHub Issues](https://github.com/your-repo/issues)

