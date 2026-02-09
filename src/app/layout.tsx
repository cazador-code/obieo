import type { Metadata } from "next";
import Script from "next/script";
import "@fontsource-variable/dm-sans";
import "@fontsource-variable/outfit";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SmoothScroll } from "@/components/SmoothScroll";
import { CustomCursor } from "@/components/CustomCursor";
import { BookingModalProvider } from "@/components/BookingModalContext";
import { BookingModal } from "@/components/BookingModal";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.obieo.com"),
  title: {
    default: "Obieo | SEO & AI Search Optimization for Home Service Businesses",
    template: "%s | Obieo",
  },
  description:
    "SEO and AI search optimization built by a contractor, for contractors. Get found on Google and AI search engines like ChatGPT. Roofing, HVAC, plumbing, electrical & more.",
  keywords: [
    "contractor SEO",
    "home service SEO",
    "roofing SEO",
    "HVAC SEO",
    "plumbing SEO",
    "electrical SEO",
    "local SEO",
    "AI search optimization",
    "GEO optimization",
  ],
  authors: [{ name: "Hunter Lapeyre", url: "https://www.obieo.com/about" }],
  creator: "Obieo",
  publisher: "Obieo",
  openGraph: {
    title: "Obieo | SEO & AI Search Optimization for Contractors",
    description:
      "SEO built by a contractor, for contractors. Get found on Google and AI search engines.",
    url: "https://www.obieo.com",
    siteName: "Obieo",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/og-default.png",
        width: 1200,
        height: 630,
        alt: "Obieo - SEO & AI Search Optimization for Home Service Businesses",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Obieo | SEO & AI Search for Contractors",
    description:
      "SEO built by a contractor, for contractors. Get found on Google and AI search engines.",
    images: ["/og-default.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://www.obieo.com",
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
        className="antialiased bg-[var(--bg-primary)] text-[var(--text-primary)]"
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
        <Analytics />
      </body>
    </html>
  );
}
