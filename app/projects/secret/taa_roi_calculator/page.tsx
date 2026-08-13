import type { Metadata } from "next";
import { TaaCalculator } from "../../taa/calculator_coop/calculator";

const calculatorUrl = "https://daytongrowth.co/projects/secret/taa_roi_calculator";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Travel Agent Academy ROI Calculator",
  description:
    "Private calculator for modeling qualified travel lead economics, payback, and target ROI.",
  alternates: { canonical: calculatorUrl },
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
      noarchive: true,
    },
  },
};

export default function SecretTaaRoiCalculatorPage() {
  return <TaaCalculator />;
}
