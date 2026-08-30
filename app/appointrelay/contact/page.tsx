import type { Metadata } from "next";
import { AppointRelayContactPage } from "@/src/appointrelay-funnel";
export const metadata: Metadata = { title: "Contact | AppointRelay™", robots: { index: false, follow: true } };
export default function AppointRelayContactRoute() { return <AppointRelayContactPage />; }
