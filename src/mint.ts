#!/usr/bin/env node

import { execSync } from 'child_process';

const args = process.argv.slice(2);

if (args.length < 2) {
  console.error(`
Usage: npm run mint -- <mint-address> <amount> [recipient-address]

Arguments:
  <mint-address>      The token mint address
  <amount>            Amount to mint
  [recipient-address] Optional: Address to mint to (defaults to your wallet's ATA)

Examples:
  npm run mint -- pXfZ6Hg2s78m1iSRVsdzos9TmfkqkQdv5MmQrr77ZQK 1000
  npm run mint -- pXfZ6Hg2s78m1iSRVsdzos9TmfkqkQdv5MmQrr77ZQK 1000 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU
  `);
  process.exit(1);
}

const [mintAddress, amount, recipientAddress] = args;

try {
  console.log('📝 Minting tokens...');
  console.log(`Mint: ${mintAddress}`);
  console.log(`Amount: ${amount}`);
  if (recipientAddress) {
    console.log(`Recipient: ${recipientAddress}`);
  }
  console.log();

  const cmd = recipientAddress 
    ? `spl-token mint ${mintAddress} ${amount} ${recipientAddress}`
    : `spl-token mint ${mintAddress} ${amount}`;
  
  execSync(cmd, { encoding: 'utf-8', stdio: 'inherit' });
  
  console.log('\n✅ Tokens minted successfully!');
} catch (error: unknown) {
  const err = error as { message?: string };
  console.error('❌ Error minting tokens:', err.message || String(error));
  process.exit(1);
}

