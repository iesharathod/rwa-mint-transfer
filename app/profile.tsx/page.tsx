"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import Balance from "../components/Balance";

export default function ProfilePage() {
  const { publicKey, connected } = useWallet();

  return (
    <div>
      <h1>Your Profile</h1>

      {connected ? (
        <>
          <p><strong>Wallet:</strong> {publicKey?.toBase58()}</p>
          <Balance />
        </>
      ) : (
        <p>Please connect your wallet.</p>
      )}
    </div>
  );
}
