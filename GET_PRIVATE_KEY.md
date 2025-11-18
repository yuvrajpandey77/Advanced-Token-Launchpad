# How to Get Your Private Key

## ⚠️ Important: What You Shared

The string you shared (`bjYwNw5g3w2UFPQu1fsn62ECTsMa7zTE8y27xQmUWckaLm63BVUuLytgrpZfexoKcjAQ7PrwbqcjZfceHoW1fy1`) appears to be:
- **NOT a standard Solana public key** (those are 32-44 characters)
- **Possibly a base58-encoded private key** (88 characters)
- **Or a mnemonic seed phrase** (if it's from a different wallet)

## What You Need: Private Key Format

The CLI needs your private key in **one of these formats**:

### Format 1: JSON Array (Recommended)
```json
[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64]
```
This is what you get when exporting from Phantom/Solflare wallets.

### Format 2: Base64 Encoded
```
base64encodedstring...
```

## How to Get Your Private Key

### Method 1: From Phantom Wallet (Easiest)

1. Open **Phantom** browser extension
2. Click the **menu icon** (☰) → **Settings**
3. Go to **Security & Privacy**
4. Click **"Export Private Key"**
5. Enter your **Phantom password**
6. Copy the private key (it will be a JSON array like `[1,2,3,...]`)

### Method 2: From Solflare Wallet

1. Open **Solflare** wallet
2. Go to **Settings** → **Security**
3. Click **"Export Private Key"**
4. Enter your password
5. Copy the private key

### Method 3: From Solana CLI (if you have a keypair file)

If you have a keypair file at `~/.config/solana/id.json`:

```bash
cat ~/.config/solana/id.json
```

This will show you the JSON array format directly.

### Method 4: Convert Base58 to JSON Array (if your string is base58)

If the string you shared is actually a base58-encoded private key, we can convert it:

```bash
# Create a script to convert it
node -e "
const bs58 = require('bs58');
const key = 'bjYwNw5g3w2UFPQu1fsn62ECTsMa7zTE8y27xQmUWckaLm63BVUuLytgrpZfexoKcjAQ7PrwbqcjZfceHoW1fy1';
try {
  const decoded = bs58.decode(key);
  console.log('Decoded length:', decoded.length);
  if (decoded.length === 64) {
    console.log('✅ This is a 64-byte private key!');
    console.log('JSON format:', JSON.stringify(Array.from(decoded)));
  } else {
    console.log('❌ Not a standard 64-byte private key');
  }
} catch(e) {
  console.log('❌ Error decoding:', e.message);
}
"
```

## Setting Up Your .env File

Once you have your private key in JSON array format:

1. **Create `.env` file:**
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` and add:**
   ```env
   RPC_URL_MAINNET=https://api.mainnet-beta.solana.com
   WALLET_PRIVATE_KEY=[1,2,3,4,5,...]  # Paste your JSON array here
   ```

3. **Save the file**

## Verify Your Setup

Test that your private key works:

```bash
# This will show your wallet address
npm run create-token -- --help
```

If there's an error, check:
- Private key format is correct (JSON array)
- No extra spaces or quotes
- Exactly 64 numbers in the array

## Security Reminder

- **Never share your private key publicly**
- **Never commit `.env` to git** (it's already in `.gitignore`)
- **Use a separate wallet** for CLI operations if possible
- **Test on devnet first** before using mainnet

