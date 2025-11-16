/**
 * Example script showing how to use the token creation functions programmatically
 * 
 * This is a reference implementation. For actual usage, use the CLI commands
 * or the main index.ts script.
 */

import { createConnection } from './utils/connection.js';
import { loadKeypair } from './utils/keypair.js';

async function example() {
  try {
    // Initialize connection
    const connection = createConnection();
    const payer = loadKeypair();

    console.log('Example: Token-22 Creation');
    console.log('Payer:', payer.publicKey.toBase58());
    console.log('Network:', connection.rpcEndpoint);

    // Check balance
    const balance = await connection.getBalance(payer.publicKey);
    console.log(`Balance: ${balance / 1e9} SOL`);

    // For actual token creation, use the CLI commands:
    // 1. spl-token --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb create-token --enable-metadata
    // 2. spl-token initialize-metadata <mint> <name> <symbol> <uri>
    // 3. spl-token create-account <mint>
    // 4. spl-token mint <mint> <amount>

    console.log('\nTo create a token, run:');
    console.log('npm run create-token -- --name "100xx" --symbol "100xxx" --amount 1000');

  } catch (error) {
    console.error('Error:', error);
  }
}

// Uncomment to run:
// example();

