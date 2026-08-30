import type { Metadata } from "next";
import { GoogleReviewProgramConfirmedPage } from "@/src/google-review-program-booking";

export const metadata: Metadata = { title: "Google Review Program Call Confirmed", robots: { index: false, follow: false } };
export default function GoogleReviewProgramConfirmedRoute() { return <GoogleReviewProgramConfirmedPage />; }
