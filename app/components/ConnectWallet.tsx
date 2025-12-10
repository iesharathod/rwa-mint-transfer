"use client";

import { useWallet } from "@solana/wallet-adapter-react";

export default function ConnectWallet() {
  const { wallets, select, connect, disconnect, connected, publicKey } = useWallet();

  const handleConnect = async () => {
    // Look for Phantom in standard wallets
    const phantom = wallets.find((w) => w.adapter.name === "Phantom");

    if (!phantom) {
      alert("Phantom not detected. Make sure the extension is installed & refreshed.");
      return;
    }

    // Select + Connect
    select(phantom.adapter.name);
    await connect();
  };

  return (
    <div style={{ marginBottom: 20 }}>
      {connected && publicKey ? (
        <>
          <p>Connected: {publicKey.toBase58().slice(0, 6)}...</p>
          <button onClick={disconnect} style={{ padding: "10px 20px", background: "red", color: "#fff" }}>
            Disconnect
          </button>
        </>
      ) : (
        <button
          onClick={handleConnect}
          style={{ padding: "10px 20px", background: "green", color: "#fff" }}
        >
          Connect Phantom
        </button>
      )}
    </div>
  );
}
