import { createHmac, timingSafeEqual } from "node:crypto";

export const migrationBookingCookie = "dgc_migration_booking";
const bookingAccessLifetimeSeconds = 60 * 60;

function signature(value: string, secret: string) {
  return createHmac("sha256", secret).update(value).digest("base64url");
}

export function createMigrationBookingAccess(email: string, secret: string) {
  const payload = Buffer.from(JSON.stringify({ email: email.toLowerCase(), expiresAt: Date.now() + bookingAccessLifetimeSeconds * 1000 })).toString("base64url");
  return `${payload}.${signature(payload, secret)}`;
}

export function hasMigrationBookingAccess(value: string | undefined, secret: string | undefined) {
  if (!value || !secret) return false;
  const [payload, receivedSignature, ...rest] = value.split(".");
  if (!payload || !receivedSignature || rest.length) return false;
  const expectedSignature = signature(payload, secret);
  if (receivedSignature.length !== expectedSignature.length || !timingSafeEqual(Buffer.from(receivedSignature), Buffer.from(expectedSignature))) return false;
  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { email?: unknown; expiresAt?: unknown };
    return typeof parsed.email === "string" && typeof parsed.expiresAt === "number" && parsed.expiresAt > Date.now();
  } catch {
    return false;
  }
}

export const migrationBookingMaxAge = bookingAccessLifetimeSeconds;
