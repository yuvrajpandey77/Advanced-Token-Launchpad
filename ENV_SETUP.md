# Environment Variables Setup Guide (Option B)

This guide shows you how to set up environment variables for using the CLI tools on Mainnet.

## Quick Start

1. **Copy the example file:**
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` file** with your actual values (see below)

3. **Use the CLI** - Environment variables will be loaded automatically!

## Step-by-Step Setup

### Step 1: Create `.env` File

```bash
cp .env.example .env
```

### Step 2: Get Your Private Key

#### From Phantom Wallet:
1. Open Phantom wallet
2. Go to **Settings** → **Security & Privacy**
3. Click **"Export Private Key"**
4. Enter your password
5. Copy the private key (it's a JSON array like `[1,2,3,...]`)

#### From Solflare Wallet:
1. Open Solflare wallet
2. Go to **Settings** → **Security**
3. Click **"Export Private Key"**
4. Enter your password
5. Copy the private key

#### From Solana CLI:
```bash
cat ~/.config/solana/id.json
```

### Step 3: Edit `.env` File

Open `.env` in your text editor and update these values:

```env
# For Mainnet
RPC_URL_MAINNET=https://api.mainnet-beta.solana.com

# Your private key (JSON array format)
WALLET_PRIVATE_KEY=[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64]
```

**Important:** Replace `[1,2,3,...]` with your actual private key array!

### Step 4: Verify Setup

Test that your environment variables are loaded:

```bash
# Check if wallet loads correctly
npm run create-token -- --help
```

## Usage Examples

### Create Token on Mainnet

```bash
# Using .env file (automatically loads)
npm run create-token -- \
  --name "My Token" \
  --symbol "MTK" \
  --network mainnet-beta \
  --amount 1000
```

### Create Token on Devnet

```bash
npm run create-token -- \
  --name "My Token" \
  --symbol "MTK" \
  --network devnet \
  --amount 1000
```

### Using Custom RPC URL

You can override the RPC URL in `.env`:

```env
RPC_URL=https://your-custom-rpc-endpoint.com
```

Or set it inline:

```bash
RPC_URL=https://api.mainnet-beta.solana.com npm run create-token -- --name "My Token"
```

## Environment Variable Options

### Network Configuration

```env
# Option 1: Set specific network RPC URLs
RPC_URL_MAINNET=https://api.mainnet-beta.solana.com
RPC_URL_DEVNET=https://api.devnet.solana.com

# Option 2: Override with custom RPC URL (takes precedence)
RPC_URL=https://your-custom-rpc.com
```

### Wallet Configuration

**Option 1: Private Key as JSON Array (Recommended)**
```env
WALLET_PRIVATE_KEY=[1,2,3,4,5,...]
```

**Option 2: Private Key as Base64**
```env
WALLET_PRIVATE_KEY=base64encodedkey...
```

**Option 3: Keypair File Path**
```env
KEYPAIR_PATH=/path/to/your/keypair.json
```

## Private Key Format

Your private key should be a JSON array with 64 numbers:

```json
[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64]
```

When you export from Phantom/Solflare, you'll get exactly this format. Just copy and paste it into your `.env` file.

## Security Notes

⚠️ **IMPORTANT SECURITY REMINDERS:**

1. **Never commit `.env` file** - It's already in `.gitignore`
2. **Never share your private key** - Keep it secret!
3. **Use separate wallets** - Consider using a dedicated wallet for CLI operations
4. **Test on devnet first** - Always test before using mainnet
5. **Backup your keypair** - Store backups securely (encrypted)

## Troubleshooting

### "No keypair found" Error

Make sure your `.env` file:
- Exists in the project root directory
- Has `WALLET_PRIVATE_KEY` set correctly
- The private key is in the correct format (JSON array)

### "Invalid private key format" Error

- Make sure your private key is a valid JSON array: `[1,2,3,...]`
- Don't include extra quotes or spaces
- Should have exactly 64 numbers

### "Insufficient funds" Error

- Make sure you have SOL in your wallet
- Check balance: The CLI will show your balance before creating tokens
- You need at least 0.01-0.05 SOL for token creation

### Environment Variables Not Loading

- Make sure `.env` file is in the project root (same directory as `package.json`)
- Check that `.env` file has correct format (no spaces around `=`)
- Try restarting your terminal

## Using Custom RPC Providers

For better performance, use a custom RPC provider:

```env
# Helius
RPC_URL_MAINNET=https://mainnet.helius-rpc.com/?api-key=YOUR_API_KEY

# QuickNode
RPC_URL_MAINNET=https://your-endpoint.solana-mainnet.quiknode.pro/YOUR_API_KEY

# Alchemy
RPC_URL_MAINNET=https://solana-mainnet.g.alchemy.com/v2/YOUR_API_KEY
```

## Next Steps

1. ✅ Set up your `.env` file
2. ✅ Test on devnet first
3. ✅ Verify your wallet has SOL
4. ✅ Create your token on mainnet!

For more details, see [MAINNET_SETUP.md](./MAINNET_SETUP.md)

