import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

const INVITE_PREFIX = "CRB1";
const INVITE_TTL_SECONDS = 60 * 60 * 24 * 60;

function safeEqual(left: string, right: string) {
  const leftBytes = Buffer.from(left);
  const rightBytes = Buffer.from(right);
  return leftBytes.length === rightBytes.length && timingSafeEqual(leftBytes, rightBytes);
}

function inviteSecret() {
  const secret = process.env.CARUSO_RECIPE_INVITE_SECRET;
  if (!secret || secret.length < 32) throw new Error("Guest recipe codes are not configured.");
  return secret;
}

function signature(payload: string) {
  return createHmac("sha256", inviteSecret()).update(payload).digest("base64url").slice(0, 22);
}

export function createGuestRecipeCode() {
  const expiresAt = Math.floor(Date.now() / 1_000) + INVITE_TTL_SECONDS;
  const payload = [INVITE_PREFIX, expiresAt.toString(36), randomBytes(15).toString("base64url")].join(".");
  return { code: `${payload}.${signature(payload)}`, expiresAt };
}

function validGuestRecipeCode(value: string) {
  const [prefix, expiry, nonce, suppliedSignature, ...extra] = value.split(".");
  if (prefix !== INVITE_PREFIX || !expiry || !nonce || !suppliedSignature || extra.length > 0 || !/^[A-Za-z0-9_-]{16,}$/.test(nonce) || !/^[A-Za-z0-9_-]{22}$/.test(suppliedSignature)) return false;
  const expiresAt = Number.parseInt(expiry, 36);
  if (!Number.isSafeInteger(expiresAt) || expiresAt <= Math.floor(Date.now() / 1_000)) return false;
  try {
    return safeEqual(suppliedSignature, signature([prefix, expiry, nonce].join(".")));
  } catch {
    return false;
  }
}

export function authorizedRecipeAccess(request: Request) {
  const supplied = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  const masterToken = process.env.CARUSO_RECIPE_ADD_TOKEN;
  return Boolean(masterToken && safeEqual(supplied, masterToken)) || validGuestRecipeCode(supplied);
}
