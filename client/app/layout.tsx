import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Cairo } from "next/font/google";
import "./globals.css";

const name = "آفاق الخليج";
const description = "دليل عربي لفهم مجالات الاستثمار، ومقارنة الأدوات، والتعرّف على الأسواق المالية.";
const isPreview = process.env.VERCEL_ENV === "preview";

const cairo = Cairo({
  subsets: ["arabic"],
  display: "swap",
  variable: "--afaq-arabic",
  fallback: ["Tahoma", "Arial", "sans-serif"],
});

const logo = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect x=".5" y=".5" width="47" height="47" rx="12" fill="#111820" stroke="#dfbe82"/><g fill="none" stroke="#dfbe82" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round"><path d="M9 32 24 10l15 22H9Z"/><path d="m15 32 9-14 9 14M24 18v14M12 38h24"/></g></svg>';
const tabIcon = "data:image/svg+xml," + encodeURIComponent(logo);

export const metadata: Metadata = {
  title: { default: name, template: "%s · " + name },
  description,
  applicationName: name,
  icons: {
    icon: { url: tabIcon, type: "image/svg+xml", sizes: "any" },
  },
  openGraph: {
    title: name,
    description,
    locale: "ar",
    siteName: name,
    type: "website",
  },
  twitter: {
    card: "summary",
    title: name,
    description,
  },
  ...(isPreview ? { robots: { index: false, follow: false } } : {}),
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "dark",
  themeColor: "#090e14",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={cairo.variable + " afaq-root"}>
      <body>
        <style>{`
          .afaq-root, .afaq-root body {
            margin: 0;
            min-height: 100%;
            background: #090e14;
            color: #f8f4ec;
            color-scheme: dark;
            font-family: var(--afaq-arabic), Tahoma, Arial, sans-serif;
            -webkit-font-smoothing: antialiased;
          }
          .afaq-root body::before { content: none; }
          .afaq-root body .afq {
            font-family: var(--afaq-arabic), Tahoma, Arial, sans-serif;
          }
          .afaq-root ::selection { background: #dfbe82; color: #0d1219; }
          .afaq-root summary:focus-visible, .afaq-root a:focus-visible {
            outline: 2px solid #dfbe82;
            outline-offset: 4px;
          }
        `}</style>
        {children}
      </body>
    </html>
  );
}
