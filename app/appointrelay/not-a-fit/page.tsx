import type { Metadata } from "next";
import { AppointRelayNotFitPage } from "@/src/appointrelay-funnel";
export const metadata: Metadata = { title: "AppointRelay™ Assessment Result", robots: { index: false, follow: false } };
export default function AppointRelayNotFitRoute() { return <AppointRelayNotFitPage />; }
