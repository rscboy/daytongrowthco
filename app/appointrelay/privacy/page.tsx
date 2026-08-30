import type { Metadata } from "next";
import { AppointRelayLegalPage } from "@/src/appointrelay-funnel";

export const metadata: Metadata = { title: "Privacy | AppointRelay™", robots: { index: false, follow: true } };

export default function AppointRelayPrivacyRoute() { return <AppointRelayLegalPage type="privacy" />; }
