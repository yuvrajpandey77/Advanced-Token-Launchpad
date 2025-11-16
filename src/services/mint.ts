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
} from '@solana/spl-token';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { config } from '@/config';

export interface MintResult {
  success: boolean;
  signature?: string;
  error?: string;
}

export const useMintUSDT = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const mintUSDT = async (amount: number, mintAuthority: PublicKey): Promise<MintResult> => {
    if (!publicKey) {
      return { success: false, error: 'Wallet not connected' };
    }

    try {
      const mintPublicKey = new PublicKey(config.USDT_MINT_ADDRESS);
      const decimals = 9; // Adjust based on your token decimals

      // Get or create associated token account
      const associatedTokenAddress = getAssociatedTokenAddressSync(
        mintPublicKey,
        publicKey,
        false,
        TOKEN_2022_PROGRAM_ID
      );

      const transaction = new Transaction();

      // Check if ATA exists
      try {
        await getAccount(connection, associatedTokenAddress, 'confirmed', TOKEN_2022_PROGRAM_ID);
      } catch (error) {
        // ATA doesn't exist, create it
        transaction.add(
          createAssociatedTokenAccountInstruction(
            publicKey,
            associatedTokenAddress,
            publicKey,
            mintPublicKey,
            TOKEN_2022_PROGRAM_ID
          )
        );
      }

      // Add mint instruction
      const mintAmount = BigInt(amount * 10 ** decimals);
      transaction.add(
        createMintToInstruction(
          mintPublicKey,
          associatedTokenAddress,
          mintAuthority, // mint authority
          mintAmount,
          [],
          TOKEN_2022_PROGRAM_ID
        )
      );

      // Get recent blockhash
      const { blockhash } = await connection.getLatestBlockhash('confirmed');
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      // Send transaction
      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, 'confirmed');

      return { success: true, signature };
    } catch (error: unknown) {
      const err = error as Error;
      return { success: false, error: err.message || 'Failed to mint tokens' };
    }
  };

  return { mintUSDT };
};

