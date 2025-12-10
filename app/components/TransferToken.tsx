// app/components/TransferToken.tsx
"use client";

import React, { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

export default function TransferToken({ mintAddress }: { mintAddress?: string | null }) {
  const { publicKey, sendTransaction, connected } = useWallet();
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  const handleTransfer = async () => {
    if (!connected || !publicKey) return alert("Connect wallet");
    if (!mintAddress) return alert("Provide a mint address");
    if (!to) return alert("Enter recipient pubkey");
    if (!amount) return alert("Enter amount");

    try {
      setStatus("Preparing transfer...");
      const connection = new Connection("https://api.devnet.solana.com");
      const mintPub = new PublicKey(mintAddress);
      const recipient = new PublicKey(to);

      const senderAta = await getAssociatedTokenAddress(mintPub, publicKey);
      const recipientAta = await getAssociatedTokenAddress(mintPub, recipient);

      // Check if recipient ATA exists
      const acct = await connection.getAccountInfo(recipientAta);
      const tx = new Transaction();
      if (!acct) {
        tx.add(createAssociatedTokenAccountInstruction(publicKey, recipientAta, recipient, mintPub));
      }

      // amount is in UI units; we need to read decimals. For simplicity, assume decimals=6 (update if needed)
      const decimals = 6;
      const raw = Math.round(parseFloat(amount) * 10 ** decimals);

      tx.add(createTransferInstruction(senderAta, recipientAta, publicKey, raw, [], TOKEN_PROGRAM_ID));

      const { blockhash } = await connection.getLatestBlockhash("finalized");
      tx.recentBlockhash = blockhash;
      tx.feePayer = publicKey;

      setStatus("Confirming in wallet...");
      const sig = await sendTransaction(tx, connection);
      await connection.confirmTransaction(sig, "confirmed");
      setStatus(`Transfer confirmed: ${sig}`);
    } catch (err: any) {
      console.error(err);
      setStatus("Error: " + (err?.message ?? String(err)));
    }
  };

  return (
    <div style={{ marginTop: 16 }}>
      <h4>Transfer Tokens</h4>
      <input placeholder="recipient pubkey" value={to} onChange={(e) => setTo(e.target.value)} style={{ width: "100%", padding: 8 }} />
      <input placeholder="amount" value={amount} onChange={(e) => setAmount(e.target.value)} style={{ width: "100%", padding: 8, marginTop: 8 }} />
      <button onClick={handleTransfer} style={{ marginTop: 8, padding: "8px 12px", background: "#f59e0b", color: "#000", borderRadius: 6 }}>
        Transfer
      </button>
      {status && <div style={{ marginTop: 8 }}>{status}</div>}
    </div>
  );
}
