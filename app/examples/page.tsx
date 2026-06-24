import type { Metadata } from "next";
import HomeApp from "../../src/main";

export const metadata: Metadata = {
  title: "Examples | DaytonGrowthCo.",
  description:
    "Interactive demonstrations of DaytonGrowthCo systems: website before/after, AI search visibility, phone-agent scheduling, spreadsheet-to-dashboard, and quote builders.",
  alternates: { canonical: "/examples/" },
};

export default function Page() {
  return <HomeApp initialPath="/examples" />;
}
