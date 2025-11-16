export interface TokenMetadata {
  name: string;
  symbol: string;
  description: string;
  image: string;
}

export interface TokenConfig {
  name: string;
  symbol: string;
  metadataUri: string;
  decimals?: number;
  amount?: number;
}

export interface TokenCreationResult {
  mintAddress: string;
  transactionSignature: string;
}

