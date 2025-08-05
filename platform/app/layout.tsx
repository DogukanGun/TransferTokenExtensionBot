import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./styles/wallet-adapter.css";
import ClientWalletProvider from "./providers/WalletProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Token2022 Builder - Configure Your Solana Token",
  description: "Create and configure your Token2022 smart contract with advanced features like whale alerts, whitelisting, and transfer limits.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#030712] text-white min-h-screen`}
      >
        <ClientWalletProvider>
          {children}
        </ClientWalletProvider>
      </body>
    </html>
  );
}
