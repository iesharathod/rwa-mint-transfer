import "./globals.css";
import NavBar from "./components/NavBar";
import WalletProviderWrapper from "./components/WalletProviderWrapper";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ background: "#071122", color: "white" }}>
        <WalletProviderWrapper>
          <NavBar />
          <main style={{ padding: "20px" }}>
            {children}
          </main>
        </WalletProviderWrapper>
      </body>
    </html>
  );
}
