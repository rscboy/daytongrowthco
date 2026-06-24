import type { Metadata } from "next";
import HomeApp from "../../src/main";

export const metadata: Metadata = {
  title: "What We Build | DaytonGrowthCo.",
  description:
    "From websites and local discovery to phone agents, quote tools, dashboards, and custom apps. See the full range of systems DaytonGrowthCo builds for small and midsized businesses nationwide.",
  alternates: {
    canonical: "/what-we-build/",
    types: { "text/markdown": "/md/what-we-build.md" },
  },
};

const whatWeBuildSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "CollectionPage",
      "@id": "https://www.daytongrowth.co/what-we-build/#webpage",
      url: "https://www.daytongrowth.co/what-we-build/",
      name: "What DaytonGrowthCo Builds",
      description:
        "A guide to the websites, SEO systems, phone agents, quote tools, dashboards, customer portals, automations, and custom apps DaytonGrowthCo builds for small and midsized businesses.",
      isPartOf: { "@id": "https://www.daytongrowth.co/#website" },
      about: { "@id": "https://www.daytongrowth.co/#primary-service" },
      dateModified: "2026-06-24",
      inLanguage: "en-US",
    },
    {
      "@type": "ItemList",
      "@id": "https://www.daytongrowth.co/what-we-build/#capabilities",
      name: "DaytonGrowthCo capabilities",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Modern websites and service pages" },
        { "@type": "ListItem", position: 2, name: "SEO and answer engine optimization" },
        { "@type": "ListItem", position: 3, name: "Phone agents and intake systems" },
        { "@type": "ListItem", position: 4, name: "Quote tools and estimate builders" },
        { "@type": "ListItem", position: 5, name: "Dashboards, customer portals, and custom apps" },
      ],
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://www.daytongrowth.co/" },
        { "@type": "ListItem", position: 2, name: "What We Build", item: "https://www.daytongrowth.co/what-we-build/" },
      ],
    },
  ],
};

export default function Page() {
  return (
    <>
      <script
        id="dgc-what-we-build-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(whatWeBuildSchema) }}
      />
      <HomeApp initialPath="/what-we-build" />
    </>
  );
}
