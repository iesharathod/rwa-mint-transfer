// app/components/MintButton.tsx
"use client";

import React, { useState } from "react";
import { Connection } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import { createMintWithWallet, mintInitialWithWallet } from "./splUtils";

export default function MintButton() {
  const { publicKey, sendTransaction } = useWallet();
  const [status, setStatus] = useState<string | null>(null);
  const [mintAddr, setMintAddr] = useState<string | null>(null);

  async function handleCreateAndMint() {
    if (!publicKey) return alert("Connect wallet first");

    const connection = new Connection("https://api.devnet.solana.com");

    try {
      setStatus("Creating mint using your wallet...");

      // 1) Create mint
      const { mintPubkey, mintTxSig } = await createMintWithWallet(
        connection,
        publicKey,
        sendTransaction
      );

      setMintAddr(mintPubkey.toBase58());
      setStatus(`Mint created: ${mintPubkey.toBase58()} (tx: ${mintTxSig})`);

      // 2) Mint initial supply: 1000 tokens
      setStatus("Minting 1000 tokens to your wallet...");

      const decimals = 6;
      const rawAmount = 1000 * 10 ** decimals;

      const { ata, mintToSig } = await mintInitialWithWallet(
        connection,
        mintPubkey,
        publicKey,
        rawAmount,
        sendTransaction
      );

      setStatus(`Minted to ATA ${ata.toBase58()} — tx: ${mintToSig}`);
    } catch (err: any) {
      console.error(err);
      setStatus("Error: " + err?.message);
    }
  }

  return (
    <div style={{ marginTop: 20 }}>
      <button
        onClick={handleCreateAndMint}
        style={{ padding: "8px 14px", background: "#2563eb", color: "#fff", borderRadius: 8 }}
      >
        Create & Mint RWA Token
      </button>

      {status && <div style={{ marginTop: 8, color: "#ddd" }}>{status}</div>}
      {mintAddr && (
        <div style={{ marginTop: 8 }}>
          Mint Address: <code>{mintAddr}</code>
        </div>
      )}
    </div>
  );
}
