#!/usr/bin/env node

import { execSync } from 'child_process';

const args = process.argv.slice(2);

if (args.length < 4) {
  console.error(`
Usage: npm run initialize-metadata -- <mint-address> <name> <symbol> <metadata-uri>

Example:
  npm run initialize-metadata -- pXfZ6Hg2s78m1iSRVsdzos9TmfkqkQdv5MmQrr77ZQK "100xx" "100xxx" "https://cdn.100xdevs.com/metadata.json"
  `);
  process.exit(1);
}

const [mintAddress, name, symbol, metadataUri] = args;

try {
  console.log('📝 Initializing metadata...');
  console.log(`Mint: ${mintAddress}`);
  console.log(`Name: ${name}`);
  console.log(`Symbol: ${symbol}`);
  console.log(`URI: ${metadataUri}\n`);

  const cmd = `spl-token initialize-metadata ${mintAddress} "${name}" "${symbol}" "${metadataUri}"`;
  execSync(cmd, { encoding: 'utf-8', stdio: 'inherit' });
  
  console.log('\n✅ Metadata initialized successfully!');
} catch (error: unknown) {
  const err = error as { message?: string };
  console.error('❌ Error initializing metadata:', err.message || String(error));
  process.exit(1);
}

