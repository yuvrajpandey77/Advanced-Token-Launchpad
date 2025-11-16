#!/usr/bin/env node

import { execSync } from 'child_process';

const args = process.argv.slice(2);

if (args.length < 1) {
  console.error(`
Usage: npm run create-ata -- <mint-address>

Example:
  npm run create-ata -- pXfZ6Hg2s78m1iSRVsdzos9TmfkqkQdv5MmQrr77ZQK
  `);
  process.exit(1);
}

const mintAddress = args[0];

try {
  console.log('📝 Creating Associated Token Account (ATA)...');
  console.log(`Mint: ${mintAddress}\n`);

  const cmd = `spl-token create-account ${mintAddress}`;
  execSync(cmd, { encoding: 'utf-8', stdio: 'inherit' });
  
  console.log('\n✅ ATA created successfully!');
} catch (error: unknown) {
  const err = error as { message?: string };
  console.error('❌ Error creating ATA:', err.message || String(error));
  process.exit(1);
}

