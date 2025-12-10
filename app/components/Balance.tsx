"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey } from "@solana/web3.js";

export default function Balance() {
  const { publicKey } = useWallet();
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    const getBalance = async () => {
      if (!publicKey) return;
      const connection = new Connection("https://api.devnet.solana.com");
      const lamports = await connection.getBalance(publicKey);
      setBalance(lamports / 1e9); // convert lamports → SOL
    };

    getBalance();
  }, [publicKey]);

  if (!publicKey) return null;

  return (
    <div style={{ marginTop: 20 }}>
      <strong>Your Balance:</strong> {balance === null ? "Loading..." : `${balance} SOL`}
    </div>
  );
}
