#!/usr/bin/env node

import { execSync } from 'child_process';

const args = process.argv.slice(2);

if (args.length < 2) {
  console.error(`
Usage: npm run update-metadata -- <mint-address> <metadata-uri>

Example:
  npm run update-metadata -- G5YTNnqsXtwnFKiJzYbUTXtgthnHDBdSjkBd57Ptb3bs https://example.com/metadata.json
  `);
  process.exit(1);
}

const [mintAddress, metadataUri] = args;

try {
  console.log('📝 Updating token metadata URI...');
  console.log(`Mint: ${mintAddress}`);
  console.log(`New Metadata URI: ${metadataUri}\n`);

  const cmd = `spl-token update-metadata ${mintAddress} uri "${metadataUri}"`;
  execSync(cmd, { encoding: 'utf-8', stdio: 'inherit' });
  
  console.log('\n✅ Metadata URI updated successfully!');
} catch (error: unknown) {
  const err = error as { message?: string };
  console.error('❌ Error updating metadata:', err.message || String(error));
  process.exit(1);
}

