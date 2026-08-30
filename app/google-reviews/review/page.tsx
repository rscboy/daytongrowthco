import type { Metadata } from "next";
import { GoogleReviewProgramReviewPage } from "@/src/google-review-program-funnel";

export const metadata: Metadata = { title: "Google Review Program Assessment Review", robots: { index: false, follow: false } };
export default function GoogleReviewProgramReviewRoute() { return <GoogleReviewProgramReviewPage />; }
