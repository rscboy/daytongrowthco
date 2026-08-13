import type { Metadata } from "next";
import { TaaCalculator } from "./calculator";

const calculatorUrl = "https://daytongrowth.co/projects/taa/calculator_coop";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "TAA Lead Generation Calculator",
  description: "Private Travel Agent Academy lead-generation planning calculator.",
  alternates: { canonical: calculatorUrl },
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true, noarchive: true },
  },
};

export default function CalculatorPage() {
  return <TaaCalculator />;
}
