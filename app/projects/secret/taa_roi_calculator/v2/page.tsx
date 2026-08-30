import type { Metadata } from "next";
import { TaaAnnualProfitCalculator } from "./calculator";
import { requireSecretProjectAccess } from "@/lib/secret-project-access";

const calculatorUrl = "https://www.daytongrowth.co/projects/secret/taa_roi_calculator/v2";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Travel Agent Academy Profit Planner",
  description: "Private annual ad-spend and profit planner for Travel Agent Academy.",
  alternates: { canonical: calculatorUrl },
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true, noarchive: true },
  },
};

export default async function SecretTaaProfitPlannerPage() {
  await requireSecretProjectAccess("taa_roi_calculator_v2");
  return <TaaAnnualProfitCalculator />;
}
