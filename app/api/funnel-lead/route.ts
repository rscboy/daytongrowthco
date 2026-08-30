import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { createMigrationBookingAccess, migrationBookingCookie, migrationBookingMaxAge } from "@/src/migration-booking-access";

// Keep the assessment handoff off the Cloudflare-proxied public CRM hostname by default.
const crmEndpoint = process.env.FUNNEL_CRM_ENDPOINT || "https://daytongrowthco-crm.vercel.app/api/internal/funnel-leads";

type LeadBody = Record<string, unknown> & { funnel?: unknown; qualification?: unknown; email?: unknown; phone?: unknown };

function validLeadBody(body: unknown): body is LeadBody {
  if (!body || typeof body !== "object") return false;
  const lead = body as LeadBody;
  const email = typeof lead.email === "string" ? lead.email.trim() : "";
  const phone = typeof lead.phone === "string" ? lead.phone.trim() : "";
  return Boolean(email || phone);
}

async function saveFallback(body: LeadBody, reason: string) {
  const id = crypto.randomUUID();
  const date = new Date().toISOString().slice(0, 10);
  await put(`lead-fallbacks/${date}/${id}.json`, JSON.stringify({ id, receivedAt: new Date().toISOString(), reason, payload: body }), {
    access: "private",
    addRandomSuffix: false,
    contentType: "application/json",
  });
  return id;
}

async function failOpen(body: LeadBody, reason: string) {
  try {
    await saveFallback(body, reason);
    return NextResponse.json({ ok: true }, { status: 202 });
  } catch {
    return NextResponse.json({ ok: false }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!validLeadBody(body)) return NextResponse.json({ ok: false }, { status: 400 });
  const secret = process.env.FUNNEL_CRM_API_SECRET || process.env.CRM_API_SECRET;
  if (!secret) return failOpen(body, "crm-secret-not-configured");

  try {
    const response = await fetch(crmEndpoint, {
      method: "POST",
      headers: { authorization: `Bearer ${secret}`, "content-type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    if (!response.ok) return failOpen(body, `crm-rejected-${response.status}`);
    const relay = NextResponse.json({ ok: true }, { status: 201 });
    if (body.funnel === "website-migration" && body.qualification === "qualified" && typeof body.email === "string") {
      relay.cookies.set(migrationBookingCookie, createMigrationBookingAccess(body.email, secret), {
        httpOnly: true,
        sameSite: "lax",
        secure: true,
        path: "/websites/book-call",
        maxAge: migrationBookingMaxAge,
      });
    }
    return relay;
  } catch {
    return failOpen(body, "crm-unreachable");
  }
}
