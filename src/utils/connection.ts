import { Connection, PublicKey } from '@solana/web3.js';
import { TOKEN_2022_PROGRAM_ID } from '@solana/spl-token';

export const TOKEN_2022_PROGRAM = TOKEN_2022_PROGRAM_ID;

export type Network = 'devnet' | 'mainnet-beta' | 'mainnet';

export function createConnection(rpcUrl?: string, network?: Network): Connection {
  let url: string;
  
  if (rpcUrl) {
    url = rpcUrl;
  } else if (process.env.RPC_URL) {
    url = process.env.RPC_URL;
  } else if (network === 'mainnet' || network === 'mainnet-beta') {
    url = process.env.RPC_URL_MAINNET || 'https://api.mainnet-beta.solana.com';
  } else {
    url = process.env.RPC_URL_DEVNET || 'https://api.devnet.solana.com';
  }
  
  return new Connection(url, 'confirmed');
}

export function getPublicKey(address: string): PublicKey {
  try {
    return new PublicKey(address);
  } catch (error) {
    throw new Error(`Invalid public key address: ${address}`);
  }
}

