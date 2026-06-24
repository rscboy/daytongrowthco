import type { Metadata } from "next";
import Script from "next/script";
import "../src/index.css";
import "../src/systems-that-pay.css";

const siteUrl = "https://www.daytongrowth.co";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "DaytonGrowthCo. | Business Tools, Apps, Dashboards & Content",
    template: "%s",
  },
  description:
    "DaytonGrowthCo builds phone agents, quote calculators, dashboards, customer portals, training libraries, sales pages, videos, visuals, and custom apps.",
  keywords: [
    "custom business tools Dayton Ohio",
    "phone agents for small business",
    "quote calculator",
    "project dashboard",
    "customer portal",
    "training library",
    "custom business apps",
  ],
  authors: [{ name: "DaytonGrowthCo." }],
  creator: "DaytonGrowthCo.",
  publisher: "DaytonGrowthCo.",
  applicationName: "DaytonGrowthCo.",
  alternates: {
    canonical: "/",
    types: {
      "text/markdown": "/md/index.md",
    },
  },
  icons: {
    icon: "/favicon.png?v=2",
    shortcut: "/favicon.png?v=2",
    apple: "/favicon.png?v=2",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "DaytonGrowthCo.",
    title: "DaytonGrowthCo. | Business Tools, Apps, Dashboards & Content",
    description:
      "Phone agents, quote calculators, dashboards, training libraries, sales materials, and custom apps built around your business.",
    images: [
      {
        url: "/thumbnail.jpeg",
        width: 1200,
        height: 630,
        alt: "DaytonGrowthCo. builds digital tools and custom apps for small businesses.",
      },
    ],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "DaytonGrowthCo. | Business Tools, Apps, Dashboards & Content",
    description: "DaytonGrowthCo builds phone agents, quote tools, dashboards, portals, sales materials, and custom apps.",
    images: ["/thumbnail.jpeg"],
  },
  other: {
    "theme-color": "#0A0E1A",
    classification: "Custom business tools, phone agents, dashboards, portals, quote tools, digital content",
    subject: "Digital tools and custom business systems for small businesses",
    coverage: "Dayton, Ohio",
    "geo.region": "US-OH",
    "geo.placename": "Dayton, Ohio",
    "turnstile-site-key": "0x4AAAAAADn4geEq5DLMacHN",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="scroll-smooth scroll-pt-24" suppressHydrationWarning>
      <head>
        <script
          id="dgc-boot-splash-state"
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var path = window.location.pathname;
                var isHome = path === "/" || path === "/index.html";
                if (!isHome || window.sessionStorage.getItem("dgc:splash-seen") === "1") {
                  document.documentElement.classList.add("dgc-splash-seen");
                } else {
                  document.documentElement.classList.add("dgc-splash-pending");
                }
              } catch (error) {
                document.documentElement.classList.add("dgc-splash-pending");
              }
            `,
          }}
        />
        <style
          id="boot-splash-style"
          dangerouslySetInnerHTML={{
            __html: `
              html.dgc-splash-pending {
                background: #05070d;
              }

              body {
                margin: 0;
              }

              #boot-splash {
                position: fixed;
                inset: 0;
                z-index: 10000;
                display: none;
                align-items: center;
                justify-content: center;
                background:
                  radial-gradient(circle at 50% 38%, rgba(37, 99, 235, 0.16), transparent 34%),
                  radial-gradient(circle at 55% 58%, rgba(168, 85, 247, 0.1), transparent 36%),
                  linear-gradient(180deg, #05070d 0%, #070a12 52%, #050505 100%);
                pointer-events: none;
              }

              html.dgc-splash-pending #boot-splash {
                display: flex;
              }

              html.dgc-splash-seen {
                background: #fbfbf9;
              }

              html.dgc-splash-seen #boot-splash {
                display: none;
              }

              #boot-splash[hidden] {
                display: none !important;
              }

              @media (prefers-reduced-motion: reduce) {
                #boot-splash {
                  display: none !important;
                }
              }
            `,
          }}
        />
      </head>
      <body>
        <div id="boot-splash" aria-hidden="true" />
        {children}
        <Script src="/legal-overlay.js" strategy="afterInteractive" />
        <Script src="/page-transitions.js?v=5" strategy="afterInteractive" />
      </body>
    </html>
  );
}
