import type { Metadata } from "next";
import { ConversionConfirmedPage } from "@/src/conversion-funnel";

export const metadata: Metadata = { title: "Consultation Confirmed", robots: { index: false, follow: false } };
export default function Page() { return <ConversionConfirmedPage />; }
