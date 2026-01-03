import type { Metadata } from "next";
import { DM_Sans, Outfit } from "next/font/google";
import Script from "next/script";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SmoothScroll } from "@/components/SmoothScroll";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Obieo | Websites for Home Service Businesses",
  description:
    "We build websites that turn clicks into customers for home service businesses. SEO-optimized, conversion-focused websites that generate leads.",
  keywords: [
    "home service website",
    "contractor website",
    "roofing website",
    "HVAC website",
    "plumbing website",
    "local SEO",
  ],
  authors: [{ name: "Obieo" }],
  openGraph: {
    title: "Obieo | Websites for Home Service Businesses",
    description:
      "We build websites that turn clicks into customers for home service businesses.",
    url: "https://obieo.com",
    siteName: "Obieo",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Obieo | Websites for Home Service Businesses",
    description:
      "We build websites that turn clicks into customers for home service businesses.",
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script
          src="https://assets.calendly.com/assets/external/widget.js"
          strategy="lazyOnload"
        />
      </head>
      <body
        className={`${dmSans.variable} ${outfit.variable} antialiased bg-[var(--bg-primary)] text-[var(--text-primary)]`}
      >
        <ThemeProvider>
          <SmoothScroll>
            <Header />
            <main className="min-h-screen">{children}</main>
            <Footer />
          </SmoothScroll>
        </ThemeProvider>
      </body>
    </html>
  );
}
