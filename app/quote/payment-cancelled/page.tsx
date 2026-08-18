import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";
import { Footer, Header } from "@/src/better-quote-funnel";

export const metadata: Metadata = { title: "Payment Not Completed | The Better Quote Program™", robots: { index: false, follow: false } };

export default function Page() {
  return <main className="quote-shell"><Header /><section className="quote-result"><div className="quote-result-icon"><FileText size={28} aria-hidden="true" /></div><p className="quote-eyebrow">No payment completed</p><h1>Your Better Quote result is still private.</h1><p>You were not charged by this checkout attempt. Use the secure link in your email if you decide to continue, or reply with any questions first.</p><Link className="quote-outline-button" href="/quote/">Review the program <ArrowRight size={16} aria-hidden="true" /></Link></section><Footer /></main>;
}
