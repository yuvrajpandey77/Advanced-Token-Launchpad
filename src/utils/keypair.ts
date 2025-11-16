import { Keypair } from '@solana/web3.js';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export function loadKeypair(): Keypair {
  // Try to load from environment variable first
  const privateKey = process.env.WALLET_PRIVATE_KEY;
  if (privateKey) {
    try {
      // Try parsing as JSON array first
      const keyArray = JSON.parse(privateKey);
      if (Array.isArray(keyArray)) {
        return Keypair.fromSecretKey(Uint8Array.from(keyArray));
      }
    } catch {
      // Not JSON, continue to other formats
    }
    
    try {
      // Try as base64
      return Keypair.fromSecretKey(Buffer.from(privateKey, 'base64'));
    } catch {
      throw new Error('Invalid private key format. Use JSON array or base64.');
    }
  }

  // Try to load from keypair file
  const defaultPath = path.join(os.homedir(), '.config', 'solana', 'id.json');
  const keypairPath = process.env.KEYPAIR_PATH || defaultPath;
  const expandedPath = keypairPath.startsWith('~') 
    ? keypairPath.replace('~', os.homedir())
    : keypairPath;
  
  if (fs.existsSync(expandedPath)) {
    try {
      const keypairData = JSON.parse(fs.readFileSync(expandedPath, 'utf-8'));
      return Keypair.fromSecretKey(Uint8Array.from(keypairData));
    } catch (error) {
      throw new Error(`Failed to load keypair from ${expandedPath}: ${error}`);
    }
  }

  throw new Error(
    'No keypair found. Set WALLET_PRIVATE_KEY env var or KEYPAIR_PATH to your keypair file.'
  );
}

