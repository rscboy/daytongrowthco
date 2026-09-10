import type { Metadata } from "next";
import Script from "next/script";
import { SiteAnalytics } from "@/src/site-analytics";
import "../src/index.css";
import "../src/home-flow.css";
import "../src/systems-that-pay.css";
import "../src/website-ownership-calculator.css";
import "../src/air-redesign.css";
import "../src/dgc-redesign.css";
import "../src/homepage-mobile-repair.css";
import "../src/design-system-overhaul.css";

const siteUrl = "https://www.daytongrowth.co";
const faviconUrl = `${siteUrl}/favicon.png`;
const googleAnalyticsId = "G-5844NWC2PD";
const clarityProjectId = "wix3m0k0lr";
const metaPixelId = "925605686456758";
const siteSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["Organization", "LocalBusiness", "ProfessionalService"],
      "@id": `${siteUrl}/#organization`,
      name: "DaytonGrowthCo.",
      foundingDate: "2026",
      url: `${siteUrl}/`,
      logo: faviconUrl,
      image: `${siteUrl}/thumbnail.jpeg`,
      description:
        "DaytonGrowthCo offers The Better Quote Program™, The Website Migration Program™, AppointRelay™ appointment setting, and The HVAC Google Review Growth Program™, plus practical business tools for small and midsized businesses.",
      email: "help@daytongrowth.co",
      telephone: "+1-937-369-0829",
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
        "website migration",
        "website ownership",
        "quote shopping service",
        "The Better Quote Program",
        "AppointRelay AI Appointment Setter Program",
        "The HVAC Google Review Growth Program",
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
          name: "The Better Quote Program™",
          description:
            "Human-led quote shopping for customers with an expensive written service quote. A real person looks for a better qualifying, comparable local option; no qualifying savings means no success fee under the program terms.",
          url: `${siteUrl}/quote/`,
        },
        {
          "@type": "Offer",
          name: "The Website Migration Program™",
          description:
            "A structured migration from a recurring website platform to a self-owned static site, including review, migration planning, testing, launch, and post-launch review.",
          url: `${siteUrl}/website/`,
          priceSpecification: {
            "@type": "PriceSpecification",
            priceCurrency: "USD",
            price: "1500",
            description: "Standard Migration starts at $1,500. The one-time migration investment is separate from recurring domain costs.",
          },
        },
        {
          "@type": "Offer",
          name: "Custom Business Systems",
          description:
            "Phone agents, quote calculators, project dashboards, customer portals, staff dashboards, training libraries, and internal workflows.",
          url: `${siteUrl}/products/`,
        },
        {
          "@type": "Offer",
          name: "AppointRelay™",
          description:
            "A managed AI appointment workflow that contacts approved customers, captures usable scheduling preferences, documents exceptions, and relays clean handoffs while the client retains final scheduling control.",
          url: `${siteUrl}/appointrelay/`,
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
        {
          "@type": "Offer",
          name: "The HVAC Google Review Growth Program™",
          description:
            "A fully managed HVAC review-generation system that connects to completed-job data and sends eligible customers an honest Google review request by SMS and email.",
          url: `${siteUrl}/google-reviews/`,
          priceSpecification: {
            "@type": "PriceSpecification",
            priceCurrency: "USD",
            price: "2500",
            description: "$2,500 annual managed program fee plus actual third-party usage and registration costs. Qualifying HVAC companies receive a 20-new-reviews-in-30-days performance guarantee.",
          },
        },
      ],
    },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "DaytonGrowthCo. | Website Migration & Business Tools",
    template: "%s",
  },
  description:
    "DaytonGrowthCo offers human-led quote shopping, website migration into self-owned static sites, and practical business tools for small teams.",
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
    languages: { "en-US": "/" },
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
    title: "DaytonGrowthCo. | Website Migration & Business Tools",
    description:
      "Human-led quote shopping, website migration, and practical business tools built around your business.",
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
    title: "DaytonGrowthCo. | Website Migration & Business Tools",
    description: "Human-led quote shopping, website migration, and practical business tools for small teams.",
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
        <link rel="dns-prefetch" href="https://connect.facebook.net" />
        <link rel="alternate" type="text/plain" href="/llms.txt" />
        <link rel="alternate" type="text/markdown" href="/md/index.md" />
        <script
          id="dgc-site-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteSchema) }}
        />
      </head>
      <body>
        {children}
        <SiteAnalytics />
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src={`https://www.facebook.com/tr?id=${metaPixelId}&ev=PageView&noscript=1`}
            alt=""
          />
        </noscript>
        <Script
          id="meta-pixel"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${metaPixelId}');
              fbq('track', 'PageView');
            `,
          }}
        />
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
      </body>
    </html>
  );
}
