import type { Metadata } from "next";
import { ConversionBookingPage } from "@/src/conversion-funnel";

export const metadata: Metadata = { title: "Book a Website Migration Consultation", robots: { index: false, follow: false } };

export default function Page() {
  return <ConversionBookingPage />;
}
