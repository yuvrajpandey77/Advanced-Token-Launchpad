#!/usr/bin/env node

import { Connection, Keypair, PublicKey, Transaction, sendAndConfirmTransaction } from '@solana/web3.js';
import {
  getAssociatedTokenAddressSync,
  createAssociatedTokenAccountInstruction,
  getAccount,
  TOKEN_2022_PROGRAM_ID,
  createMintToInstruction,
  getMint,
} from '@solana/spl-token';
import { readFileSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

const args = process.argv.slice(2);

if (args.length < 3) {
  console.error(`
Usage: tsx src/sendTokens.ts <mint-address> <amount> <recipient-address> [rpc-url]

Arguments:
  <mint-address>      The token mint address
  <amount>            Amount to send
  <recipient-address> Address to send tokens to
  [rpc-url]           Optional: RPC URL (defaults to devnet)

Examples:
  tsx src/sendTokens.ts pXfZ6Hg2s78m1iSRVsdzos9TmfkqkQdv5MmQrr77ZQK 1000 5fDouaPirsm7g5BXvMECS2Jb7iKkbHdRmnufZ4nzE7bM
  `);
  process.exit(1);
}

const [mintAddress, amount, recipientAddress, rpcUrl] = args;

async function sendTokens() {
  try {
    console.log('📝 Sending tokens...');
    console.log(`Mint: ${mintAddress}`);
    console.log(`Amount: ${amount}`);
    console.log(`Recipient: ${recipientAddress}`);
    console.log();

    // Load keypair from default location
    const keypairPath = join(homedir(), '.config', 'solana', 'id.json');
    const keypairData = JSON.parse(readFileSync(keypairPath, 'utf-8'));
    const payer = Keypair.fromSecretKey(Uint8Array.from(keypairData));

    console.log(`Payer: ${payer.publicKey.toBase58()}`);

    // Connect to RPC
    const connection = new Connection(
      rpcUrl || 'https://api.devnet.solana.com',
      'confirmed'
    );

    // Parse addresses
    const mintPublicKey = new PublicKey(mintAddress);
    const recipientPubkey = new PublicKey(recipientAddress);

    // Get mint info
    const mintInfo = await getMint(connection, mintPublicKey, 'confirmed', TOKEN_2022_PROGRAM_ID);
    console.log(`Mint decimals: ${mintInfo.decimals}`);
    console.log(`Mint authority: ${mintInfo.mintAuthority?.toBase58() || 'None'}`);

    // Verify mint authority
    if (!mintInfo.mintAuthority) {
      throw new Error('This token has no mint authority. Minting is disabled.');
    }

    if (!mintInfo.mintAuthority.equals(payer.publicKey)) {
      throw new Error(`You are not the mint authority. Mint authority: ${mintInfo.mintAuthority.toBase58()}`);
    }

    // Get recipient's ATA
    const associatedTokenAddress = getAssociatedTokenAddressSync(
      mintPublicKey,
      recipientPubkey,
      false,
      TOKEN_2022_PROGRAM_ID
    );

    console.log(`Recipient ATA: ${associatedTokenAddress.toBase58()}`);

    const transaction = new Transaction();

    // Check if recipient's ATA exists
    try {
      await getAccount(connection, associatedTokenAddress, 'confirmed', TOKEN_2022_PROGRAM_ID);
      console.log('✅ Recipient ATA already exists');
    } catch (error) {
      // ATA doesn't exist, create it
      console.log('📝 Creating recipient ATA...');
      transaction.add(
        createAssociatedTokenAccountInstruction(
          payer.publicKey, // payer
          associatedTokenAddress, // ata
          recipientPubkey, // owner (recipient)
          mintPublicKey, // mint
          TOKEN_2022_PROGRAM_ID
        )
      );
    }

    // Add mint instruction
    const decimals = mintInfo.decimals;
    const mintAmount = BigInt(Math.floor(parseFloat(amount) * 10 ** decimals));
    
    if (mintAmount <= 0n) {
      throw new Error('Amount must be greater than 0');
    }

    console.log(`Minting ${amount} tokens (${mintAmount} base units)`);
    transaction.add(
      createMintToInstruction(
        mintPublicKey, // mint
        associatedTokenAddress, // destination (recipient's ATA)
        payer.publicKey, // mint authority
        mintAmount, // amount
        [], // multiSigners
        TOKEN_2022_PROGRAM_ID
      )
    );

    // Send and confirm transaction
    console.log('📤 Sending transaction...');
    const signature = await sendAndConfirmTransaction(
      connection,
      transaction,
      [payer],
      { commitment: 'confirmed' }
    );

    console.log('\n✅ Tokens sent successfully!');
    console.log(`Transaction signature: ${signature}`);
    console.log(`View on Solscan: https://solscan.io/tx/${signature}?cluster=devnet`);
  } catch (error: unknown) {
    const err = error as Error;
    console.error('\n❌ Error sending tokens:', err.message);
    process.exit(1);
  }
}

sendTokens();

