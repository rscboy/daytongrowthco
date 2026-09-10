import type { Metadata } from "next";

const demoUrl = "https://www.daytongrowth.co/projects/secret/rep_recon_demo";

export const metadata: Metadata = {
  title: "RepRecon Demo",
  description: "Private RepRecon field-intelligence product mockup.",
  alternates: { canonical: demoUrl },
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
      noarchive: true,
    },
  },
};

export default function RepReconDemoPage() {
  return (
    <main className="h-screen w-screen overflow-hidden bg-[#f3f6fa]">
      <iframe
        title="RepRecon demo"
        src="/projects/secret/rep_recon_demo/app/"
        className="h-full w-full border-0"
        allow="clipboard-write"
      />
    </main>
  );
}
