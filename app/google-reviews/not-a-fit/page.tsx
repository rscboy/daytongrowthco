import type { Metadata } from "next";
import { GoogleReviewProgramNotFitPage } from "@/src/google-review-program-funnel";

export const metadata: Metadata = { title: "Google Review Program Assessment Result", robots: { index: false, follow: false } };
export default function GoogleReviewProgramNotFitRoute() { return <GoogleReviewProgramNotFitPage />; }
