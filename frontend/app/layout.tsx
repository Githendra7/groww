import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LiveMarketProvider } from "@/components/LiveMarketProvider"; // Make sure this is imported!

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Smart Market Watchlist",
  description: "A hackathon project",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* THIS IS THE CRITICAL WRAPPER WE NEED */}
        <LiveMarketProvider>
          {children}
        </LiveMarketProvider>
      </body>
    </html>
  );
}