import type { Metadata } from "next";
import HomeApp from "../../src/main";

export const metadata: Metadata = {
  title: "What We Build | DaytonGrowthCo.",
  description:
    "From websites and local discovery to phone agents, quote tools, dashboards, and custom apps. See the full range of systems DaytonGrowthCo builds for small and midsized businesses nationwide.",
  alternates: { canonical: "/what-we-build/" },
};

export default function Page() {
  return <HomeApp initialPath="/what-we-build" />;
}
