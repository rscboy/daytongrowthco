import type { Metadata } from "next";
import { AppointRelayReviewPage } from "@/src/appointrelay-funnel";
export const metadata: Metadata = { title: "AppointRelay™ Assessment Review", robots: { index: false, follow: false } };
export default function AppointRelayReviewRoute() { return <AppointRelayReviewPage />; }
