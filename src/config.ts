export const config = {
  // Replace with your actual USDT mint address
  USDT_MINT_ADDRESS: import.meta.env.VITE_USDT_MINT_ADDRESS || 'pXfZ6Hg2s78m1iSRVsdzos9TmfkqkQdv5MmQrr77ZQK',
  RPC_URL_DEVNET: import.meta.env.VITE_RPC_URL_DEVNET || 'https://api.devnet.solana.com',
  RPC_URL_MAINNET: import.meta.env.VITE_RPC_URL_MAINNET || 'https://api.mainnet-beta.solana.com',
  TOKEN_2022_PROGRAM_ID: 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb',
} as const;

