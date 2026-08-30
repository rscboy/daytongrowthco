import type { Metadata } from "next";
import { TaaFeePlannerCalculator } from "./calculator";
import { requireSecretProjectAccess } from "@/lib/secret-project-access";

const calculatorUrl = "https://www.daytongrowth.co/projects/secret/taa_roi_calculator/v3";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Travel Agent Academy Planning-Fee Planner",
  description: "Private planning-fee income and ad-spend calculator for travel advisors.",
  alternates: { canonical: calculatorUrl },
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false, noimageindex: true, noarchive: true } },
};

export default async function SecretTaaFeePlannerPage() {
  await requireSecretProjectAccess("taa_roi_calculator_v3");
  return <TaaFeePlannerCalculator />;
}
