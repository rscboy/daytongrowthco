import { NextResponse } from "next/server";

const crmEndpoint = "https://daytongrowthco-crm.vercel.app/api/internal/funnel-variant";

/** Website CTAs claim the next global A/B assignment from the CRM. */
export async function GET(request: Request) {
  const secret = process.env.FUNNEL_CRM_API_SECRET || process.env.CRM_API_SECRET;
  if (!secret) return new Response("The quote test is temporarily unavailable.", { status: 503 });
  let variant: "dsl" | "video";
  try {
    const claim = await fetch(crmEndpoint, { method: "POST", headers: { authorization: `Bearer ${secret}`, "content-type": "application/json" }, body: JSON.stringify({ funnel: "better-quote" }), cache: "no-store" });
    const result = await claim.json().catch(() => null) as { variant?: unknown } | null;
    if (!claim.ok || (result?.variant !== "dsl" && result?.variant !== "video")) throw new Error("Could not claim an A/B test variant.");
    variant = result.variant;
  } catch {
    // Do not silently favor a variant if the shared counter is unavailable.
    return new Response("The quote test is temporarily unavailable. Please try again shortly.", { status: 503, headers: { "cache-control": "no-store" } });
  }
  const target = new URL(variant === "video" ? "/quote/video/" : "/quote/", request.url);
  const incoming = new URL(request.url);
  incoming.searchParams.forEach((value, key) => target.searchParams.set(key, value));
  return NextResponse.redirect(target, 302);
}
