import type { Metadata } from "next";
import { AppointRelayLandingPage } from "@/src/appointrelay-funnel";

export const metadata: Metadata = {
  title: "AppointRelay™ | AI Appointment Setting for Operational Teams",
  description: "AppointRelay works approved customer queues, captures usable scheduling preferences, and gives dispatch a clean handoff while your team controls every final appointment.",
  alternates: { canonical: "/appointrelay/" },
  openGraph: {
    title: "AppointRelay™ | Work the appointment queue your team can’t keep up with",
    description: "Human-controlled appointment automation for commercial HVAC, furniture delivery, and rule-driven field operations.",
    url: "/appointrelay/",
  },
};

export default function AppointRelayRoute() { return <AppointRelayLandingPage />; }
