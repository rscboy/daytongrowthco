import type { Metadata } from "next";
import { AppointRelayQueueAuditPage } from "@/src/appointrelay-funnel";

export const metadata: Metadata = { title: "Free Appointment-Queue Audit | AppointRelay™", robots: { index: true, follow: true } };

export default function AppointRelayQueueAuditRoute() { return <AppointRelayQueueAuditPage />; }
