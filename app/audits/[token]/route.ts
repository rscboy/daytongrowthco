import { createHmac, timingSafeEqual } from "node:crypto";
import { issueSignedToken, presignUrl } from "@vercel/blob";
import { NextRequest } from "next/server";

export const runtime = "nodejs";

const TOKEN_PATTERN = /^[a-f0-9]{64}$/;
const MAX_LINK_LIFETIME_SECONDS = 60 * 60 * 24 * 7;

function signatureFor(token: string, expiresAt: string) {
  const secret = process.env.AUDIT_DOWNLOAD_SECRET;
  if (!secret) return null;
  return createHmac("sha256", secret).update(`${token}.${expiresAt}`).digest("hex");
}

function signaturesMatch(expected: string, received: string | null) {
  if (!received || !/^[a-f0-9]{64}$/.test(received)) return false;
  return timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(received, "hex"));
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const expiresAt = request.nextUrl.searchParams.get("expires");
  const signature = request.nextUrl.searchParams.get("signature");
  const expiresAtMs = Number(expiresAt);
  const now = Date.now();

  if (
    !TOKEN_PATTERN.test(token) ||
    !expiresAt ||
    !Number.isSafeInteger(expiresAtMs) ||
    expiresAtMs <= now ||
    expiresAtMs > now + MAX_LINK_LIFETIME_SECONDS * 1000
  ) {
    return new Response("This audit link has expired.", { status: 410 });
  }

  const expected = signatureFor(token, expiresAt);
  if (!expected || !signaturesMatch(expected, signature)) {
    return new Response("This audit link is invalid.", { status: 404 });
  }

  const pathname = `migration-audits/${token}.pdf`;
  const signedToken = await issueSignedToken({ pathname, operations: ["get"], validUntil: expiresAtMs });
  const { presignedUrl } = await presignUrl(signedToken, { pathname, operation: "get", validUntil: expiresAtMs, access: "private", useCache: false });
  const file = await fetch(presignedUrl);
  if (!file.ok || !file.body) return new Response("This audit is no longer available.", { status: 404 });

  return new Response(file.body, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'inline; filename="Website-Migration-Readiness-Audit.pdf"',
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
