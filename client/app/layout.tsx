import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./cairo.css";
import "./globals.css";
import { isDesignPreview } from "./design-config";
import "./universe.css";
import "./fund-catalog.css";
import "./capital-theme.css";
import { InvestorSession } from "./investor-actions";

const name = "صناديق الخليج الذكية";
const description = "تعرّف على الصناديق والأسواق، وافهم كيف تشتغل أدوات الاستثمار عشان تقارن الخيارات على بيّنة.";
const isPreview = process.env.VERCEL_ENV === "preview" || isDesignPreview;

export const metadata: Metadata = {
  title: { default: name, template: "%s · " + name },
  description,
  applicationName: name,
  icons:{ icon:{url:"/brand/sgf-mark.svg",type:"image/svg+xml",sizes:"any"} },
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
  colorScheme: "light",
  themeColor: "#fbfaf7",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className="afaq-root">
      <body>
        <style>{`
          .afaq-root, .afaq-root body {
            margin: 0;
            min-height: 100%;
            background: #fbfaf7;
            color: #132947;
            color-scheme: light;
            font-family: var(--afaq-arabic), Tahoma, Arial, sans-serif;
            -webkit-font-smoothing: antialiased;
          }
          .afaq-root body::before { content: none; }
          .afaq-root body .afq {
            font-family: var(--afaq-arabic), Tahoma, Arial, sans-serif;
          }
          .afaq-root ::selection { background: #bbeeea; color: #122c54; }
          .afaq-root summary:focus-visible, .afaq-root a:focus-visible {
            outline: 2px solid #1556bd;
            outline-offset: 4px;
          }
        `}</style>
        {isDesignPreview && <div className="u-preview-banner">معاينة خاصة للتصميم · الموقع الحالي كما هو · الاشتراك هنا للتجربة</div>}
        <InvestorSession>{children}</InvestorSession>
      </body>
    </html>
  );
}
