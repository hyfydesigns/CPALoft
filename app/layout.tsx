import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "CPA Loft — Your accounting, elevated.",
    template: "%s | CPA Loft",
  },
  description:
    "CPA Loft is an AI-powered platform designed specifically for Certified Public Accountants. Your accounting, elevated.",
  keywords: [
    "CPA Loft",
    "CPA",
    "AI",
    "tax",
    "accounting",
    "assistant",
    "GAAP",
    "IRS",
    "financial",
  ],
  authors: [{ name: "CPA Loft" }],
  creator: "CPA Loft",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_APP_URL,
    title: "CPA Loft — Your accounting, elevated.",
    description:
      "AI-powered platform designed specifically for Certified Public Accountants",
    siteName: "CPA Loft",
  },
  twitter: {
    card: "summary_large_image",
    title: "CPA Loft — Your accounting, elevated.",
    description:
      "AI-powered platform designed specifically for Certified Public Accountants",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
