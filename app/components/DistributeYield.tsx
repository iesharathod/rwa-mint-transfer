// app/components/DistributeYield.tsx
"use client";

import React, { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  Connection,
  PublicKey,
  Transaction,
} from "@solana/web3.js";

import {
  getAssociatedTokenAddress,
  createTransferInstruction,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

export default function DistributeYield({ mintAddress }: { mintAddress?: string | null }) {
  const { publicKey, sendTransaction, connected } = useWallet();
  const [totalAmount, setTotalAmount] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  const getTokenHolders = async (connection: Connection, mint: PublicKey) => {
    // Get **all** token accounts for this mint (browser safe)
    const accounts = await connection.getProgramAccounts(
      TOKEN_PROGRAM_ID,
      {
        filters: [
          // Mint filter
          {
            memcmp: {
              offset: 0, // mint address starts at byte 0
              bytes: mint.toBase58(),
            },
          },
          // Token account size is 165 bytes
          {
            dataSize: 165,
          },
        ],
      }
    );

    const holders: { ata: PublicKey; amount: number }[] = [];

    for (const acc of accounts) {
      const data = acc.account.data;

      // amount = bytes 64-72 (u64)
      const amountData = data.slice(64, 72);
      const amount = Number(amountData.readBigUInt64LE());

      if (amount > 0) {
        holders.push({
          ata: acc.pubkey,
          amount,
        });
      }
    }

    return holders;
  };

  const handleDistribute = async () => {
    if (!connected || !publicKey) return alert("Connect wallet");
    if (!mintAddress) return alert("Provide mint address");
    if (!totalAmount) return alert("Enter total distribution amount");

    try {
      setStatus("Fetching holders...");
      const connection = new Connection("https://api.devnet.solana.com");
      const mintPub = new PublicKey(mintAddress);

      const holders = await getTokenHolders(connection, mintPub);
      if (holders.length === 0) return setStatus("No token holders found.");

      const decimals = 6;
      const totalRaw = Math.round(parseFloat(totalAmount) * 10 ** decimals);

      let totalCirculating = 0;
      holders.forEach(h => totalCirculating += h.amount);

      if (totalCirculating === 0) return setStatus("Holders have zero balance.");

      const distributorAta = await getAssociatedTokenAddress(mintPub, publicKey);

      // distribute to each holder
      for (const h of holders) {
        const share = h.amount / totalCirculating;
        const payoutRaw = Math.floor(totalRaw * share);
        if (payoutRaw <= 0) continue;

        const tx = new Transaction().add(
          createTransferInstruction(
            distributorAta,
            h.ata,
            publicKey,
            payoutRaw,
            [],
            TOKEN_PROGRAM_ID
          )
        );

        const { blockhash } = await connection.getLatestBlockhash("finalized");
        tx.recentBlockhash = blockhash;
        tx.feePayer = publicKey;

        setStatus(
          `Paying ${(payoutRaw / 10 ** decimals).toFixed(6)} tokens → ${h.ata
            .toBase58()
            .slice(0, 8)}...`
        );

        const sig = await sendTransaction(tx, connection);
        await connection.confirmTransaction(sig, "confirmed");
      }

      setStatus("Distribution complete!");
    } catch (err: any) {
      console.error(err);
      setStatus("Error: " + err.message);
    }
  };

  return (
    <div style={{ marginTop: 16 }}>
      <h4>Distribute Yield (Pro-Rata)</h4>
      <input
        placeholder="Total amount to distribute"
        value={totalAmount}
        onChange={(e) => setTotalAmount(e.target.value)}
        style={{ width: "100%", padding: 8 }}
      />
      <button
        onClick={handleDistribute}
        style={{ marginTop: 8, padding: "8px 12px", background: "#06b6d4", color: "#000", borderRadius: 6 }}
      >
        Distribute
      </button>

      {status && <div style={{ marginTop: 8 }}>{status}</div>}
    </div>
  );
}
