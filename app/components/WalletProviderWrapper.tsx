"use client";

import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";

export default function WalletProviderWrapper({ children }: { children: React.ReactNode }) {
  const endpoint = "https://api.devnet.solana.com";

  // DO NOT manually register Phantom — it is auto-detected in modern browsers!
  const wallets: any[] = []; // empty array = use standard wallets

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect={false}>
        {children}
      </WalletProvider>
    </ConnectionProvider>
  );
}
