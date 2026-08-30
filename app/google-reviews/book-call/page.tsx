import type { Metadata } from "next";
import { GoogleReviewProgramBookingPage } from "@/src/google-review-program-booking";

export const metadata: Metadata = { title: "Check Your HVAC Google Review Growth Program™ Fit", robots: { index: false, follow: false } };
export default function GoogleReviewProgramBookingRoute() { return <GoogleReviewProgramBookingPage />; }
