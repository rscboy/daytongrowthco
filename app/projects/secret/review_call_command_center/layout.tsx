import type { Metadata } from "next";
import { requireSecretProjectAccess } from "@/lib/secret-project-access";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Google Review Voicemail Command Center",
  description: "A private DaytonGrowthCo voicemail prospecting workspace.",
  robots: { index: false, follow: false, nocache: true },
};

export default async function ReviewCallCommandCenterLayout({ children }: { children: React.ReactNode }) {
  await requireSecretProjectAccess("review_call_command_center");
  return children;
}
