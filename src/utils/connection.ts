import { Connection, PublicKey } from '@solana/web3.js';
import { TOKEN_2022_PROGRAM_ID } from '@solana/spl-token';

export const TOKEN_2022_PROGRAM = TOKEN_2022_PROGRAM_ID;

export function createConnection(rpcUrl?: string): Connection {
  const url = rpcUrl || process.env.RPC_URL || 'https://api.devnet.solana.com';
  return new Connection(url, 'confirmed');
}

export function getPublicKey(address: string): PublicKey {
  try {
    return new PublicKey(address);
  } catch (error) {
    throw new Error(`Invalid public key address: ${address}`);
  }
}

