import type { Metadata } from "next";
import Script from "next/script";
import "../src/index.css";
import "../src/systems-that-pay.css";

const siteUrl = "https://www.daytongrowth.co";
const faviconUrl = "https://github.com/rscboy/daytongrowthco/blob/main/favicon.png?raw=true";
const googleAnalyticsId = "G-5844NWC2PD";
const clarityProjectId = "wix3m0k0lr";
const siteSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["Organization", "LocalBusiness", "ProfessionalService"],
      "@id": `${siteUrl}/#organization`,
      name: "DaytonGrowthCo.",
      url: `${siteUrl}/`,
      logo: faviconUrl,
      image: `${siteUrl}/thumbnail.jpeg`,
      description:
        "DaytonGrowthCo builds custom business tools, automations, websites, phone agents, quote tools, dashboards, customer portals, training systems, sales materials, and custom apps for small and midsized businesses.",
      email: "help@daytongrowth.co",
      telephone: "+1-937-369-0829",
      founder: {
        "@type": "Person",
        name: "Samuel Caruso",
      },
      address: {
        "@type": "PostalAddress",
        addressLocality: "Dayton",
        addressRegion: "OH",
        addressCountry: "US",
      },
      // Service-area business centered on Dayton; coordinates anchor the entity
      // to the Miami Valley for local relevance. priceRange + hours are local
      // ranking/eligibility signals. Hours default to weekday business hours;
      // confirm and adjust to match the Google Business Profile exactly.
      geo: {
        "@type": "GeoCoordinates",
        latitude: 39.7589,
        longitude: -84.1916,
      },
      priceRange: "$$",
      openingHoursSpecification: [
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          opens: "09:00",
          closes: "17:00",
        },
      ],
      areaServed: [
        { "@type": "City", name: "Dayton", addressRegion: "OH", addressCountry: "US" },
        { "@type": "City", name: "Kettering", addressRegion: "OH", addressCountry: "US" },
        { "@type": "City", name: "Beavercreek", addressRegion: "OH", addressCountry: "US" },
        { "@type": "City", name: "Centerville", addressRegion: "OH", addressCountry: "US" },
        { "@type": "City", name: "Huber Heights", addressRegion: "OH", addressCountry: "US" },
        { "@type": "City", name: "Springboro", addressRegion: "OH", addressCountry: "US" },
        { "@type": "AdministrativeArea", name: "Miami Valley", addressRegion: "OH", addressCountry: "US" },
        { "@type": "Country", name: "United States" },
      ],
      knowsAbout: [
        "custom business tools for small businesses",
        "AI-assisted software development",
        "phone agents for small businesses",
        "quote calculators",
        "estimate builders",
        "project dashboards",
        "customer portals",
        "staff dashboards",
        "training libraries",
        "custom business apps",
        "website design",
        "local SEO",
        "answer engine optimization",
      ],
      slogan: "Custom business tools and digital systems built around the way your business works.",
      hasMap: "https://share.google/KMUawpdd5QY9yhbBB",
      sameAs: [
        "https://www.linkedin.com/company/daytongrowthco/",
        "https://www.instagram.com/daytongrowthco/",
        "https://www.facebook.com/profile.php?id=61582225267724",
        "https://share.google/KMUawpdd5QY9yhbBB",
      ],
      hasOfferCatalog: {
        "@id": `${siteUrl}/#offer-catalog`,
      },
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: `${siteUrl}/`,
      name: "DaytonGrowthCo.",
      publisher: {
        "@id": `${siteUrl}/#organization`,
      },
      inLanguage: "en-US",
    },
    {
      "@type": "Service",
      "@id": `${siteUrl}/#primary-service`,
      name: "Custom Business Tools and Digital Systems",
      serviceType:
        "AI-assisted custom business tools, phone agents, quote tools, dashboards, customer portals, websites, SEO, and automations",
      provider: {
        "@id": `${siteUrl}/#organization`,
      },
      areaServed: [
        { "@type": "City", name: "Dayton", addressRegion: "OH", addressCountry: "US" },
        { "@type": "Country", name: "United States" },
      ],
      audience: {
        "@type": "BusinessAudience",
        audienceType:
          "Small and midsized businesses, contractors, service businesses, professional offices, and owner-operated teams",
      },
      description:
        "DaytonGrowthCo maps a business process, configures existing tools when they fit, and builds custom tools when the workflow needs something specific.",
      hasOfferCatalog: {
        "@id": `${siteUrl}/#offer-catalog`,
      },
    },
    {
      "@type": "OfferCatalog",
      "@id": `${siteUrl}/#offer-catalog`,
      name: "DaytonGrowthCo Business Tools and Digital Systems",
      itemListElement: [
        {
          "@type": "Offer",
          name: "Custom Business Systems",
          description:
            "Phone agents, quote calculators, project dashboards, customer portals, staff dashboards, training libraries, and internal workflows.",
          url: `${siteUrl}/what-we-build/`,
        },
        {
          "@type": "Offer",
          name: "Website and SEO Setup",
          description:
            "Modern websites, service pages, sales pages, technical SEO, local SEO, and answer-engine-ready content for small businesses.",
          url: `${siteUrl}/website-design/`,
          priceSpecification: {
            "@type": "PriceSpecification",
            priceCurrency: "USD",
            price: "1500",
            description: "Website builds start at $1,500.",
          },
        },
        {
          "@type": "Offer",
          name: "AI-Assisted Workflow Automation",
          description:
            "Focused automations and custom tools that reduce repeated entry, missed handoffs, slow quoting, and administrative drag.",
          url: `${siteUrl}/how-it-works/`,
        },
      ],
    },
  ],
};

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
    icon: faviconUrl,
    shortcut: faviconUrl,
    apple: faviconUrl,
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
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.clarity.ms" />
        <link rel="alternate" type="text/plain" href="/llms.txt" />
        <link rel="alternate" type="text/markdown" href="/md/index.md" />
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
                  window.sessionStorage.setItem("dgc:splash-seen", "1");
                  document.documentElement.classList.add("dgc-splash-pending");
                }
                window.setTimeout(function () {
                  document.documentElement.classList.add("dgc-splash-seen");
                  document.documentElement.classList.remove("dgc-splash-pending");
                  if (document.body) document.body.classList.remove("splash-lock");
                  var bootSplash = document.getElementById("boot-splash");
                  if (bootSplash) {
                    bootSplash.hidden = true;
                    bootSplash.setAttribute("aria-hidden", "true");
                  }
                }, 5000);
              } catch (error) {
                document.documentElement.classList.add("dgc-splash-seen");
                document.documentElement.classList.remove("dgc-splash-pending");
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
        <script
          id="dgc-site-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteSchema) }}
        />
      </head>
      <body>
        <div id="boot-splash" aria-hidden="true" />
        {children}
        <Script
          id="google-analytics-loader"
          src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`}
          strategy="lazyOnload"
        />
        <Script
          id="google-analytics-config"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag("js", new Date());
              gtag("config", "${googleAnalyticsId}");
            `,
          }}
        />
        <Script
          id="microsoft-clarity"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{
            __html: `
              (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "${clarityProjectId}");
            `,
          }}
        />
        <Script src="/legal-overlay.js" strategy="afterInteractive" />
        <Script src="/page-transitions.js?v=5" strategy="afterInteractive" />
      </body>
    </html>
  );
}
