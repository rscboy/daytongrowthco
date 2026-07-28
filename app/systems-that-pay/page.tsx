import type { Metadata } from "next";
import SystemsThatPayApp from "../../src/systems-that-pay";

export const metadata: Metadata = {
  title: "Free Website Redesign for Dayton Businesses | DaytonGrowthCo.",
  description:
    "Enter the DaytonGrowthCo. monthly drawing for a free homepage redesign, built to make your business clearer and easier to contact.",
  alternates: { canonical: "/systems-that-pay/" },
  openGraph: {
    title: "Free Website Redesign for Dayton Businesses | DaytonGrowthCo.",
    images: ["/thumbnail.jpeg"],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/thumbnail.jpeg"],
  },
};

export default function Page() {
  return <SystemsThatPayApp />;
}
