import type { Metadata } from "next";
import "./globals.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export const metadata: Metadata = {
  title: "Mint Aptos NFT",
  description: "chiu.fyi",
};
const client = new QueryClient();
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // const [client] = useState(new QueryClient());
  return (
    <html lang="en">
      <body>
        {/* <QueryClientProvider client={client}></QueryClientProvider> */}
        {children}
      </body>
    </html>
  );
}
