import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Reach World — Digital Bio & NFC Cards Console",
  description:
    "Enterprise NFC and Digital Business Card management platform for Reach World.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] selection:bg-[#0071E3]/20 selection:text-[#0071E3]">
        {children}
      </body>
    </html>
  );
}
