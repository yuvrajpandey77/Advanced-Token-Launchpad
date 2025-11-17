import {
  PublicKey,
  Transaction,
} from '@solana/web3.js';
import {
  getAssociatedTokenAddressSync,
  createAssociatedTokenAccountInstruction,
  getAccount,
  TOKEN_2022_PROGRAM_ID,
  createMintToInstruction,
  getMint,
} from '@solana/spl-token';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { config } from '@/config.ts';

export interface MintResult {
  success: boolean;
  signature?: string;
  error?: string;
}

export interface MintTokenOptions {
  mintAddress: string;
  amount: number;
  recipientAddress?: string; // Optional, defaults to connected wallet
}

export const useMintToken = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const mintToken = async (options: MintTokenOptions): Promise<MintResult> => {
    if (!publicKey) {
      return { success: false, error: 'Wallet not connected' };
    }

    try {
      const { mintAddress, amount, recipientAddress } = options;

      // Parse mint address
      let mintPublicKey: PublicKey;
      try {
        mintPublicKey = new PublicKey(mintAddress);
      } catch {
        return { success: false, error: 'Invalid mint address' };
      }

      // Parse recipient address (default to connected wallet)
      let recipientPubkey: PublicKey;
      if (recipientAddress) {
        try {
          recipientPubkey = new PublicKey(recipientAddress);
        } catch {
          return { success: false, error: 'Invalid recipient address' };
        }
      } else {
        recipientPubkey = publicKey;
      }

      // Get mint info to verify mint authority and get decimals
      let mintInfo;
      try {
        mintInfo = await getMint(connection, mintPublicKey, 'confirmed', TOKEN_2022_PROGRAM_ID);
      } catch (error) {
        return { 
          success: false, 
          error: `Failed to fetch mint information: ${error instanceof Error ? error.message : 'Unknown error'}. Make sure the mint address is correct and is a Token-2022 mint.` 
        };
      }

      // Verify the connected wallet is the mint authority
      if (!mintInfo.mintAuthority) {
        return { 
          success: false, 
          error: 'This token has no mint authority. Minting is disabled.' 
        };
      }

      if (!mintInfo.mintAuthority.equals(publicKey)) {
        return { 
          success: false, 
          error: `You are not the mint authority for this token. Mint authority: ${mintInfo.mintAuthority.toBase58()}, Your wallet: ${publicKey.toBase58()}` 
        };
      }

      const decimals = mintInfo.decimals;

      // Get or create associated token account for recipient
      const associatedTokenAddress = getAssociatedTokenAddressSync(
        mintPublicKey,
        recipientPubkey,
        false,
        TOKEN_2022_PROGRAM_ID
      );

      const transaction = new Transaction();

      // Check if recipient's ATA exists
      try {
        await getAccount(connection, associatedTokenAddress, 'confirmed', TOKEN_2022_PROGRAM_ID);
      } catch (error) {
        // ATA doesn't exist, create it
        // The payer (publicKey) pays for the ATA creation
        transaction.add(
          createAssociatedTokenAccountInstruction(
            publicKey, // payer
            associatedTokenAddress, // ata
            recipientPubkey, // owner (recipient)
            mintPublicKey, // mint
            TOKEN_2022_PROGRAM_ID
          )
        );
      }

      // Add mint instruction
      const mintAmount = BigInt(Math.floor(amount * 10 ** decimals));
      if (mintAmount <= 0n) {
        return { success: false, error: 'Amount must be greater than 0' };
      }

      transaction.add(
        createMintToInstruction(
          mintPublicKey, // mint
          associatedTokenAddress, // destination (recipient's ATA)
          publicKey, // mint authority (must be connected wallet)
          mintAmount, // amount
          [], // multiSigners (empty since authority is a single signer)
          TOKEN_2022_PROGRAM_ID
        )
      );

      // Get recent blockhash
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      // Send transaction
      const signature = await sendTransaction(transaction, connection, {
        skipPreflight: false,
        maxRetries: 3,
        preflightCommitment: 'confirmed',
      });

      // Wait for confirmation
      await connection.confirmTransaction(
        { signature, blockhash, lastValidBlockHeight },
        'confirmed'
      );

      return { success: true, signature };
    } catch (error: unknown) {
      const err = error as Error;
      let errorMessage = err.message || 'Failed to mint tokens';
      
      // Provide more helpful error messages
      if (errorMessage.includes('0x1')) {
        errorMessage = 'Insufficient funds for transaction fees';
      } else if (errorMessage.includes('0x2')) {
        errorMessage = 'Invalid mint authority or insufficient permissions';
      } else if (errorMessage.includes('User rejected') || errorMessage.includes('user rejected')) {
        errorMessage = 'Transaction was cancelled';
      }
      
      return { success: false, error: errorMessage };
    }
  };

  return { mintToken };
};

// Keep the old hook for backward compatibility
export const useMintUSDT = () => {
  const { mintToken } = useMintToken();
  const { connection } = useConnection();
  const { publicKey } = useWallet();

  const mintUSDT = async (amount: number, mintAuthority: PublicKey) => {
    if (!publicKey) {
      return { success: false, error: 'Wallet not connected' };
    }

    // Verify mint authority matches connected wallet
    if (!mintAuthority.equals(publicKey)) {
      return { 
        success: false, 
        error: 'Mint authority must match your connected wallet address.' 
      };
    }

    // Use the default USDT mint address from config
    return mintToken({
      mintAddress: config.USDT_MINT_ADDRESS,
      amount,
      recipientAddress: publicKey.toBase58(),
    });
  };

  return { mintUSDT };
};

