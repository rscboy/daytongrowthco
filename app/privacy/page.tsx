import type { Metadata } from "next";
import { ConversionLegalPage } from "@/src/conversion-funnel";

export const metadata: Metadata = { title: "Privacy Policy", robots: { index: false, follow: false } };
export default function Page() { return <ConversionLegalPage type="privacy" />; }
