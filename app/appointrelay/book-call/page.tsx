import type { Metadata } from "next";
import { AppointRelayBookingPage } from "@/src/appointrelay-booking";
export const metadata: Metadata = { title: "Book an AppointRelay™ Workflow Fit Call", robots: { index: false, follow: false } };
export default function AppointRelayBookingRoute() { return <AppointRelayBookingPage />; }
