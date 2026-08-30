import type { Metadata } from "next";
import { GoogleReviewProgramLandingPage } from "@/src/google-review-program-funnel";

const url = "https://www.daytongrowth.co/google-reviews/";

export const metadata: Metadata = {
  title: "HVAC Google Review Growth Program™ | DaytonGrowthCo.",
  description: "A fully managed Google review system for HVAC companies, with 20 new reviews within 30 days of launch guaranteed for qualifying contractors or the $2,500 program fee refunded.",
  alternates: { canonical: url },
  openGraph: {
    title: "The HVAC Google Review Growth Program™ | DaytonGrowthCo.",
    description: "DaytonGrowthCo installs and manages the HVAC service-call trigger, SMS and email infrastructure, review-request workflow, portal, and monitoring for $2,500 per year plus usage.",
    url,
    images: ["/thumbnail.jpeg"],
  },
};

export default function GoogleReviewsRoute() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "The HVAC Google Review Growth Program™",
    url,
    description: "A fully managed system that automatically asks every eligible completed HVAC service customer for an honest Google review by SMS and email.",
    provider: { "@id": "https://www.daytongrowth.co/#organization" },
    areaServed: { "@type": "Country", name: "United States" },
    audience: { "@type": "BusinessAudience", audienceType: "Established residential HVAC service companies" },
    offers: { "@type": "Offer", price: "2500", priceCurrency: "USD", description: "$2,500 annual managed program fee. Qualifying HVAC companies receive a 20-new-reviews-in-30-days performance guarantee. Actual messaging, number, carrier, registration, and related third-party usage costs are separate." },
  };
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} /><GoogleReviewProgramLandingPage /></>;
}
