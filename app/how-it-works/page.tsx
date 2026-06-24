import type { Metadata } from "next";
import HomeApp from "../../src/main";

export const metadata: Metadata = {
  title: "How It Works | DaytonGrowthCo.",
  description:
    "How DaytonGrowthCo diagnoses a process, measures what the current way costs, and builds the smallest useful fix: principles, engagement steps, and a labor-cost calculator.",
  alternates: {
    canonical: "/how-it-works/",
    types: { "text/markdown": "/md/how-it-works.md" },
  },
};

const howItWorksSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": "https://www.daytongrowth.co/how-it-works/#webpage",
      url: "https://www.daytongrowth.co/how-it-works/",
      name: "How DaytonGrowthCo Builds Custom Business Tools",
      description:
        "DaytonGrowthCo starts with the expensive bottleneck, maps the process, estimates the cost of the current workflow, and recommends the smallest useful fix before building custom software.",
      isPartOf: { "@id": "https://www.daytongrowth.co/#website" },
      about: { "@id": "https://www.daytongrowth.co/#primary-service" },
      dateModified: "2026-06-24",
      inLanguage: "en-US",
    },
    {
      "@type": "HowTo",
      "@id": "https://www.daytongrowth.co/how-it-works/#diagnosis-process",
      name: "How DaytonGrowthCo evaluates a business process before building",
      description:
        "A diagnosis process for deciding whether a business needs existing software setup, a focused automation, or a custom tool.",
      step: [
        { "@type": "HowToStep", position: 1, name: "Identify the bottleneck", text: "Find the process that costs the most time, errors, lost work, or administrative drag." },
        { "@type": "HowToStep", position: 2, name: "Map the workflow", text: "Document what comes in, what the team does today, and what output the business needs." },
        { "@type": "HowToStep", position: 3, name: "Estimate the cost", text: "Compare wasted labor and missed capacity against the cost of setup, automation, or a custom build." },
        { "@type": "HowToStep", position: 4, name: "Recommend the smallest useful fix", text: "Use existing tools when they fit and build custom only where the process creates an advantage." },
      ],
    },
    {
      "@type": "FAQPage",
      "@id": "https://www.daytongrowth.co/how-it-works/#faq",
      mainEntity: [
        {
          "@type": "Question",
          name: "Do small businesses need custom software?",
          acceptedAnswer: {
            "@type": "Answer",
            text:
              "Often no. Many small-business workflow problems can be solved by setting up or connecting existing tools. Custom software is reserved for steps where the business process is genuinely different.",
          },
        },
        {
          "@type": "Question",
          name: "How can custom business tools be affordable?",
          acceptedAnswer: {
            "@type": "Answer",
            text:
              "DaytonGrowthCo builds with AI-assisted development, which reduces many of the hours a traditional development shop would bill for. The work still starts with the business process and human review.",
          },
        },
        {
          "@type": "Question",
          name: "How does DaytonGrowthCo decide whether a project is worth building?",
          acceptedAnswer: {
            "@type": "Answer",
            text:
              "DaytonGrowthCo estimates what the current process costs in time, errors, and capacity, then compares that cost to the recommended setup, automation, or custom build.",
          },
        },
      ],
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://www.daytongrowth.co/" },
        { "@type": "ListItem", position: 2, name: "How It Works", item: "https://www.daytongrowth.co/how-it-works/" },
      ],
    },
  ],
};

export default function Page() {
  return (
    <>
      <script
        id="dgc-how-it-works-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howItWorksSchema) }}
      />
      <HomeApp initialPath="/how-it-works" />
    </>
  );
}
