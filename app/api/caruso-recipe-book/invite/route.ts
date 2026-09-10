import { cookies } from "next/headers";
import {
  hasSecretProjectsSession,
  secretProjectsCookie,
} from "@/lib/secret-projects-auth";
import { createGuestRecipeCode } from "../access";

export const runtime = "nodejs";

export async function POST() {
  const cookieStore = await cookies();
  const authenticated = hasSecretProjectsSession(
    cookieStore.get(secretProjectsCookie)?.value,
  );
  if (!authenticated) {
    return Response.json(
      { ok: false, error: "Unauthorized." },
      { status: 401, headers: { "Cache-Control": "no-store" } },
    );
  }

  try {
    const { code, expiresAt } = createGuestRecipeCode();
    return Response.json({ ok: true, code, expiresAt }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return Response.json({ ok: false, error: error instanceof Error ? error.message : "Could not create a guest code." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
