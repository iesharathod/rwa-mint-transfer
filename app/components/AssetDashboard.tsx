// app/components/AssetDashboard.tsx
"use client";

import React, { useEffect, useState } from "react";
import { Connection, PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import { useWallet } from "@solana/wallet-adapter-react";

export default function AssetDashboard({ mintAddress }: { mintAddress?: string | null }) {
  const { publicKey } = useWallet();

  const [balance, setBalance] = useState<string | null>(null);
  const [ata, setAta] = useState<string | null>(null);
  const [supply, setSupply] = useState<string | null>(null);
  const [proofs, setProofs] = useState<string[]>([]);
  const [localMeta, setLocalMeta] = useState<any>(null);

  useEffect(() => {
    if (!mintAddress || !publicKey) return;

    const connection = new Connection("https://api.devnet.solana.com");
    (async () => {
      try {
        const mintPub = new PublicKey(mintAddress);

        // ---------------------------
        // 1️⃣ LOAD LOCAL METADATA
        // ---------------------------
        const saved = localStorage.getItem(`rwa-asset-${mintAddress}`);
        if (saved) setLocalMeta(JSON.parse(saved));
        else setLocalMeta(null);

        // ---------------------------
        // 2️⃣ Find ATA
        // ---------------------------
        const ataAddr = await getAssociatedTokenAddress(mintPub, publicKey);
        setAta(ataAddr.toBase58());

        // ---------------------------
        // 3️⃣ Token Balance
        // ---------------------------
        try {
          const bal = await connection.getTokenAccountBalance(ataAddr);
          setBalance(bal.value.uiAmountString ?? bal.value.amount);
        } catch {
          setBalance("0");
        }

        // ---------------------------
        // 4️⃣ Total Supply
        // ---------------------------
        try {
          const supplyResp = await connection.getTokenSupply(mintPub);
          setSupply(supplyResp.value.uiAmountString ?? supplyResp.value.amount);
        } catch {
          setSupply(null);
        }

        // ---------------------------
        // 5️⃣ Recent memo proofs
        // ---------------------------
        const sigs = await connection.getSignaturesForAddress(publicKey, { limit: 50 });
        const found: string[] = [];

        for (const s of sigs) {
          const tx = await connection.getTransaction(s.signature);
          if (!tx) continue;

          for (const inst of tx.transaction.message.instructions) {
            if (inst.programId.toBase58() === "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr") {
              try {
                const memo = Buffer.from(inst.data, "base64").toString("utf8");
                found.push(memo);
              } catch {}
            }
          }
        }

        setProofs(found);
      } catch (err) {
        console.error(err);
      }
    })();
  }, [mintAddress, publicKey]);

  if (!mintAddress) {
    return <div style={{ marginTop: 16 }}>Enter a mint address above to load asset details.</div>;
  }

  return (
    <div style={{ marginTop: 16, padding: 16, border: "1px solid #24303f", borderRadius: 8, background: "#0b1220" }}>
      
      {/* ------------------ */}
      {/* Local Metadata UI */}
      {/* ------------------ */}
      {localMeta ? (
        <div style={{ marginBottom: 16 }}>
          <h2>{localMeta.name} ({localMeta.symbol})</h2>

          {localMeta.image && (
            <img
              src={localMeta.image}
              style={{ width: 120, borderRadius: 6, marginTop: 8 }}
            />
          )}

          <p style={{ marginTop: 10 }}>{localMeta.description}</p>
          <p><strong>Total Supply:</strong> {localMeta.supply}</p>
        </div>
      ) : (
        <div style={{ marginBottom: 16 }}>
          <strong>No metadata stored in localStorage.</strong>
        </div>
      )}

      {/* ------------------ */}
      {/* On-chain details  */}
      {/* ------------------ */}
      <div><strong>Mint:</strong> <code>{mintAddress}</code></div>
      <div style={{ marginTop: 8 }}><strong>Your ATA:</strong> <code>{ata ?? "—"}</code></div>
      <div style={{ marginTop: 8 }}><strong>Your Token Balance:</strong> {balance ?? "Loading..."}</div>
      <div style={{ marginTop: 8 }}><strong>On-chain Supply:</strong> {supply ?? "Loading..."}</div>

      {/* ------------------ */}
      {/* Proofs */}
      {/* ------------------ */}
      <div style={{ marginTop: 16 }}>
        <strong>Recent Proofs (memo):</strong>
        <ul>
          {proofs.length === 0 ? (
            <li>No recent proofs found</li>
          ) : (
            proofs.map((p, i) => (
              <li key={i}><code>{p}</code></li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
