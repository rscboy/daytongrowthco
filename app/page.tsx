import HomeApp from "../src/main";

const homePageSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": "https://www.daytongrowth.co/#webpage",
      url: "https://www.daytongrowth.co/",
      name: "DaytonGrowthCo. | Website Migration, Better Quote, AppointRelay, and HVAC Review Growth",
      description:
        "DaytonGrowthCo offers The Better Quote Program™, The Website Migration Program™, AppointRelay™ for operational appointment queues, and The HVAC Google Review Growth Program™.",
      isPartOf: { "@id": "https://www.daytongrowth.co/#website" },
      about: { "@id": "https://www.daytongrowth.co/#organization" },
      mainEntity: { "@id": "https://www.daytongrowth.co/#primary-service" },
      inLanguage: "en-US",
      dateModified: "2026-08-12",
    },
    {
      "@type": "FAQPage",
      "@id": "https://www.daytongrowth.co/#faq",
      mainEntity: [
        {
          "@type": "Question",
          name: "What kind of problem should I bring?",
          acceptedAnswer: {
            "@type": "Answer",
            text:
              "Start with work that repeats, stalls, gets missed, or costs more than it should. DaytonGrowthCo will help identify the smallest useful next step.",
          },
        },
        {
          "@type": "Question",
          name: "Do you replace the tools we already use?",
          acceptedAnswer: {
            "@type": "Answer",
            text:
              "Not automatically. DaytonGrowthCo keeps what works, configures existing tools when they fit, and builds only where the workflow needs something more specific.",
          },
        },
        {
          "@type": "Question",
          name: "How are scope and pricing handled?",
          acceptedAnswer: {
            "@type": "Answer",
            text:
              "You receive a written scope that explains what is included, what it costs, and what happens next before the work begins.",
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
