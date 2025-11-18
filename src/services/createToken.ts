import {
  PublicKey,
  Transaction,
  SystemProgram,
  Keypair,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import {
  createInitializeMint2Instruction,
  getAssociatedTokenAddressSync,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
  TOKEN_2022_PROGRAM_ID,
  getMintLen,
  ExtensionType,
  createInitializeMetadataPointerInstruction,
} from '@solana/spl-token';
import { createInitializeInstruction } from '@solana/spl-token-metadata';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';

export interface CreateTokenResult {
  success: boolean;
  mintAddress?: string;
  signature?: string;
  error?: string;
  metadataInitCommand?: string;
  metadataInitialized?: boolean;
  metadataError?: string;
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

      // For Token-2022, InitializeMint2 validates account size strictly
      // We must create the mint with EXACTLY the size returned by getMintLen()
      // Metadata will be initialized separately and will handle account reallocation
      
      // Calculate mint length with ONLY MetadataPointer extension
      const extensions = [ExtensionType.MetadataPointer];
      const mintLen = getMintLen(extensions);
      
      // Calculate rent for the base mint account
      const mintRentExemptBalance = await connection.getMinimumBalanceForRentExemption(mintLen);
      const mintLamports = mintRentExemptBalance + 50000;
      
      console.log('Mint account size (with MetadataPointer extension):', mintLen, 'bytes');
      console.log('Mint rent:', mintRentExemptBalance / 1e9, 'SOL');

      // Transaction 1: Create and initialize mint with MetadataPointer extension
      // This matches the behavior of spl-token create-token --enable-metadata
      const createTransaction = new Transaction();
      
      // Step 1: Create mint account with EXACT size for MetadataPointer extension
      createTransaction.add(
        SystemProgram.createAccount({
          fromPubkey: publicKey,
          newAccountPubkey: mintPublicKey,
          space: mintLen,
          lamports: mintLamports,
          programId: TOKEN_2022_PROGRAM_ID,
        })
      );
      
      // Step 2: Initialize MetadataPointer extension FIRST (before mint initialization)
      createTransaction.add(
        createInitializeMetadataPointerInstruction(
          mintPublicKey,
          publicKey, // metadata authority
          null, // metadata account (null initially, will point to mint after metadata init)
          TOKEN_2022_PROGRAM_ID
        )
      );
      
      // Step 3: Initialize mint (after extensions are initialized)
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

      // Transaction 2: Initialize metadata separately
      // The metadata initialization will handle reallocating the account
      console.log('📝 Initializing metadata on-chain...');
      
      let metadataInitialized = false;
      let metadataError: string | undefined = undefined;
      const metadataInitCommand = `npm run initialize-metadata -- ${mintPublicKey.toBase58()} "${name}" "${symbol}" "${uri}"`;

      try {
        if (!signTransaction) {
          throw new Error('Wallet does not support signing transactions');
        }

        // Create metadata initialization instruction
        // This will reallocate the mint account to add metadata TLV
        const metadataInstruction = createInitializeInstruction({
          programId: TOKEN_2022_PROGRAM_ID,
          metadata: mintPublicKey, // Metadata account is the mint itself
          updateAuthority: publicKey,
          mint: mintPublicKey,
          mintAuthority: publicKey,
          name,
          symbol,
          uri,
        });

        const metadataTransaction = new Transaction().add(metadataInstruction);
        const {
          blockhash: metadataBlockhash,
          lastValidBlockHeight: metadataLastValidBlockHeight,
        } = await connection.getLatestBlockhash('confirmed');
        metadataTransaction.recentBlockhash = metadataBlockhash;
        metadataTransaction.feePayer = publicKey;

        // Sign and send metadata initialization transaction
        const signedMetadataTransaction = await signTransaction(metadataTransaction);
        const metadataSignature = await connection.sendRawTransaction(
          signedMetadataTransaction.serialize(),
          { 
            maxRetries: 3,
            skipPreflight: false,
          }
        );

        await connection.confirmTransaction({
          signature: metadataSignature,
          blockhash: metadataBlockhash,
          lastValidBlockHeight: metadataLastValidBlockHeight,
        }, 'confirmed');

        console.log('✅ Metadata initialized successfully');
        console.log(`   Metadata transaction: ${metadataSignature}`);
        metadataInitialized = true;
      } catch (error: any) {
        metadataError = error?.message || 'Failed to initialize metadata';
        console.error('❌ Metadata initialization error:', metadataError);
        
        if (error.logs && Array.isArray(error.logs)) {
          console.error('Transaction logs:', error.logs);
        }
        
        console.log('📝 You can still initialize metadata manually using:');
        console.log(`   ${metadataInitCommand}`);
      }
      
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
      
      // Return success with the mint address and metadata initialization status
      return {
        success: true,
        mintAddress: mintPublicKey.toBase58(),
        signature: signature, // Return the creation transaction signature
        metadataInitCommand: metadataInitCommand, // Command to initialize metadata (fallback)
        metadataInitialized: metadataInitialized, // Whether metadata was initialized successfully
        metadataError: metadataError, // Error message if metadata initialization failed
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

