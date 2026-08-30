import type { Metadata } from "next";
import { AppointRelayLegalPage } from "@/src/appointrelay-funnel";

export const metadata: Metadata = { title: "Terms | AppointRelay™", robots: { index: false, follow: true } };

export default function AppointRelayTermsRoute() { return <AppointRelayLegalPage type="terms" />; }
