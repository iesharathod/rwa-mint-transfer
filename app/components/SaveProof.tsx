// app/components/SaveProof.tsx
"use client";

import React, { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection, Transaction, TransactionInstruction, PublicKey } from "@solana/web3.js";

export default function SaveProof() {
  const { publicKey, sendTransaction, connected } = useWallet();
  const [hash, setHash] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  const MEMO_PROGRAM_ID = new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr");

  const handleSave = async () => {
    if (!connected || !publicKey) return alert("Connect wallet first");
    if (!hash) return alert("Enter proof hash (IPFS CID / SHA256)");

    try {
      setStatus("Building transaction...");
      const connection = new Connection("https://api.devnet.solana.com");

      const data = Buffer.from(hash, "utf8");
      const ix = new TransactionInstruction({
        keys: [],
        programId: MEMO_PROGRAM_ID,
        data,
      });

      const tx = new Transaction().add(ix);
      const { blockhash } = await connection.getLatestBlockhash("finalized");
      tx.recentBlockhash = blockhash;
      tx.feePayer = publicKey;

      setStatus("Requesting signature in wallet...");
      const sig = await sendTransaction(tx, connection);
      await connection.confirmTransaction(sig, "confirmed");

      setStatus(`Saved proof in tx ${sig}`);
    } catch (err: any) {
      console.error(err);
      setStatus("Error: " + (err?.message ?? String(err)));
    }
  };

  return (
    <div style={{ marginTop: 18 }}>
      <label style={{ display: "block", marginBottom: 6 }}>Proof hash (IPFS CID / SHA256)</label>
      <input
        value={hash}
        onChange={(e) => setHash(e.target.value)}
        placeholder="bafy... or sha256:..."
        style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #334155" }}
      />
      <button onClick={handleSave} style={{ marginTop: 8, padding: "8px 12px", background: "#10b981", color: "#fff", borderRadius: 6 }}>
        Save Proof On-Chain (Memo)
      </button>
      {status && <div style={{ marginTop: 8 }}>{status}</div>}
    </div>
  );
}
