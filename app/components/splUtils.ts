// app/components/splUtils.ts
"use client";

import {
  Connection,
  PublicKey,
  Keypair,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";

import {
  createInitializeMintInstruction,
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress,
  createMintToInstruction,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

/**
 * Create Mint using the connected wallet (no airdrop needed)
 */
export async function createMintWithWallet(
  connection: Connection,
  walletPublicKey: PublicKey,
  sendTransaction: (tx: Transaction, conn: Connection) => Promise<string>
) {
  const mintKeypair = Keypair.generate();
  const mintPubkey = mintKeypair.publicKey;

  const mintSize = 82;
  const lamports = await connection.getMinimumBalanceForRentExemption(mintSize);

  // Create mint account instruction
  const createIx = SystemProgram.createAccount({
    fromPubkey: walletPublicKey,
    newAccountPubkey: mintPubkey,
    space: mintSize,
    lamports,
    programId: TOKEN_PROGRAM_ID,
  });

  // Initialize mint instruction
  const initIx = createInitializeMintInstruction(
    mintPubkey,
    6,               // decimals
    walletPublicKey, // mint authority
    walletPublicKey  // freeze authority
  );

  const tx = new Transaction().add(createIx, initIx);

  // REQUIRED: manually set blockhash + fee payer BEFORE partialSign
  const { blockhash } = await connection.getLatestBlockhash("finalized");

  tx.recentBlockhash = blockhash;
  tx.feePayer = walletPublicKey;

  // PARTIAL SIGN (only mint keypair signs here)
  tx.partialSign(mintKeypair);

  // Wallet signs the payer part
  const sig = await sendTransaction(tx, connection);
  await connection.confirmTransaction(sig, "confirmed");

  return { mintPubkey, mintTxSig: sig };
}

/**
 * Mint initial tokens to wallet
 */
export async function mintInitialWithWallet(
  connection: Connection,
  mintPubkey: PublicKey,
  owner: PublicKey,
  amountRaw: number,
  sendTransaction: (tx: Transaction, conn: Connection) => Promise<string>
) {
  const ata = await getAssociatedTokenAddress(mintPubkey, owner);

  const ataIx = createAssociatedTokenAccountInstruction(
    owner, // payer
    ata,
    owner,
    mintPubkey
  );

  const mintIx = createMintToInstruction(
    mintPubkey,
    ata,
    owner,  // mint authority
    amountRaw
  );

  const tx = new Transaction().add(ataIx, mintIx);

  const { blockhash } = await connection.getLatestBlockhash("finalized");
  tx.recentBlockhash = blockhash;
  tx.feePayer = owner;

  const sig = await sendTransaction(tx, connection);
  await connection.confirmTransaction(sig, "confirmed");

  return { ata, mintToSig: sig };
}
export async function mintToWallet(
  connection: Connection,
  walletPubkey: PublicKey,
  mintPubkey: PublicKey,
  amountRaw: number,
  sendTransaction: (tx: Transaction, conn: Connection) => Promise<string>
) {
  const ata = await getAssociatedTokenAddress(mintPubkey, walletPubkey);

  const tx = new Transaction();

  // Create ATA only if it doesn't exist
  const ataInfo = await connection.getAccountInfo(ata);
  if (!ataInfo) {
    tx.add(
      createAssociatedTokenAccountInstruction(
        walletPubkey,
        ata,
        walletPubkey,
        mintPubkey
      )
    );
  }

  // Mint tokens
  tx.add(
    createMintToInstruction(
      mintPubkey,
      ata,
      walletPubkey, // mint authority
      amountRaw
    )
  );

  const { blockhash } = await connection.getLatestBlockhash("finalized");
  tx.recentBlockhash = blockhash;
  tx.feePayer = walletPubkey;

  const sig = await sendTransaction(tx, connection);
  await connection.confirmTransaction(sig, "confirmed");

  return { ata, sig };
}
