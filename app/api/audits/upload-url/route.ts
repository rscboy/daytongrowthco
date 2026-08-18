import { timingSafeEqual } from "node:crypto";
import { issueSignedToken, presignUrl } from "@vercel/blob";

export const runtime = "nodejs";

const TOKEN_PATTERN = /^[a-f0-9]{64}$/;
const UPLOAD_URL_LIFETIME_MS = 15 * 60 * 1000;

function authorized(request: Request) {
  const secret = process.env.AUDIT_UPLOAD_SECRET;
  const value = request.headers.get("authorization");
  if (!secret || !value?.startsWith("Bearer ")) return false;
  const received = Buffer.from(value.slice(7));
  const expected = Buffer.from(secret);
  return received.length === expected.length && timingSafeEqual(received, expected);
}

export async function POST(request: Request) {
  if (!authorized(request)) return new Response("Unauthorized", { status: 401 });

  const body = (await request.json().catch(() => null)) as { token?: unknown } | null;
  if (typeof body?.token !== "string" || !TOKEN_PATTERN.test(body.token)) {
    return new Response("Invalid upload request", { status: 400 });
  }

  const pathname = `migration-audits/${body.token}.pdf`;
  const signedToken = await issueSignedToken({ operations: ["put"] });
  const { presignedUrl } = await presignUrl(signedToken, {
    pathname,
    operation: "put",
    validUntil: Date.now() + UPLOAD_URL_LIFETIME_MS,
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: false,
  });

  return Response.json({ uploadUrl: presignedUrl });
}
