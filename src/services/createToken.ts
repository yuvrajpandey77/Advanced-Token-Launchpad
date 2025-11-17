import {
  PublicKey,
  Transaction,
  SystemProgram,
  Keypair,
} from '@solana/web3.js';
import {
  createInitializeMint2Instruction,
  getAssociatedTokenAddressSync,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
  TOKEN_2022_PROGRAM_ID,
  getMintLen,
} from '@solana/spl-token';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';

export interface CreateTokenResult {
  success: boolean;
  mintAddress?: string;
  signature?: string;
  error?: string;
}

export interface CreateTokenOptions {
  name: string;
  symbol: string;
  uri: string;
  decimals?: number;
  initialSupply?: number;
}

// Default USDT metadata
export const DEFAULT_USDT_METADATA = {
  name: 'Tether USD',
  symbol: 'USDT',
  description: 'Tether USD (USDT) is a stablecoin pegged to the US Dollar.',
  image: 'https://assets.coingecko.com/coins/images/325/large/Tether-logo.png',
};

export const useCreateToken = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction, signTransaction } = useWallet();

  const createToken = async (options: CreateTokenOptions): Promise<CreateTokenResult> => {
    if (!publicKey) {
      return { success: false, error: 'Wallet not connected' };
    }

    try {
      const {
        name,
        symbol,
        uri,
        decimals = 9,
        initialSupply = 0,
      } = options;

      // Generate a new keypair for the mint
      const mintKeypair = Keypair.generate();
      const mintPublicKey = mintKeypair.publicKey;

      // Calculate base mint length (no extensions)
      const baseMintLen = getMintLen([]);
      
      // Calculate rent for the mint account
      const mintRentExemptBalance = await connection.getMinimumBalanceForRentExemption(baseMintLen);
      const mintLamports = mintRentExemptBalance + 50000;
      
      console.log('Mint account size:', baseMintLen, 'bytes');
      console.log('Mint rent:', mintRentExemptBalance / 1e9, 'SOL');

      // Single transaction: Create and initialize mint
      const createTransaction = new Transaction();
      
      // Create mint account
      createTransaction.add(
        SystemProgram.createAccount({
          fromPubkey: publicKey,
          newAccountPubkey: mintPublicKey,
          space: baseMintLen,
          lamports: mintLamports,
          programId: TOKEN_2022_PROGRAM_ID,
        })
      );
      
      // Initialize mint
      createTransaction.add(
        createInitializeMint2Instruction(
          mintPublicKey,
          decimals,
          publicKey,
          null,
          TOKEN_2022_PROGRAM_ID
        )
      );
      
      // Sign and send transaction
      const { blockhash, lastValidBlockHeight } = 
        await connection.getLatestBlockhash('confirmed');
      createTransaction.recentBlockhash = blockhash;
      createTransaction.feePayer = publicKey;
      createTransaction.partialSign(mintKeypair);
      
      if (!signTransaction) {
        throw new Error('Wallet does not support signing transactions');
      }
      
      const signedTransaction = await signTransaction(createTransaction);
      const signature = await connection.sendRawTransaction(
        signedTransaction.serialize(),
        { maxRetries: 3 }
      );
      
      await connection.confirmTransaction(
        { signature, blockhash, lastValidBlockHeight },
        'confirmed'
      );
      
      console.log('✅ Token mint created successfully');
      
      // Handle initial supply in a third transaction if needed
      if (initialSupply > 0) {
        const supplyTransaction = new Transaction();
        const associatedTokenAddress = getAssociatedTokenAddressSync(
          mintPublicKey,
          publicKey,
          false,
          TOKEN_2022_PROGRAM_ID
        );
        
        supplyTransaction.add(
          createAssociatedTokenAccountInstruction(
            publicKey,
            associatedTokenAddress,
            publicKey,
            mintPublicKey,
            TOKEN_2022_PROGRAM_ID
          )
        );
        
        const mintAmount = BigInt(Math.floor(initialSupply * 10 ** decimals));
        if (mintAmount > 0n) {
          supplyTransaction.add(
            createMintToInstruction(
              mintPublicKey,
              associatedTokenAddress,
              publicKey,
              mintAmount,
              [],
              TOKEN_2022_PROGRAM_ID
            )
          );
        }
        
        const { blockhash: blockhash3, lastValidBlockHeight: lastValidBlockHeight3 } = 
          await connection.getLatestBlockhash('confirmed');
        supplyTransaction.recentBlockhash = blockhash3;
        supplyTransaction.feePayer = publicKey;
        
        const signedSupplyTransaction = await signTransaction(supplyTransaction);
        const supplySignature = await connection.sendRawTransaction(
          signedSupplyTransaction.serialize(),
          { maxRetries: 3 }
        );
        
        await connection.confirmTransaction(
          { signature: supplySignature, blockhash: blockhash3, lastValidBlockHeight: lastValidBlockHeight3 },
          'confirmed'
        );
      }
      
      // Return success with the mint address
      return {
        success: true,
        mintAddress: mintPublicKey.toBase58(),
        signature: signature, // Return the creation transaction signature
      };
    } catch (error: unknown) {
      const err = error as any;
      let errorMessage = err.message || 'Failed to create token';
      
      // Try to get more details from SendTransactionError
      if (err.logs && Array.isArray(err.logs)) {
        console.error('Transaction logs:', err.logs);
        // Look for specific error messages in logs
        const errorLogs = err.logs.filter((log: string) => 
          log.includes('Error') || log.includes('failed') || log.includes('Invalid')
        );
        if (errorLogs.length > 0) {
          errorMessage = `Transaction failed: ${errorLogs.join('; ')}`;
        }
      }
      
      // Provide more helpful error messages
      if (errorMessage.includes('0x1')) {
        errorMessage = 'Insufficient funds for transaction fees';
      } else if (errorMessage.includes('User rejected') || errorMessage.includes('user rejected')) {
        errorMessage = 'Transaction was cancelled by user';
      } else if (errorMessage.includes('Wallet does not support')) {
        errorMessage = 'Your wallet does not support signing transactions. Please try a different wallet.';
      } else if (errorMessage.includes('Unexpected error')) {
        errorMessage = 'Transaction failed. Please ensure you have enough SOL for fees and try again.';
      } else if (errorMessage.includes('InvalidAccountData') || errorMessage.includes('invalid account data')) {
        errorMessage = `Account initialization failed. This may be due to account size calculation issues. Please check the browser console for details. Error: ${errorMessage}`;
      } else if (errorMessage.includes('Simulation failed')) {
        // Extract more details from simulation error
        if (err.logs) {
          const simError = err.logs.find((log: string) => log.includes('Error') || log.includes('failed'));
          if (simError) {
            errorMessage = `Transaction simulation failed: ${simError}. Check console for full details.`;
          } else {
            errorMessage = 'Transaction simulation failed. Please check the browser console for detailed error logs.';
          }
        } else {
          errorMessage = 'Transaction simulation failed. Please check that you have enough SOL and try again.';
        }
      }
      
      console.error('Token creation error:', error);
      console.error('Error details:', {
        message: err.message,
        logs: err.logs,
        stack: err.stack,
      });
      
      return { success: false, error: errorMessage };
    }
  };

  return { createToken };
};

