"use client";

import React, { useState } from "react";
import { Connection, PublicKey } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import { createMintWithWallet, mintInitialWithWallet } from "./splUtils";

export default function AssetForm({ onCreated }: { onCreated?: (mint: string) => void }) {
  const { publicKey, sendTransaction } = useWallet();

  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [supply, setSupply] = useState("");

  const [status, setStatus] = useState("");

  async function handleCreate() {
    if (!publicKey) return alert("Connect wallet first");

    const connection = new Connection("https://api.devnet.solana.com");

    try {
      setStatus("Creating mint...");

      // 1️⃣ Create Mint
      const { mintPubkey } = await createMintWithWallet(
        connection,
        publicKey,
        sendTransaction
      );

      const mintAddress = mintPubkey.toBase58();

      // 2️⃣ Mint Tokens
      const amountRaw = Number(supply) * 10 ** 6;

      setStatus("Minting supply...");

      await mintInitialWithWallet(
        connection,
        mintPubkey,
        publicKey,
        amountRaw,
        sendTransaction
      );

      // 3️⃣ Store metadata into localStorage
      const meta = {
        name,
        symbol,
        description,
        image,
        mint: mintAddress,
        supply: Number(supply),
      };

      localStorage.setItem(`rwa-asset-${mintAddress}`, JSON.stringify(meta));

      setStatus("Asset created successfully!");
      if (onCreated) onCreated(mintAddress);
    } catch (err: any) {
      console.error(err);
      setStatus("Error: " + err.message);
    }
  }

  return (
    <div style={{ marginTop: 20, padding: 16, border: "1px solid #333", borderRadius: 8 }}>
      <h3>Create RWA Asset (no on-chain metadata)</h3>

      <input placeholder="Asset Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{ width: "100%", marginTop: 8, padding: 8 }}
      />

      <input placeholder="Symbol"
        value={symbol}
        onChange={(e) => setSymbol(e.target.value)}
        style={{ width: "100%", marginTop: 8, padding: 8 }}
      />

      <input placeholder="Image URL (optional)"
        value={image}
        onChange={(e) => setImage(e.target.value)}
        style={{ width: "100%", marginTop: 8, padding: 8 }}
      />

      <textarea placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        style={{ width: "100%", marginTop: 8, padding: 8, minHeight: 70 }}
      />

      <input placeholder="Total Supply"
        value={supply}
        onChange={(e) => setSupply(e.target.value)}
        style={{ width: "100%", marginTop: 8, padding: 8 }}
      />

      <button
        onClick={handleCreate}
        style={{
          marginTop: 12,
          padding: "10px 16px",
          background: "#2563eb",
          color: "#fff",
          borderRadius: 6
        }}
      >
        Create Asset
      </button>

      {status && <div style={{ marginTop: 8 }}>{status}</div>}
    </div>
  );
}
