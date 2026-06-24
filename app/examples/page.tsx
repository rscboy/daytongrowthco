import type { Metadata } from "next";
import HomeApp from "../../src/main";

export const metadata: Metadata = {
  title: "Examples | DaytonGrowthCo.",
  description:
    "Interactive demonstrations of DaytonGrowthCo systems: website before/after, AI search visibility, phone-agent scheduling, spreadsheet-to-dashboard, and quote builders.",
  alternates: {
    canonical: "/examples/",
    types: { "text/markdown": "/md/examples.md" },
  },
};

const examplesSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "CollectionPage",
      "@id": "https://www.daytongrowth.co/examples/#webpage",
      url: "https://www.daytongrowth.co/examples/",
      name: "Examples of DaytonGrowthCo Systems",
      description:
        "Interactive examples showing how DaytonGrowthCo turns specific business problems into focused tools, websites, AI visibility systems, spreadsheet workflows, and quote builders.",
      isPartOf: { "@id": "https://www.daytongrowth.co/#website" },
      about: { "@id": "https://www.daytongrowth.co/#primary-service" },
      dateModified: "2026-06-24",
      inLanguage: "en-US",
    },
    {
      "@type": "ItemList",
      "@id": "https://www.daytongrowth.co/examples/#examples",
      name: "DaytonGrowthCo example systems",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Website before and after redesign example" },
        { "@type": "ListItem", position: 2, name: "AI search visibility and answer readiness example" },
        { "@type": "ListItem", position: 3, name: "Phone agent and scheduling workflow example" },
        { "@type": "ListItem", position: 4, name: "Spreadsheet to dashboard transformation example" },
        { "@type": "ListItem", position: 5, name: "Quote workflow and pricing rules example" },
      ],
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://www.daytongrowth.co/" },
        { "@type": "ListItem", position: 2, name: "Examples", item: "https://www.daytongrowth.co/examples/" },
      ],
    },
  ],
};

export default function Page() {
  return (
    <>
      <script
        id="dgc-examples-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(examplesSchema) }}
      />
      <HomeApp initialPath="/examples" />
    </>
  );
}
