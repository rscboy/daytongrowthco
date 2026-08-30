import type { Metadata } from "next";
import { GoogleReviewProgramContactPage } from "@/src/google-review-program-funnel";

export const metadata: Metadata = { title: "Contact | HVAC Google Review Growth Program™", robots: { index: false, follow: true } };
export default function GoogleReviewProgramContactRoute() { return <GoogleReviewProgramContactPage />; }
