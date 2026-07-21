import type { Metadata } from "next";
import { Archivo_Narrow, Inter } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";

const inter = Inter({ subsets: ["latin"] });
const archivoNarrow = Archivo_Narrow({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-archivo-narrow",
});

export const metadata: Metadata = {
  title: "Riding Carpets Portal",
  description: "Track shows, songs, and setlists for Riding Carpets.",
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} ${archivoNarrow.variable} bg-rc-cream text-gray-900 overflow-x-hidden`}
      >
        <Header />
        {children}
      </body>
    </html>
  );
}
