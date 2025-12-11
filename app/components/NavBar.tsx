"use client";

import Link from "next/link";

export default function NavBar() {
  return (
    <nav style={{
      display: "flex",
      gap: "20px",
      padding: "12px 20px",
      background: "#0f172a",
      color: "white",
      borderBottom: "1px solid #1e293b"
    }}>
      <Link href="/">Home</Link>
      <Link href="/holders">Holders</Link>
      <Link href="/charts">Charts</Link>
      <Link href="/profile">Profile</Link>
    </nav>
  );
}
