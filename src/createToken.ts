import { execSync } from 'child_process';
import { createConnection, Network } from './utils/connection.js';
import { loadKeypair } from './utils/keypair.js';
import { loadEnv } from './utils/loadEnv.js';

// Load environment variables from .env file
loadEnv();

interface TokenCreationOptions {
  name: string;
  symbol: string;
  metadataUri: string;
  amount?: number;
  decimals?: number;
  network?: Network;
}

async function createTokenWithMetadata(options: TokenCreationOptions) {
  const { name, symbol, metadataUri, amount = 1000, decimals = 9, network } = options;

  console.log('🚀 Creating Token-22 with metadata...\n');
  console.log('Configuration:');
  console.log(`  Name: ${name}`);
  console.log(`  Symbol: ${symbol}`);
  console.log(`  Metadata URI: ${metadataUri}`);
  console.log(`  Amount: ${amount}`);
  console.log(`  Decimals: ${decimals}`);
  console.log(`  Network: ${network || 'devnet (default)'}\n`);

  try {
    const connection = createConnection(undefined, network);
    const payer = loadKeypair();
    
    // Set Solana CLI config to match network if specified
    if (network === 'mainnet' || network === 'mainnet-beta') {
      try {
        execSync('solana config set --url mainnet-beta', { stdio: 'pipe' });
        console.log('✅ Solana CLI configured for mainnet-beta\n');
      } catch (error) {
        console.warn('⚠️  Warning: Could not set Solana CLI config. Make sure Solana CLI is installed.');
        console.warn('   You can manually set it with: solana config set --url mainnet-beta\n');
      }
    } else {
      try {
        execSync('solana config set --url devnet', { stdio: 'pipe' });
        console.log('✅ Solana CLI configured for devnet\n');
      } catch (error) {
        // Silently fail if Solana CLI is not installed or config fails
      }
    }

    console.log('Payer:', payer.publicKey.toBase58());
    console.log('Network:', connection.rpcEndpoint);

    // Check balance
    const balance = await connection.getBalance(payer.publicKey);
    console.log(`Balance: ${balance / 1e9} SOL\n`);

    if (balance < 0.01 * 1e9) {
      console.warn('⚠️  Warning: Low balance. Token creation may fail.');
    }

    // Step 1: Create token with metadata enabled
    console.log('📝 Step 1: Creating token with metadata enabled...');
    const createTokenCmd = `spl-token --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb create-token --enable-metadata`;
    console.log(`Running: ${createTokenCmd}`);
    
    const createTokenOutput = execSync(createTokenCmd, { 
      encoding: 'utf-8',
      stdio: 'pipe'
    });
    
    // Try multiple patterns to extract mint address
    let mintAddressMatch = createTokenOutput.match(/Creating token (\w+)/);
    if (!mintAddressMatch) {
      mintAddressMatch = createTokenOutput.match(/Token mint: (\w+)/);
    }
    if (!mintAddressMatch) {
      mintAddressMatch = createTokenOutput.match(/([1-9A-HJ-NP-Za-km-z]{32,44})/);
    }
    if (!mintAddressMatch) {
      throw new Error('Failed to extract mint address from token creation. Output: ' + createTokenOutput);
    }
    const mintAddress = mintAddressMatch[1];
    console.log(`✅ Token created: ${mintAddress}\n`);

    // Step 2: Initialize metadata
    console.log('📝 Step 2: Initializing metadata...');
    const initMetadataCmd = `spl-token initialize-metadata ${mintAddress} "${name}" "${symbol}" "${metadataUri}"`;
    console.log(`Running: ${initMetadataCmd}`);
    
    execSync(initMetadataCmd, { encoding: 'utf-8', stdio: 'inherit' });
    console.log('✅ Metadata initialized\n');

    // Step 3: Create ATA
    console.log('📝 Step 3: Creating Associated Token Account (ATA)...');
    const createATACmd = `spl-token create-account ${mintAddress}`;
    console.log(`Running: ${createATACmd}`);
    
    execSync(createATACmd, { encoding: 'utf-8', stdio: 'inherit' });
    console.log('✅ ATA created\n');

    // Step 4: Mint tokens
    console.log('📝 Step 4: Minting tokens...');
    const mintCmd = `spl-token mint ${mintAddress} ${amount}`;
    console.log(`Running: ${mintCmd}`);
    
    execSync(mintCmd, { encoding: 'utf-8', stdio: 'inherit' });
    console.log('✅ Tokens minted\n');

    console.log('🎉 Token creation complete!');
    console.log(`\nMint Address: ${mintAddress}`);
    console.log(`Check your wallet to see the token with metadata.`);

    return { mintAddress };

  } catch (error: unknown) {
    const err = error as { message?: string; stdout?: string; stderr?: string };
    console.error('❌ Error:', err.message || String(error));
    if (err.stdout) console.error('STDOUT:', err.stdout);
    if (err.stderr) console.error('STDERR:', err.stderr);
    process.exit(1);
  }
}

// CLI interface
const args = process.argv.slice(2);

if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
  console.log(`
Usage: npm run create-token -- [options]

Options:
  --name <name>              Token name (default: "100xx")
  --symbol <symbol>          Token symbol (default: "100xxx")
  --metadata-uri <uri>       Metadata JSON URI (default: "https://cdn.100xdevs.com/metadata.json")
  --amount <amount>          Amount to mint (default: 1000)
  --decimals <decimals>      Token decimals (default: 9)
  --network <network>        Network: "devnet" or "mainnet-beta" (default: "devnet")

Environment Variables:
  RPC_URL                    Custom RPC URL (overrides network)
  RPC_URL_MAINNET            Mainnet RPC URL
  RPC_URL_DEVNET             Devnet RPC URL
  WALLET_PRIVATE_KEY         Private key as JSON array or base64
  KEYPAIR_PATH               Path to keypair file (default: ~/.config/solana/id.json)

Examples:
  # Devnet (default)
  npm run create-token -- --name "My Token" --symbol "MTK" --amount 5000
  
  # Mainnet
  npm run create-token -- --name "My Token" --symbol "MTK" --network mainnet-beta
  
  # With custom RPC
  RPC_URL=https://api.mainnet-beta.solana.com npm run create-token -- --name "My Token"
  `);
  process.exit(0);
}

// Parse arguments
const options: TokenCreationOptions = {
  name: '100xx',
  symbol: '100xxx',
  metadataUri: 'https://cdn.100xdevs.com/metadata.json',
  amount: 1000,
  decimals: 9,
};

for (let i = 0; i < args.length; i += 2) {
  const key = args[i];
  const value = args[i + 1];

  switch (key) {
    case '--name':
      options.name = value;
      break;
    case '--symbol':
      options.symbol = value;
      break;
    case '--metadata-uri':
      options.metadataUri = value;
      break;
    case '--amount':
      options.amount = parseInt(value, 10);
      break;
    case '--decimals':
      options.decimals = parseInt(value, 10);
      break;
    case '--network':
      if (value === 'mainnet' || value === 'mainnet-beta' || value === 'devnet') {
        options.network = value as Network;
      } else {
        console.error(`❌ Invalid network: ${value}. Use "devnet" or "mainnet-beta"`);
        process.exit(1);
      }
      break;
  }
}

createTokenWithMetadata(options);
