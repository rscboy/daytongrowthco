import type { Metadata } from "next";
import HomeApp from "../../src/main";

export const metadata: Metadata = {
  title: "About DaytonGrowthCo. | Tools and Digital Systems",
  description:
    "Meet DaytonGrowthCo. We build phone agents, quote tools, dashboards, portals, content, and custom apps for small businesses in Dayton, Ohio and beyond.",
  alternates: {
    canonical: "https://www.daytongrowth.co/aboutus/",
    types: { "text/markdown": "/md/about.md" },
  },
};

const aboutSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "AboutPage",
      "@id": "https://www.daytongrowth.co/aboutus#webpage",
      url: "https://www.daytongrowth.co/aboutus/",
      name: "About DaytonGrowthCo.",
      description:
        "About DaytonGrowthCo, a Dayton, Ohio company building custom business tools, automations, websites, phone agents, quote tools, dashboards, portals, and custom apps.",
      isPartOf: { "@id": "https://www.daytongrowth.co/#website" },
      about: { "@id": "https://www.daytongrowth.co/#organization" },
      dateModified: "2026-06-29",
      inLanguage: "en-US",
    },
    {
      "@type": "Person",
      "@id": "https://www.daytongrowth.co/aboutus#founder",
      name: "Samuel Caruso",
      jobTitle: "Founder",
      worksFor: { "@id": "https://www.daytongrowth.co/#organization" },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://www.daytongrowth.co/" },
        { "@type": "ListItem", position: 2, name: "About", item: "https://www.daytongrowth.co/aboutus/" },
      ],
    },
  ],
};

export default function Page() {
  return (
    <>
      <script
        id="dgc-about-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutSchema) }}
      />
      <HomeApp initialPath="/aboutus" />
    </>
  );
}
