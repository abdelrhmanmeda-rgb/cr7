import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Cairo } from "next/font/google";
import "./globals.css";
import { isDesignPreview } from "./design-config";
import "./universe.css";

const name = "صناديق الخليج الذكية";
const description = "تعرّف على الصناديق والأسواق، وافهم كيف تشتغل أدوات الاستثمار عشان تقارن الخيارات على بيّنة.";
const isPreview = process.env.VERCEL_ENV === "preview" || isDesignPreview;

const cairo = Cairo({
  subsets: ["arabic"],
  display: "swap",
  variable: "--afaq-arabic",
  fallback: ["Tahoma", "Arial", "sans-serif"],
});

export const metadata: Metadata = {
  title: { default: name, template: "%s · " + name },
  description,
  applicationName: name,
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
        {isDesignPreview && <div className="u-preview-banner">معاينة خاصة للتصميم · الموقع الحالي كما هو · الاشتراك هنا للتجربة</div>}
        {children}
      </body>
    </html>
  );
}
