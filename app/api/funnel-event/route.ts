import { NextResponse } from "next/server";

// Use Vercel's project hostname for server-to-server traffic. The public CRM
// hostname is Cloudflare-proxied and can reject an origin-server request before
// it reaches the authenticated CRM endpoint.
const crmEndpoint = "https://daytongrowthco-crm.vercel.app/api/internal/funnel-events";

export async function POST(request: Request) {
  const secret = process.env.FUNNEL_CRM_API_SECRET || process.env.CRM_API_SECRET;
  if (!secret) return NextResponse.json({ ok: false }, { status: 503 });
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") return NextResponse.json({ ok: false }, { status: 400 });
  try {
    const response = await fetch(crmEndpoint, {
      method: "POST",
      headers: { authorization: `Bearer ${secret}`, "content-type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    return NextResponse.json({ ok: response.ok }, { status: response.ok ? 201 : 502 });
  } catch {
    return NextResponse.json({ ok: false }, { status: 502 });
  }
}
