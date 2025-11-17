# Quick Start Guide


# Create a token with metadata
npm run create-token -- --name "Token Name" --symbol "SYMBOL" --metadata-uri "https://..." --amount 1000

# Initialize metadata for existing token
npm run initialize-metadata -- <mint-address> "Name" "Symbol" "https://metadata-uri"

# Create Associated Token Account
npm run create-ata -- <mint-address>

# Mint tokens
npm run mint -- <mint-address> <amount> [recipient-address]

# General dev script
npm run dev


## Exact Commands from Context

### 1. Create Token with Metadata Enabled
```bash
spl-token --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb create-token --enable-metadata
```

This will output a mint address. Save it for the next steps.

### 2. Initialize Metadata
```bash
spl-token initialize-metadata pXfZ6Hg2s78m1iSRVsdzos9TmfkqkQdv5MmQrr77ZQK 100xx 100xxx https://cdn.100xdevs.com/metadata.json
```

Replace `pXfZ6Hg2s78m1iSRVsdzos9TmfkqkQdv5MmQrr77ZQK` with your actual mint address from step 1.

### 3. Create Associated Token Account (ATA)
```bash
spl-token create-account pXfZ6Hg2s78m1iSRVsdzos9TmfkqkQdv5MmQrr77ZQK
```

### 4. Mint Tokens
```bash
spl-token mint pXfZ6Hg2s78m1iSRVsdzos9TmfkqkQdv5MmQrr77ZQK 1000
```

### 5. Check Your Wallet
Open your Solana wallet and verify the token appears with its metadata (name, symbol, image).

## Using the NPM Scripts

Alternatively, use the provided npm scripts:

```bash
# All-in-one (recommended)
npm run create-token -- --name "100xx" --symbol "100xxx" --metadata-uri "https://cdn.100xdevs.com/metadata.json" --amount 1000

# Or step-by-step
npm run initialize-metadata -- <mint-address> "100xx" "100xxx" "https://cdn.100xdevs.com/metadata.json"
npm run create-ata -- <mint-address>
npm run mint -- <mint-address> 1000
```

## Metadata JSON

The metadata at `https://cdn.100xdevs.com/metadata.json` contains:
```json
{
  "name": "Token x",
  "symbol": "Token x",
  "description": "This is an example fungible token for demonstration purposes.",
  "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSg600Xa4ws6jp54kMDNGYF232lIhY51QJqEA&s"
}
```

