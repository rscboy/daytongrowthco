import type { Metadata } from "next";
import HomeApp from "../../src/main";

const url = "https://www.daytongrowth.co/missed-call-follow-up";

export const metadata: Metadata = {
  title: "Automated Follow-Up and Scheduling for Trades | DaytonGrowthCo.",
  description: "Automated follow-up and scheduling tools for mechanics, contractors, and trade businesses, covering missed calls, web leads, estimates, and booking requests.",
  alternates: { canonical: url },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    url,
    title: "Automated Follow-Up and Scheduling for Trades",
    description: "Keep missed calls, web leads, sent estimates, and booking requests moving while your team stays in control.",
    images: ["/thumbnail.jpeg"],
  },
};

export default function Page() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        "@id": `${url}#service`,
        name: "Automated Follow-Up and Scheduling for Trades",
        serviceType: "Automated missed-call follow-up, estimate follow-up, lead nurturing, and scheduling",
        url,
        description: "Automated follow-up and scheduling systems for mechanics, contractors, and other trade businesses handling missed calls, web leads, sent estimates, and booking requests.",
        provider: { "@id": "https://www.daytongrowth.co/#organization" },
        audience: { "@type": "BusinessAudience", audienceType: "Mechanics, contractors, and trade businesses with open estimates, missed calls, or booking requests" },
        areaServed: [{ "@type": "City", name: "Dayton", addressRegion: "OH", addressCountry: "US" }, { "@type": "Country", name: "United States" }],
      },
      { "@type": "WebPage", "@id": `${url}#webpage`, url, name: "Automated Follow-Up and Scheduling for Trades", isPartOf: { "@id": "https://www.daytongrowth.co/#website" }, mainEntity: { "@id": `${url}#service` }, inLanguage: "en-US", dateModified: "2026-08-18" },
      { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: "https://www.daytongrowth.co/" }, { "@type": "ListItem", position: 2, name: "Products", item: "https://www.daytongrowth.co/products" }, { "@type": "ListItem", position: 3, name: "Automated Follow-Up and Scheduling", item: url }] },
    ],
  };

  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} /><HomeApp initialPath="/missed-call-follow-up" /></>;
}
