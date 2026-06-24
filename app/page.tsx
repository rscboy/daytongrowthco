import HomeApp from "../src/main";

const homePageSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": "https://www.daytongrowth.co/#webpage",
      url: "https://www.daytongrowth.co/",
      name: "DaytonGrowthCo. | Practical Business Tools and Digital Systems",
      description:
        "DaytonGrowthCo builds custom business tools, automations, websites, phone agents, quote tools, dashboards, portals, and custom apps for small and midsized businesses.",
      isPartOf: { "@id": "https://www.daytongrowth.co/#website" },
      about: { "@id": "https://www.daytongrowth.co/#organization" },
      mainEntity: { "@id": "https://www.daytongrowth.co/#primary-service" },
      inLanguage: "en-US",
      dateModified: "2026-06-24",
    },
    {
      "@type": "FAQPage",
      "@id": "https://www.daytongrowth.co/#faq",
      mainEntity: [
        {
          "@type": "Question",
          name: "What does DaytonGrowthCo build?",
          acceptedAnswer: {
            "@type": "Answer",
            text:
              "DaytonGrowthCo builds phone agents, quote tools, dashboards, customer portals, training systems, websites, sales materials, and custom business apps around the way small and midsized businesses actually work.",
          },
        },
        {
          "@type": "Question",
          name: "How does DaytonGrowthCo reduce custom development cost?",
          acceptedAnswer: {
            "@type": "Answer",
            text:
              "DaytonGrowthCo uses AI-assisted development to reduce the hours a traditional custom development shop would bill for. The goal is custom-fit software, websites, and automations at a price small businesses can justify.",
          },
        },
        {
          "@type": "Question",
          name: "Who is DaytonGrowthCo for?",
          acceptedAnswer: {
            "@type": "Answer",
            text:
              "DaytonGrowthCo works with small and midsized businesses, contractors, service companies, professional offices, and owner-operated teams that rely on manual quoting, intake, scheduling, follow-up, spreadsheets, or scattered customer information.",
          },
        },
      ],
    },
  ],
};

export default function Page() {
  return (
    <>
      <script
        id="dgc-homepage-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homePageSchema) }}
      />
      <HomeApp initialPath="/" />
    </>
  );
}
