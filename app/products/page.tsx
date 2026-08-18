import type { Metadata } from "next";
import HomeApp from "../../src/main";

const url = "https://www.daytongrowth.co/products";

export const metadata: Metadata = {
  title: "AI Automation, Custom Software & Business Tools",
  description: "Explore DaytonGrowthCo's AI automation, custom software, AI phone agents, workflow automation, quote tools, Website Migration, Better Quote, and supporting services.",
  alternates: { canonical: url, types: { "text/markdown": "/md/products.md" } },
  robots: { index: true, follow: true },
  openGraph: { title: "AI Automation, Custom Software & Business Tools", description: "AI automation, custom software, two flagship programs, and focused products for calls, follow-up, estimates, and operations.", url, images: ["/thumbnail.jpeg"] },
  twitter: { card: "summary_large_image", title: "Products | DaytonGrowthCo.", description: "Two flagship programs and focused business products.", images: ["/thumbnail.jpeg"] },
};

const productsSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "CollectionPage",
      "@id": `${url}#webpage`,
      url,
      name: "DaytonGrowthCo Products",
      description: "The Better Quote Program™, The Website Migration Program™, and focused products for calls, follow-up, reviews, estimates, dashboards, and local visibility.",
      isPartOf: { "@id": "https://www.daytongrowth.co/#website" },
      about: { "@id": "https://www.daytongrowth.co/#primary-service" },
      dateModified: "2026-08-13",
      inLanguage: "en-US",
    },
    {
      "@type": "ItemList",
      "@id": `${url}#products`,
      name: "DaytonGrowthCo products",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "AI Automation and Custom Software", url: "https://www.daytongrowth.co/ai-automation" },
        { "@type": "ListItem", position: 2, name: "The Better Quote Program™", url: "https://www.daytongrowth.co/quote" },
        { "@type": "ListItem", position: 3, name: "The Website Migration Program™", url: "https://www.daytongrowth.co/website" },
        { "@type": "ListItem", position: 4, name: "AI Phone Agents for Small Businesses", url: "https://www.daytongrowth.co/ai-phone-agents" },
        { "@type": "ListItem", position: 5, name: "Custom Quote and Estimate Tools", url: "https://www.daytongrowth.co/quote-tools" },
        { "@type": "ListItem", position: 6, name: "Automated Follow-Up and Scheduling", url: "https://www.daytongrowth.co/missed-call-follow-up" },
        { "@type": "ListItem", position: 7, name: "Local SEO and AI Search Visibility", url: "https://www.daytongrowth.co/local-search" },
        { "@type": "ListItem", position: 8, name: "Dashboards & Portals", url: "https://www.daytongrowth.co/dashboards-portals" },
        { "@type": "ListItem", position: 9, name: "Automated Google Review Texting", url: "https://www.daytongrowth.co/google-review-texting" },
      ],
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://www.daytongrowth.co/" },
        { "@type": "ListItem", position: 2, name: "Products", item: url },
      ],
    },
  ],
};

export default function ProductsPage() {
  return <><script id="dgc-products-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productsSchema) }} /><HomeApp initialPath="/products" /></>;
}
