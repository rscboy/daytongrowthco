import type { Metadata } from "next";
import { GoogleReviewProgramLegalPage } from "@/src/google-review-program-funnel";

export const metadata: Metadata = { title: "Privacy | HVAC Google Review Growth Program™", robots: { index: false, follow: true } };
export default function GoogleReviewProgramPrivacyRoute() { return <GoogleReviewProgramLegalPage type="privacy" />; }
