// app/components/OHLCVChart.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import { createChart } from "lightweight-charts";

export default function OHLCVChart({ symbol = "solana", days = 7 }: { symbol?: string; days?: number }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ref.current) return;

    const chart = createChart(ref.current, {
      width: ref.current.clientWidth || 700,
      height: 320,
      layout: {
        backgroundColor: "#071122",
        textColor: "#d1d5db",
      },
      grid: {
        vertLines: { color: "#1e293b" },
        horzLines: { color: "#1e293b" },
      },
    });

    // ✔ v3 API (the one you now installed)
    const series = chart.addCandlestickSeries({
      upColor: "#26a69a",
      downColor: "#ef5350",
      borderUpColor: "#26a69a",
      borderDownColor: "#ef5350",
      wickUpColor: "#26a69a",
      wickDownColor: "#ef5350",
    });

    async function load() {
      setLoading(true);

      try {
        const res = await fetch(
          `https://api.coingecko.com/api/v3/coins/${symbol}/ohlc?vs_currency=usd&days=${days}`
        );

        if (!res.ok) throw new Error("OHLC unavailable");

        const raw = await res.json();

        const data = raw.map((r: any) => ({
          time: Math.floor(r[0] / 1000),
          open: r[1],
          high: r[2],
          low: r[3],
          close: r[4],
        }));

        series.setData(data);
      } catch (err) {
        console.log("OHLC error, using dummy data:", err);

        const now = Math.floor(Date.now() / 1000);
        const dummy = Array.from({ length: 60 }).map((_, i) => {
          const t = now - (60 - i) * 3600;
          const o = 20 + Math.sin(i / 5) * 2 + Math.random();
          const c = o + (Math.random() - 0.5) * 1.5;
          const h = Math.max(o, c) + Math.random();
          const l = Math.min(o, c) - Math.random();
          return { time: t, open: o, high: h, low: l, close: c };
        });

        series.setData(dummy);
      }

      setLoading(false);
    }

    load();

    const handleResize = () => {
      if (ref.current) {
        chart.applyOptions({ width: ref.current.clientWidth });
      }
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [symbol, days]);

  return (
    <div style={{ marginTop: 16 }}>
      <div ref={ref} style={{ height: 320 }} />
      {loading && <div style={{ marginTop: 8, color: "#9ca3af" }}>Loading chart…</div>}
    </div>
  );
}
