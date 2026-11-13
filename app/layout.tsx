import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});

const baseUrl =
  process.env.NEXT_PUBLIC_BASE_URL && !process.env.NEXT_PUBLIC_BASE_URL.includes("localhost")
    ? process.env.NEXT_PUBLIC_BASE_URL
    : process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "https://reach-world.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Reach World — Digital Bio & NFC Cards Console",
    template: "%s | Reach World",
  },
  description:
    "Enterprise NFC and Digital Business Card management platform for Reach World.",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: baseUrl,
    siteName: "Reach World",
    title: "Reach World — Digital Business Cards",
    description: "Connect instantly with Reach World NFC Smart Business Cards.",
    images: [
      {
        url: `${baseUrl}/og-image.jpg`,
        secureUrl: `${baseUrl}/og-image.jpg`,
        width: 1024,
        height: 1024,
        type: "image/jpeg",
        alt: "Reach World Digital Business Cards",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Reach World — Digital Business Cards",
    description: "Connect instantly with Reach World NFC Smart Business Cards.",
    images: [`${baseUrl}/og-image.jpg`],
  },
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
    <html lang="en" className={`${jakarta.variable} bg-[#061528]`}>
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover"
        />
        <meta name="theme-color" content="#061528" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="min-h-screen bg-[#061528] text-white font-sans antialiased selection:bg-[#38bdf8]/30 selection:text-white">
        {children}
      </body>
    </html>
  );
}
