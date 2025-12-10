// app/page.tsx
"use client";

import React, { useState } from "react";
import ConnectWallet from "./components/ConnectWallet";
import Balance from "./components/Balance";
import MintButton from "./components/MintButton";
import SaveProof from "./components/SaveProof";
import AssetDashboard from "./components/AssetDashboard";
import OHLCVChart from "./components/OHLCVChart";
import TransferToken from "./components/TransferToken";
import DistributeYield from "./components/DistributeYield";
import AssetForm from "./components/AssetForm"; // ✅ NEW IMPORT

export default function Page() {
  const [mintAddr, setMintAddr] = useState<string | null>(null);

  return (
    <div style={{ padding: 20, maxWidth: 1000, margin: "0 auto" }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <h1>RWA Dashboard (Devnet)</h1>
        <ConnectWallet />
      </header>

      <Balance />

      {/* ------------------------------------------------------ */}
      {/* 🔵 NEW: FULL ASSET CREATION FORM                       */}
      {/* ------------------------------------------------------ */}
      <div style={{ marginTop: 20 }}>
        <h2>Create New RWA Asset</h2>
        <AssetForm
          onCreated={(mint) => {
            setMintAddr(mint);
          }}
        />
      </div>
      {/* ------------------------------------------------------ */}

      {/* OLD Minter (Optional – you can remove if not needed) */}
      <div style={{ marginTop: 20 }}>
        <MintButton />
      </div>

      {/* Manual mint input */}
      <div style={{ marginTop: 20 }}>
        <label>Load mint (paste mint address):</label>
        <input
          onChange={(e) => setMintAddr(e.target.value)}
          placeholder="paste mint address or leave blank"
          style={{ width: "100%", padding: 8, marginTop: 6 }}
        />
      </div>

      {/* Dashboard */}
      <AssetDashboard mintAddress={mintAddr} />

      {/* Chart */}
      <div style={{ marginTop: 20 }}>
        <OHLCVChart symbol="solana" days={7} />
      </div>

      {/* Save Proof */}
      <div style={{ marginTop: 20 }}>
        <SaveProof />
      </div>

      {/* Transfer */}
      <div style={{ marginTop: 20 }}>
        <TransferToken mintAddress={mintAddr} />
      </div>

      {/* Yield Distribution */}
      <div style={{ marginTop: 20 }}>
        <DistributeYield mintAddress={mintAddr} />
      </div>
    </div>
  );
}
