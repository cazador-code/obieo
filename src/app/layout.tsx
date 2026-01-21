import type { Metadata } from "next";
import { DM_Sans, Outfit } from "next/font/google";
import Script from "next/script";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SmoothScroll } from "@/components/SmoothScroll";
import { CustomCursor } from "@/components/CustomCursor";
import { BookingModalProvider } from "@/components/BookingModalContext";
import { BookingModal } from "@/components/BookingModal";
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
    url: "https://www.obieo.com",
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
        {/* Google Tag Manager - must be first */}
        <Script id="gtm" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-TMBFS7H7');
          `}
        </Script>
        {/* Facebook Pixel managed via GTM */}
      </head>
      <body
        className={`${dmSans.variable} ${outfit.variable} antialiased bg-[var(--bg-primary)] text-[var(--text-primary)]`}
      >
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-TMBFS7H7"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        <BookingModalProvider>
          <ThemeProvider>
            <SmoothScroll>
              <CustomCursor />
              <Header />
              <main className="min-h-screen">{children}</main>
              <Footer />
            </SmoothScroll>
          </ThemeProvider>
          <BookingModal />
        </BookingModalProvider>
      </body>
    </html>
  );
}
