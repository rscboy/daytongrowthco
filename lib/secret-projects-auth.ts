import { createHmac, timingSafeEqual } from "node:crypto";

export const secretProjectsCookie = "dgc_secret_projects";
export const secretProjectsSessionSeconds = 60 * 60 * 24 * 14;

function configuredPassword() {
  return process.env.SECRET_PROJECTS_PASSWORD?.trim() || "";
}

function sessionSecret() {
  return process.env.SECRET_PROJECTS_SESSION_SECRET?.trim() || "";
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  if (leftBuffer.length !== rightBuffer.length) return false;
  return timingSafeEqual(leftBuffer, rightBuffer);
}

function signature(expiresAt: string, secret: string) {
  return createHmac("sha256", secret).update(`secret-projects.${expiresAt}`).digest("base64url");
}

export function secretProjectsConfigured() {
  return Boolean(configuredPassword() && sessionSecret());
}

export function passwordMatches(candidate: string) {
  const expected = configuredPassword();
  return Boolean(expected) && safeEqual(candidate, expected);
}

export function createSecretProjectsSession() {
  const secret = sessionSecret();
  if (!secret) return null;
  const expiresAt = String(Math.floor(Date.now() / 1000) + secretProjectsSessionSeconds);
  return `${expiresAt}.${signature(expiresAt, secret)}`;
}

export function hasSecretProjectsSession(value: string | undefined) {
  const secret = sessionSecret();
  if (!value || !secret) return false;
  const [expiresAt, suppliedSignature] = value.split(".");
  if (!expiresAt || !suppliedSignature) return false;
  const expiry = Number(expiresAt);
  if (!Number.isFinite(expiry) || expiry <= Math.floor(Date.now() / 1000)) return false;
  return safeEqual(suppliedSignature, signature(expiresAt, secret));
}
