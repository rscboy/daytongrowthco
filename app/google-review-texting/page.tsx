import type { Metadata } from "next";
import HomeApp from "../../src/main";

const url = "https://www.daytongrowth.co/google-review-texting/";

export const metadata: Metadata = {
  title: "Automated Google Review Texting | DaytonGrowthCo.",
  description: "Automated Google review texting for local service and appointment-based businesses. Personalized review requests send after completed services with a direct Google review link.",
  alternates: { canonical: url },
  openGraph: { title: "Automated Google Review Texting | DaytonGrowthCo.", description: "A managed system that asks customers for an honest Google review after completed appointments and services.", url, images: ["/thumbnail.jpeg"] },
};

export default function Page() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Automated Google Review Texting",
    url,
    description: "A managed review-request system that sends customers a personalized text and direct Google review link after a completed appointment or service.",
    provider: { "@id": "https://www.daytongrowth.co/#organization" },
    areaServed: [{ "@type": "City", name: "Dayton", addressRegion: "OH", addressCountry: "US" }, { "@type": "Country", name: "United States" }],
    offers: {
      "@type": "Offer",
      priceCurrency: "USD",
      price: "499",
      description: "$499 setup plus $199/month for ongoing system management, hosting, monitoring, maintenance, text-message allowance, adjustments, and support.",
    },
  };

  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} /><HomeApp initialPath="/google-review-texting" /></>;
}
