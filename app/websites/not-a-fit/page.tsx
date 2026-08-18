import type { Metadata } from "next";
import { ConversionNotFitPage } from "@/src/conversion-funnel";

export const metadata: Metadata = { title: "Website Migration Assessment | DaytonGrowthCo.", robots: { index: false, follow: false } };

export default function Page() { return <ConversionNotFitPage />; }
