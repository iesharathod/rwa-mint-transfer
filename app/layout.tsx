import "./globals.css";
import WalletProviderWrapper from "./components/WalletProviderWrapper";

export const metadata = {
  title: "RWA MVP",
  description: "Hackathon Demo",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <WalletProviderWrapper>
          {children}
        </WalletProviderWrapper>
      </body>
    </html>
  );
}
