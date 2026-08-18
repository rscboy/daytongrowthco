import type { Metadata } from "next";
import HomeApp from "../../src/main";

const url = "https://www.daytongrowth.co/products/";

export const metadata: Metadata = {
  title: "Products | Quote Shopping, Website Migration & Tools",
  description: "Explore The Better Quote Program™, The Website Migration Program™, and focused products for calls, follow-up, reviews, estimates, dashboards, and local visibility.",
  alternates: { canonical: url, types: { "text/markdown": "/md/products.md" } },
  openGraph: { title: "Products | DaytonGrowthCo.", description: "Two flagship programs and focused products for calls, follow-up, reviews, estimates, dashboards, and local visibility.", url, images: ["/thumbnail.jpeg"] },
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
        { "@type": "ListItem", position: 1, name: "The Better Quote Program™", url: "https://www.daytongrowth.co/quote/" },
        { "@type": "ListItem", position: 2, name: "The Website Migration Program™", url: "https://www.daytongrowth.co/website/" },
        { "@type": "ListItem", position: 3, name: "24/7 Phone Answering & Booking", url: "https://www.daytongrowth.co/ai-phone-agents/" },
        { "@type": "ListItem", position: 4, name: "Estimate & Proposal Tools", url: "https://www.daytongrowth.co/quote-tools/" },
        { "@type": "ListItem", position: 5, name: "Dashboards & Portals", url: "https://www.daytongrowth.co/dashboards-portals/" },
        { "@type": "ListItem", position: 6, name: "Automated Google Review Texting", url: "https://www.daytongrowth.co/google-review-texting/" },
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
