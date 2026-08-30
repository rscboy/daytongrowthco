import type { Metadata } from "next";
import { AppointRelayConfirmedPage } from "@/src/appointrelay-booking";
export const metadata: Metadata = { title: "AppointRelay™ Call Confirmed", robots: { index: false, follow: false } };
export default function AppointRelayConfirmedRoute() { return <AppointRelayConfirmedPage />; }
