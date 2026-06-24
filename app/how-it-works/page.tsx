import type { Metadata } from "next";
import HomeApp from "../../src/main";

export const metadata: Metadata = {
  title: "How It Works | DaytonGrowthCo.",
  description:
    "How DaytonGrowthCo diagnoses a process, measures what the current way costs, and builds the smallest useful fix: principles, engagement steps, and a labor-cost calculator.",
  alternates: { canonical: "/how-it-works/" },
};

export default function Page() {
  return <HomeApp initialPath="/how-it-works" />;
}
