import type { Metadata } from "next";
import { redirect } from "next/navigation";
export const metadata: Metadata = { title: "Submit Your Quote | The Better Quote Program™", robots: { index: false, follow: false } };
export default function QuoteUploadPage() { redirect("/quote/"); }
