import type { Metadata } from "next";
import { DM_Sans, Outfit } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Obieo — SEO & AEO for Home Service Businesses",
  description:
    "Get 20+ organic leads/month without paying for ads. SEO, AEO, and website optimization from someone who actually runs a home service company.",
  openGraph: {
    title: "Obieo — SEO & AEO for Home Service Businesses",
    description:
      "Get 20+ organic leads/month without paying for ads. SEO, AEO, and website optimization from someone who actually runs a home service company.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Obieo — SEO & AEO for Home Service Businesses",
    description:
      "Get 20+ organic leads/month without paying for ads. SEO, AEO, and website optimization from someone who actually runs a home service company.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${dmSans.variable} ${outfit.variable}`}>
      <body className="antialiased font-sans">{children}</body>
    </html>
  );
}
