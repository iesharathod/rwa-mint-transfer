RWA Tokenization Dashboard (Solana Devnet)

A lightweight Real-World Asset tokenization MVP built on Solana, featuring live mint creation, fractional supply, wallet integration, transfers, yield distribution, memo proofs, and OHLCV charts — all without requiring IPFS or Metaplex.

Perfect for hackathons, learning Solana, or demonstrating tokenization concepts.

🚀 Features
✔️ Create RWA Asset (No IPFS / No Metadata PDA needed)

Create a tokenized asset with:

Name

Symbol

Description

Image URL

Total Supply

Metadata is stored locally (fast, simple, hackathon-friendly).

✔️ Mint SPL Token On-Chain

Creates a real SPL mint

Mints supply to user's ATA

Works fully on Solana Devnet

Token appears in Phantom as Unknown (normal without metadata PDA)

✔️ Wallet Integration (Phantom)

Connect wallet

Display SOL balance

Sign & send all transactions

✔️ On-chain Proof Storage (Memo Program)

Store:

IPFS hashes

SHA256 proofs

Text references

All saved permanently using Solana Memo instructions.

✔️ Transfer Tokens

Send fractional RWA tokens to other wallets:

Auto-creates ATA if missing

Shows transaction status

Fully SPL-compliant

✔️ Yield Distribution Demo

Simulates yield distribution:

Enter a total amount

Distribute proportionally to holders

✔️ OHLCV Price Chart

Includes Candle Chart powered by:

Lightweight-Charts v3

CoinGecko OHLC API (fallback data supported)

🧱 Architecture Overview
Frontend (Next.js)  
     ↓  
Phantom Wallet Adapter  
     ↓  
@solana/web3.js + @solana/spl-token  
     ↓  
Devnet Transactions:
 - Create Mint
 - Mint Initial Supply
 - Save Proof (Memo)
 - Transfer
 - Distribute Yield

🛠️ Tech Stack
Frontend

Next.js 14

React

Lightweight-charts

TailwindCSS (optional)

Blockchain

Solana Devnet

@solana/web3.js

@solana/spl-token

Phantom Wallet Adapter

Storage

Local JSON metadata

Memo program for on-chain proofs

📦 Installation
npm install
npm run dev


Visit → http://localhost:3000

🧪 How It Works
1️⃣ Connect Wallet

Click “Connect Wallet” → approve Phantom popup.

2️⃣ Create RWA Asset

Fill Form → Name, Symbol, Supply → Create → Token Mint created on-chain.

3️⃣ Mint Tokens

Creates ATA → Mints supply to your wallet.

4️⃣ Load Asset Dashboard

Shows:

Token balance

Total supply

Recent memo proofs

ATA address

5️⃣ Add Proof

Enter text / hash → Save Proof → On-chain memo created.

6️⃣ Transfer Tokens

Enter recipient + amount → SPL transfer executed.

7️⃣ Distribute Yield

Enter total → distribution simulated.

⚠️ Limitations (Intentional for Hackathon MVP)

Phantom shows token as Unknown (no metadata PDA used)

Metadata stored locally instead of IPFS/Arweave

No backend or oracle pricefeed

OHLCV chart uses public APIs, not on-chain pricefeeds

This makes the app extremely lightweight and avoids Metaplex/PDA signing issues.

📌 Future Upgrades

On-chain metadata using Metaplex (API route for Node environment)

Holder analytics

Oracle price feeds (Pyth / Switchboard)

Real RWA valuation sync

Multi-asset dashboard

Admin panel

👤 Author

Isha Rathod


🤝 Contributing

Pull requests are welcome!
Open issues to suggest improvements or add features.

