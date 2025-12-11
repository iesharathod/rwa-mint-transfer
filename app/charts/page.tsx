"use client";

import { useState } from "react";
import OHLCVChart from "../components/OHLCVChart";

export default function ChartsPage() {
  const [days, setDays] = useState(7);

  return (
    <div>
      <h1>Market Chart</h1>

      <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
        <button onClick={() => setDays(1)}>1D</button>
        <button onClick={() => setDays(7)}>7D</button>
        <button onClick={() => setDays(30)}>1M</button>
      </div>

      <div style={{ marginTop: 20 }}>
        <OHLCVChart symbol="solana" days={days} />
      </div>
    </div>
  );
}
