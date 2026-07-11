import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Riding Carpets Portal",
  description: "Track shows, songs, and setlists for Riding Carpets.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} text-gray-900`} style={{ background: 'white', overflowX: 'hidden' }}>
        <Header />
        {children}
      </body>
    </html>
  );
}
