"use client";

import { useState } from "react";
import { Connection, PublicKey } from "@solana/web3.js";

export default function HoldersPage() {
  const [mint, setMint] = useState("");
  const [holders, setHolders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    if (!mint) return;

    setLoading(true);
    const conn = new Connection("https://api.devnet.solana.com");
    const mintPub = new PublicKey(mint);

    const largest = await conn.getTokenLargestAccounts(mintPub);
    const list = [];

    for (const acc of largest.value) {
      if (!acc.address) continue;

      const info = await conn.getParsedAccountInfo(acc.address);
      const parsed = info.value?.data?.parsed?.info;

      if (parsed) {
        list.push({
          owner: parsed.owner,
          amount: parsed.tokenAmount.uiAmount || 0
        });
      }
    }

    setHolders(list);
    setLoading(false);
  }

  return (
    <div>
      <h1>Token Holders</h1>

      <input
        placeholder="Enter Mint Address"
        value={mint}
        onChange={(e) => setMint(e.target.value)}
        style={{ padding: 8, width: "100%", marginTop: 12 }}
      />

      <button
        onClick={load}
        style={{ padding: "8px 12px", background: "#2563eb", marginTop: 12 }}
      >
        Load Holders
      </button>

      {loading && <p>Loading...</p>}

      <div style={{ marginTop: 20 }}>
        {holders.length === 0 ? (
          <p>No holders found...</p>
        ) : (
          holders.map((h, i) => (
            <div
              key={i}
              style={{
                padding: 12,
                background: "#0b1220",
                marginTop: 10,
                borderRadius: 8,
              }}
            >
              <p><strong>Owner:</strong> {h.owner}</p>
              <p><strong>Balance:</strong> {h.amount}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
